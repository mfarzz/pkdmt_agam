<?php

namespace App\Http\Controllers;

use App\Models\DmtData;
use App\Models\DmtLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

class DmtController extends Controller
{
    /**
     * Display admin page for managing DMT Google Sheet link.
     */
    public function index(Request $request): Response
    {
        $disasterId = $request->session()->get('admin_active_disaster_id');
        $dmtLink = DmtLink::where('disaster_id', $disasterId)->first();
        
        $totalDmt = $dmtLink ? DmtData::where('dmt_link_id', $dmtLink->id)->count() : 0;

        return Inertia::render('admin/kelola-dmt', [
            'dmtLink' => $dmtLink,
            'totalDmt' => $totalDmt,
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
        ]);
    }

    /**
     * Display public page showing DMT information.
     */
    public function public(Request $request): Response
    {
        $perPage = $request->get('per_page', 10);
        $page = $request->get('page', 1);
        
        // Get active disaster
        $activeDisaster = \App\Models\Disaster::where('is_active', true)->first();
        
        $query = DmtData::whereRaw('1 = 0');
        
        if ($activeDisaster) {
            $query = DmtData::whereHas('dmtLink', function($q) use ($activeDisaster) {
                $q->where('disaster_id', $activeDisaster->id);
            });
        }
        
        // Get statistics
        $totalAktif = (clone $query)->where('status_penugasan', 'Aktif')->count();
        $totalSelesai = (clone $query)->where('status_penugasan', '!=', 'Aktif')
            ->whereNotNull('status_penugasan')
            ->count();
        $totalTim = (clone $query)->count();
        
        // Get paginated data ordered by id
        $dmtData = $query->orderBy('id', 'asc')
            ->paginate($perPage, ['*'], 'page', $page);

        return Inertia::render('informasi', [
            'dmtData' => $dmtData,
            'statistics' => [
                'total_aktif' => $totalAktif,
                'total_selesai' => $totalSelesai,
                'total_tim' => $totalTim,
            ],
            'activeDisasterName' => $activeDisaster ? $activeDisaster->name : null,
        ]);
    }

    /**
     * Store or update DMT Google Sheet link and scan data.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'gdrive_url' => ['required', 'url', 'max:500'],
        ]);

        $disasterId = $request->session()->get('admin_active_disaster_id');

        DmtLink::updateOrCreate(
            ['disaster_id' => $disasterId],
            ['gdrive_url' => $validated['gdrive_url']]
        );

        try {
            $this->scanSheetData($validated['gdrive_url']);
            return redirect()->route('kelola-dmt')->with('success', 'Link Google Sheet berhasil disimpan dan data telah di-scan.');
        } catch (\Exception $e) {
            \Log::error('Failed to scan sheet: ' . $e->getMessage());
            return redirect()->route('kelola-dmt')->with('error', 'Link berhasil disimpan, namun terjadi kesalahan saat scan: ' . $e->getMessage());
        }
    }

    /**
     * Scan sheet and refresh DMT data.
     */
    public function scan(Request $request): RedirectResponse
    {
        $disasterId = $request->session()->get('admin_active_disaster_id');
        $dmtLink = DmtLink::where('disaster_id', $disasterId)->first();
        
        if (!$dmtLink) {
            return redirect()->route('kelola-dmt')->with('error', 'Link Google Sheet belum diatur.');
        }

        try {
            $this->scanSheetData($dmtLink->gdrive_url);
            return redirect()->route('kelola-dmt')->with('success', 'Data DMT berhasil di-scan ulang.');
        } catch (\Exception $e) {
            \Log::error('Failed to scan sheet: ' . $e->getMessage());
            return redirect()->route('kelola-dmt')->with('error', 'Gagal scan sheet: ' . $e->getMessage());
        }
    }

    /**
     * Auto-scan DMT sheet (public endpoint).
     */
    public function autoScan(Request $request): JsonResponse
    {
        try {
            // Get active disaster
            $activeDisaster = \App\Models\Disaster::where('is_active', true)->first();
            if (!$activeDisaster) {
                 return response()->json([
                    'success' => false,
                    'message' => 'Tidak ada bencana aktif.',
                ], 404);
            }

            $dmtLink = DmtLink::where('disaster_id', $activeDisaster->id)->first();
            
            if (!$dmtLink) {
                return response()->json([
                    'success' => false,
                    'message' => 'Link Google Sheet belum diatur.',
                ], 400);
            }

            $this->scanSheetData($dmtLink->gdrive_url);
            
            return response()->json([
                'success' => true,
                'message' => 'Data DMT berhasil di-scan ulang.',
            ]);
        } catch (\Exception $e) {
            \Log::error('Auto-scan DMT failed: ' . $e->getMessage());
            \Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Gagal scan sheet: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete DMT link and all associated data.
     */
    public function destroy(DmtLink $dmtLink): RedirectResponse
    {
        // Delete all DMT data
        DmtData::truncate();
        
        // Delete the link
        $dmtLink->delete();

        return redirect()->route('kelola-dmt')->with('success', 'Link DMT dan semua data terkait berhasil dihapus.');
    }

    /**
     * Scan Google Sheet and save DMT data.
     */
    private function scanSheetData(string $sheetUrl): void
    {
        $apiKey = config('services.google.drive_api_key');
        if (!$apiKey) {
            throw new \Exception('Google Drive API key belum dikonfigurasi.');
        }

        $sheetId = $this->extractSheetId($sheetUrl);
        if (!$sheetId) {
            throw new \Exception('Format link Google Sheet tidak valid.');
        }

        // Read data from Google Sheet
        $data = $this->readSheetData($sheetId, $apiKey);
        
        // Clear existing data
        DmtData::truncate();

        $disasterId = request()->session()->get('admin_active_disaster_id');
        // If triggered from public autoScan, use active disaster
        if (!$disasterId) {
             $activeDisaster = \App\Models\Disaster::where('is_active', true)->first();
             $disasterId = $activeDisaster ? $activeDisaster->id : null;
        }

        // Get or create DMT link
        $dmtLink = DmtLink::where('disaster_id', $disasterId)->first();
        if (!$dmtLink) {
            // Create link if doesn't exist
            $dmtLink = DmtLink::create([
                'gdrive_url' => $sheetUrl,
                'disaster_id' => $disasterId
            ]);
        }

        // Save new data
        foreach ($data as $row) {
            $row['dmt_link_id'] = $dmtLink->id;
            DmtData::create($row);
        }
    }

    /**
     * Extract Sheet ID from Google Sheets URL.
     */
    private function extractSheetId(string $url): ?string
    {
        // Format: https://docs.google.com/spreadsheets/d/SHEET_ID/edit
        if (preg_match('/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/', $url, $matches)) {
            return $matches[1];
        }
        return null;
    }

    /**
     * Read data from Google Sheet.
     */
    private function readSheetData(string $sheetId, string $apiKey): array
    {
        $url = "https://sheets.googleapis.com/v4/spreadsheets/{$sheetId}/values/A1:ZZ1000";
        
        $verifySSL = env('GOOGLE_DRIVE_VERIFY_SSL', env('APP_ENV') === 'production');

        $response = Http::withOptions([
            'verify' => $verifySSL,
            'headers' => [
                'Referer' => request()->getSchemeAndHttpHost(),
            ],
        ])->get($url, [
            'key' => $apiKey,
        ]);

        if (!$response->successful()) {
            throw new \Exception('Gagal mengambil data dari Google Sheets API: ' . ($response->json()['error']['message'] ?? 'Unknown error'));
        }

        $values = $response->json('values', []);
        
        if (empty($values)) {
            return [];
        }

        // First row is header
        $headers = array_map('trim', $values[0]);
        
        // Map header names to database columns
        $headerMap = [
            'Nama Disaster Medical Team (DMT)' => 'nama_dmt',
            'Nama Ketua Tim' => 'nama_ketua_tim',
            'Status Penugasan' => 'status_penugasan',
            'Tanggal Kedatangan' => 'tanggal_kedatangan',
            'Masa Penugasan (hari)' => 'masa_penugasan_hari',
            'Tanggal Pelayanan Dimulai' => 'tanggal_pelayanan_dimulai',
            'Tanggal Pelayanan Diakhiri' => 'tanggal_pelayanan_diakhiri',
            'Rencana Tanggal Kepulangan' => 'rencana_tanggal_kepulangan',
            'Nama Nara Hubung' => 'nama_nara_hubung',
            'Posisi / Jabatan' => 'posisi_jabatan',
            'Alamat Email' => 'email',
            'Nomor HP / WhatsApp' => 'nomor_hp',
            'Kapasitas Rawat Jalan (pasien/hari)' => 'kapasitas_rawat_jalan',
            'Kapasitas Rawat Inap (pasien/hari)' => 'kapasitas_rawat_inap',
            'Kapasitas Operasi Bedah Mayor (kasus/hari)' => 'kapasitas_operasi_bedah_mayor',
            'Kapasitas Operasi Bedah Minor (kasus/hari)' => 'kapasitas_operasi_bedah_minor',
            'Jenis Layanan yang Tersedia (Pilih semua yang berlaku)' => 'jenis_layanan_tersedia',
            'Jumlah Dokter Umum' => 'jumlah_dokter_umum',
            'Rincian Dokter Spesialis (Tuliskan: Jenis Spesialis - Jumlah)' => 'rincian_dokter_spesialis',
            'Jumlah Perawat' => 'jumlah_perawat',
            'Jumlah Bidan' => 'jumlah_bidan',
            'Jumlah Apoteker / Asisten Apoteker' => 'jumlah_apoteker',
            'Jumlah Psikolog' => 'jumlah_psikolog',
            'Jumlah Staf Logistik' => 'jumlah_staf_logistik',
            'Jumlah Staf Administrasi' => 'jumlah_staf_administrasi',
            'Jumlah Petugas Keamanan (Security)' => 'jumlah_petugas_keamanan',
            'Timestamp' => 'timestamp',
        ];

        $result = [];
        
        // Process data rows (skip header row)
        for ($i = 1; $i < count($values); $i++) {
            $row = $values[$i];
            $rowData = [];
            
            // Map each column
            foreach ($headers as $colIndex => $headerName) {
                $value = isset($row[$colIndex]) ? trim($row[$colIndex]) : null;
                
                if (isset($headerMap[$headerName])) {
                    $dbColumn = $headerMap[$headerName];
                    
                    // Process different data types
                    if (strpos($dbColumn, 'tanggal') !== false || $dbColumn === 'timestamp') {
                        // Parse date
                        $rowData[$dbColumn] = $this->parseDate($value);
                    } elseif (strpos($dbColumn, 'jumlah_') === 0 || strpos($dbColumn, 'kapasitas_') === 0 || $dbColumn === 'masa_penugasan_hari') {
                        // Parse integer
                        $rowData[$dbColumn] = $this->parseInteger($value);
                    } else {
                        // String value
                        $rowData[$dbColumn] = $value ?: null;
                    }
                }
            }
            
            // Only add if nama_dmt is not empty
            if (!empty($rowData['nama_dmt'])) {
                $result[] = $rowData;
            }
        }

        return $result;
    }

    /**
     * Parse date string to Carbon date.
     */
    private function parseDate(?string $dateString): ?string
    {
        if (empty($dateString)) {
            return null;
        }

        // Try to parse Excel date serial number
        if (is_numeric($dateString)) {
            try {
                // Excel date serial number (days since 1900-01-01)
                $excelEpoch = Carbon::create(1899, 12, 30);
                $date = $excelEpoch->addDays((int)$dateString);
                return $date->format('Y-m-d');
            } catch (\Exception $e) {
                return null;
            }
        }

        // Try various date formats
        $formats = [
            'm/d/Y',
            'd/m/Y',
            'Y-m-d',
            'd-m-Y',
            'm-d-Y',
        ];

        foreach ($formats as $format) {
            try {
                $date = Carbon::createFromFormat($format, $dateString);
                return $date->format('Y-m-d');
            } catch (\Exception $e) {
                continue;
            }
        }

        return null;
    }

    /**
     * Parse integer from string.
     */
    private function parseInteger(?string $value): ?int
    {
        if (empty($value)) {
            return null;
        }

        // Remove non-numeric characters except minus sign
        $cleaned = preg_replace('/[^0-9-]/', '', $value);
        
        if ($cleaned === '' || $cleaned === '-') {
            return null;
        }

        return (int)$cleaned;
    }
}
