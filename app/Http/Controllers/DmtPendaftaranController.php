<?php

namespace App\Http\Controllers;

use App\Models\DmtData;
use App\Models\Disaster;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DmtPendaftaranController extends Controller
{
    /**
     * Display the DMT registration management page.
     */
    public function index(Request $request): Response
    {
        $disasterId = $request->session()->get('admin_active_disaster_id');
        $perPage = $request->get('per_page', 10);
        $page = $request->get('page', 1);
        $search = $request->get('search', '');
        $statusFilter = $request->get('status', '');
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');

        // Get paginated registrations for active disaster
        $query = DmtData::query();

        // Filter by disaster_id
        if ($disasterId) {
            $query->where('disaster_id', $disasterId);
        } else {
            // If no disaster selected, show no data
            $query->whereRaw('1 = 0');
        }

        // Apply search filter
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_dmt', 'like', "%{$search}%")
                  ->orWhere('nama_ketua_tim', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('nomor_hp', 'like', "%{$search}%");
            });
        }

        // Apply status filter
        if ($statusFilter) {
            $query->where('status_pendaftaran', $statusFilter);
        }

        // Apply sorting
        $allowedSortColumns = ['nama_dmt', 'nama_ketua_tim', 'status_pendaftaran', 'tanggal_kedatangan', 'email', 'created_at'];
        $sortBy = in_array($sortBy, $allowedSortColumns) ? $sortBy : 'created_at';
        $sortOrder = in_array($sortOrder, ['asc', 'desc']) ? $sortOrder : 'desc';

        $query->orderBy($sortBy, $sortOrder);

        $registrations = $query->paginate($perPage, ['*'], 'page', $page)
            ->through(function ($registration) {
                return [
                    'id' => $registration->id,
                    'nama_dmt' => $registration->nama_dmt,
                    'nama_ketua_tim' => $registration->nama_ketua_tim,
                    'status_pendaftaran' => $registration->status_pendaftaran,
                    'status_penugasan' => $registration->calculateStatusFromDates(),
                    'tanggal_kedatangan' => $registration->tanggal_kedatangan?->format('Y-m-d'),
                    'email' => $registration->email,
                    'nomor_hp' => $registration->nomor_hp,
                    'created_at' => $registration->created_at?->format('Y-m-d H:i:s'),
                    'updated_at' => $registration->updated_at?->format('Y-m-d H:i:s'),
                ];
            })
            ->withQueryString();

        return Inertia::render('admin/kelola-pendaftaran', [
            'registrations' => $registrations,
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
        ]);
    }

    /**
     * Show a single registration.
     */
    public function show(DmtData $dmtData): Response
    {

        return Inertia::render('admin/detail-pendaftaran', [
            'registration' => [
                'id' => $dmtData->id,
                'nama_dmt' => $dmtData->nama_dmt,
                'nama_ketua_tim' => $dmtData->nama_ketua_tim,
                'status_penugasan' => $dmtData->status_penugasan,
                'status_pendaftaran' => $dmtData->status_pendaftaran,
                'tanggal_kedatangan' => $dmtData->tanggal_kedatangan?->format('Y-m-d'),
                'masa_penugasan_hari' => $dmtData->masa_penugasan_hari,
                'tanggal_pelayanan_dimulai' => $dmtData->tanggal_pelayanan_dimulai?->format('Y-m-d'),
                'tanggal_pelayanan_diakhiri' => $dmtData->tanggal_pelayanan_diakhiri?->format('Y-m-d'),
                'rencana_tanggal_kepulangan' => $dmtData->rencana_tanggal_kepulangan?->format('Y-m-d'),
                'nama_nara_hubung' => $dmtData->nama_nara_hubung,
                'posisi_jabatan' => $dmtData->posisi_jabatan,
                'email' => $dmtData->email,
                'nomor_hp' => $dmtData->nomor_hp,
                'kapasitas_rawat_jalan' => $dmtData->kapasitas_rawat_jalan,
                'kapasitas_rawat_inap' => $dmtData->kapasitas_rawat_inap,
                'kapasitas_operasi_bedah_mayor' => $dmtData->kapasitas_operasi_bedah_mayor,
                'kapasitas_operasi_bedah_minor' => $dmtData->kapasitas_operasi_bedah_minor,
                'jenis_layanan_tersedia' => $dmtData->jenis_layanan_tersedia,
                'jumlah_dokter_umum' => $dmtData->jumlah_dokter_umum,
                'rincian_dokter_spesialis' => $dmtData->rincian_dokter_spesialis,
                'jumlah_perawat' => $dmtData->jumlah_perawat,
                'jumlah_bidan' => $dmtData->jumlah_bidan,
                'jumlah_apoteker' => $dmtData->jumlah_apoteker,
                'jumlah_psikolog' => $dmtData->jumlah_psikolog,
                'jumlah_staf_logistik' => $dmtData->jumlah_staf_logistik,
                'jumlah_staf_administrasi' => $dmtData->jumlah_staf_administrasi,
                'jumlah_petugas_keamanan' => $dmtData->jumlah_petugas_keamanan,
                'logistik_non_medis' => $dmtData->logistik_non_medis,
                'logistik_non_medis_files' => $dmtData->logistik_non_medis_files ? array_map(function ($file) {
                    return [
                        'path' => $file,
                        'url' => Storage::url($file),
                        'name' => basename($file),
                    ];
                }, $dmtData->logistik_non_medis_files) : [],
                'logistik_medis' => $dmtData->logistik_medis,
                'logistik_medis_files' => $dmtData->logistik_medis_files ? array_map(function ($file) {
                    return [
                        'path' => $file,
                        'url' => Storage::url($file),
                        'name' => basename($file),
                    ];
                }, $dmtData->logistik_medis_files) : [],
                'surat_tugas_file' => $dmtData->surat_tugas_file ? [
                    'path' => $dmtData->surat_tugas_file,
                    'url' => Storage::url($dmtData->surat_tugas_file),
                    'name' => basename($dmtData->surat_tugas_file),
                ] : null,
                'scan_str_file' => $dmtData->scan_str_file ? [
                    'path' => $dmtData->scan_str_file,
                    'url' => Storage::url($dmtData->scan_str_file),
                    'name' => basename($dmtData->scan_str_file),
                ] : null,
                'daftar_nama_anggota_file' => $dmtData->daftar_nama_anggota_file ? [
                    'path' => $dmtData->daftar_nama_anggota_file,
                    'url' => Storage::url($dmtData->daftar_nama_anggota_file),
                    'name' => basename($dmtData->daftar_nama_anggota_file),
                ] : null,
                'created_at' => $dmtData->created_at?->format('Y-m-d H:i:s'),
                'updated_at' => $dmtData->updated_at?->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    /**
     * Update registration status.
     */
    public function updateStatus(Request $request, DmtData $dmtData): RedirectResponse
    {
        $validated = $request->validate([
            'status_pendaftaran' => ['required', 'string', 'in:pending,approved,rejected'],
        ]);

        // Map status_pendaftaran to status_penugasan
        $statusPenugasanMap = [
            'pending' => 'Pending',
            'approved' => null, // Will be calculated from dates
            'rejected' => 'Dibatalkan',
        ];

        $updateData = [
            'status_pendaftaran' => $validated['status_pendaftaran'],
        ];

        // If approved, calculate status from dates
        if ($validated['status_pendaftaran'] === 'approved') {
            $calculatedStatus = $dmtData->calculateStatusFromDates();
            if ($calculatedStatus) {
                $updateData['status_penugasan'] = $calculatedStatus;
            } else {
                $updateData['status_penugasan'] = 'Aktif'; // Default fallback
            }
        } else {
            $updateData['status_penugasan'] = $statusPenugasanMap[$validated['status_pendaftaran']];
        }

        $dmtData->update($updateData);

        $statusText = match($validated['status_pendaftaran']) {
            'approved' => 'disetujui',
            'rejected' => 'ditolak',
            default => 'ditinjau',
        };

        // Preserve query parameters (page, search, status, sort)
        return redirect()->route('kelola-pendaftaran', $request->only(['page', 'search', 'status', 'sort_by', 'sort_order']))
            ->with('success', "Pendaftaran berhasil {$statusText}.");
    }

    /**
     * Delete a registration.
     */
    public function destroy(Request $request, DmtData $dmtData): RedirectResponse
    {
        // Delete associated files
        if ($dmtData->surat_tugas_file) {
            Storage::disk('public')->delete($dmtData->surat_tugas_file);
        }
        if ($dmtData->scan_str_file) {
            Storage::disk('public')->delete($dmtData->scan_str_file);
        }
        if ($dmtData->daftar_nama_anggota_file) {
            Storage::disk('public')->delete($dmtData->daftar_nama_anggota_file);
        }
        if ($dmtData->logistik_non_medis_files) {
            foreach ($dmtData->logistik_non_medis_files as $file) {
                Storage::disk('public')->delete($file);
            }
        }
        if ($dmtData->logistik_medis_files) {
            foreach ($dmtData->logistik_medis_files as $file) {
                Storage::disk('public')->delete($file);
            }
        }

        $dmtData->delete();

        // Preserve query parameters (page, search, status, sort)
        return redirect()->route('kelola-pendaftaran', $request->only(['page', 'search', 'status', 'sort_by', 'sort_order']))
            ->with('success', 'Pendaftaran berhasil dihapus.');
    }
    /**
     * Export registrations to CSV.
     */
    public function export(Request $request): StreamedResponse
    {
        $disasterId = $request->session()->get('admin_active_disaster_id');
        $search = $request->get('search', '');
        $statusFilter = $request->get('status', '');

        // Get registrations for active disaster
        $query = DmtData::query();

        if ($disasterId) {
            $query->where('disaster_id', $disasterId);
        } else {
            $query->whereRaw('1 = 0');
        }

        // Apply filters to match the view
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('nama_dmt', 'like', "%{$search}%")
                  ->orWhere('nama_ketua_tim', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('nomor_hp', 'like', "%{$search}%");
            });
        }

        if ($statusFilter) {
            $query->where('status_pendaftaran', $statusFilter);
        }

        $registrations = $query->orderBy('created_at', 'desc')->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="data_pendaftaran_dmt_' . date('Y-m-d_H-i-s') . '.csv"',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $callback = function () use ($registrations) {
            $file = fopen('php://output', 'w');

            // Add BOM for Excel compatibility
            fputs($file, "\xEF\xBB\xBF");

            // Header row
            fputcsv($file, [
                'No',
                'Nama DMT',
                'Nama Ketua Tim',
                'Status Pendaftaran',
                'Status Penugasan',
                'Tanggal Kedatangan',
                'Email',
                'Nomor HP',
                'Tanggal Daftar',
                'Masa Penugasan (Hari)',
                'Rencana Kepulangan',
                'Jumlah Dokter Umum',
                'Jumlah Perawat',
                'Jumlah Bidan',
                'Jumlah Apoteker',
                'Jumlah Psikolog',
                'Jumlah Staf Logistik',
                'Jumlah Staf Admin',
                'Jumlah Petugas Keamanan'
            ]);

            foreach ($registrations as $index => $row) {
                fputcsv($file, [
                    $index + 1,
                    $row->nama_dmt,
                    $row->nama_ketua_tim,
                    $row->status_pendaftaran,
                    $row->calculateStatusFromDates() ?? '-',
                    $row->tanggal_kedatangan ? $row->tanggal_kedatangan->format('Y-m-d') : '-',
                    $row->email,
                    $row->nomor_hp,
                    $row->created_at ? $row->created_at->format('Y-m-d H:i:s') : '-',
                    $row->masa_penugasan_hari ?? '-',
                    $row->rencana_tanggal_kepulangan ? $row->rencana_tanggal_kepulangan->format('Y-m-d') : '-',
                    $row->jumlah_dokter_umum ?? 0,
                    $row->jumlah_perawat ?? 0,
                    $row->jumlah_bidan ?? 0,
                    $row->jumlah_apoteker ?? 0,
                    $row->jumlah_psikolog ?? 0,
                    $row->jumlah_staf_logistik ?? 0,
                    $row->jumlah_staf_administrasi ?? 0,
                    $row->jumlah_petugas_keamanan ?? 0,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Sync registrations from Google Spreadsheet.
     */
    public function sync(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'spreadsheet_url' => ['required', 'url'],
        ]);

        $spreadsheetUrl = $validated['spreadsheet_url'];
        $disasterId = $request->session()->get('admin_active_disaster_id');

        if (!$disasterId) {
            return redirect()->route('kelola-pendaftaran')
                ->with('error', 'Tidak ada bencana aktif yang dipilih.');
        }

        try {
            // Extract spreadsheet ID from URL
            // Support formats:
            // https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit
            // https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit#gid=0
            preg_match('/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/', $spreadsheetUrl, $matches);

            if (empty($matches[1])) {
                return redirect()->route('kelola-pendaftaran')
                    ->with('error', 'URL spreadsheet tidak valid. Pastikan URL adalah link Google Spreadsheet yang valid.');
            }

            $spreadsheetId = $matches[1];

            // Get API key from config
            $apiKey = config('services.google.drive_api_key');
            if (!$apiKey) {
                return redirect()->route('kelola-pendaftaran')
                    ->with('error', 'Google Drive API key belum dikonfigurasi. Silakan set GOOGLE_DRIVE_API_KEY di file .env');
            }

            // Read sheet data using Google Sheets API v4
            Log::info('=== START SYNC PROCESS ===');
            Log::info('Spreadsheet URL: ' . $spreadsheetUrl);
            Log::info('Spreadsheet ID: ' . $spreadsheetId);
            Log::info('Disaster ID: ' . $disasterId);

            $sheetData = $this->readSheetData($spreadsheetId, $apiKey);

            Log::info('Sheet data received: ' . count($sheetData) . ' rows');

            if (empty($sheetData)) {
                Log::warning('Sheet data is empty after processing');
                return redirect()->route('kelola-pendaftaran')
                    ->with('error', 'Spreadsheet tidak memiliki data atau format tidak valid.');
            }

            // Log first few rows for debugging
            Log::info('First 3 rows of processed data:', array_slice($sheetData, 0, 3));

            // Get initial count before sync
            $initialCount = DmtData::where('disaster_id', $disasterId)->count();
            Log::info("Initial data count in database: {$initialCount}");

            // Process data rows
            $syncedCount = 0;
            $createdCount = 0;
            $updatedCount = 0;
            $skippedCount = 0;
            $errors = [];
            $createdIds = [];
            $updatedIds = [];

            foreach ($sheetData as $rowIndex => $rowData) {
                try {
                    // Skip if nama_dmt is empty
                    if (empty($rowData['nama_dmt'])) {
                        Log::warning("Row " . ($rowIndex + 2) . " skipped: nama_dmt is empty");
                        $skippedCount++;
                        continue;
                    }

                    $namaDmt = $rowData['nama_dmt'];
                    $email = $rowData['email'] ?? null;

                    Log::info("Processing row " . ($rowIndex + 2) . ": {$namaDmt}" . ($email ? " ({$email})" : ""));

                    // Check if registration already exists
                    // Check by combination of email AND nama_dmt (both must match)
                    $existing = null;
                    $foundBy = null;

                    $query = DmtData::where('disaster_id', $disasterId)
                        ->where('nama_dmt', $namaDmt);

                    if ($email) {
                        $query->where('email', $email);
                    }

                    $existing = $query->first();

                    if ($existing) {
                        $foundBy = $email ? 'email+nama_dmt' : 'nama_dmt';
                        Log::info("  -> Found existing by {$foundBy}: ID {$existing->id}, nama_dmt: {$existing->nama_dmt}, email: " . ($existing->email ?? 'null'));
                    } else {
                        Log::info("  -> No existing record found (nama_dmt: {$namaDmt}" . ($email ? ", email: {$email}" : "") . "), will create new");
                    }

                    // Prepare data array
                    $data = array_merge([
                        'disaster_id' => $disasterId,
                    ], $rowData);

                    // Set default status_pendaftaran for new records
                    if (!$existing) {
                        $data['status_pendaftaran'] = 'pending';
                    }

                    if ($existing) {
                        // Update existing record - only update non-null values
                        $updateData = array_filter($data, function($value) {
                            return $value !== null && $value !== '';
                        });
                        unset($updateData['disaster_id']); // Don't update disaster_id
                        if (!empty($updateData)) {
                            $beforeUpdate = $existing->toArray();
                            $existing->update($updateData);
                            $updatedCount++;
                            $updatedIds[] = $existing->id;
                            Log::info("  -> Updated record ID {$existing->id}");

                            // Verify update
                            $existing->refresh();
                            $afterUpdate = $existing->toArray();
                            $changedFields = [];
                            foreach ($updateData as $key => $value) {
                                if (isset($beforeUpdate[$key]) && $beforeUpdate[$key] != $value) {
                                    $changedFields[$key] = ['before' => $beforeUpdate[$key], 'after' => $value];
                                }
                            }
                            if (!empty($changedFields)) {
                                Log::info("  -> Changed fields:", $changedFields);
                            }
                        } else {
                            Log::warning("  -> No data to update for existing record ID {$existing->id}");
                            $skippedCount++;
                        }
                    } else {
                        // Create new record
                        try {
                            $newRecord = DmtData::create($data);
                            $createdCount++;
                            $createdIds[] = $newRecord->id;
                            Log::info("  -> Created new record ID {$newRecord->id}");
                        } catch (\Illuminate\Database\QueryException $qe) {
                            // Check if it's a duplicate key error
                            if ($qe->getCode() == 23000) {
                                Log::warning("  -> Duplicate entry detected, trying to find existing record");
                                // Try to find by nama_dmt and email combination
                                $duplicate = DmtData::where('disaster_id', $disasterId)
                                    ->where('nama_dmt', $namaDmt)
                                    ->when($email, function($q) use ($email) {
                                        return $q->where('email', $email);
                                    })
                                    ->first();
                                if ($duplicate) {
                                    Log::info("  -> Found duplicate, updating ID {$duplicate->id} instead");
                                    $updateData = array_filter($data, function($value) {
                                        return $value !== null && $value !== '';
                                    });
                                    unset($updateData['disaster_id']);
                                    $duplicate->update($updateData);
                                    $updatedCount++;
                                    $updatedIds[] = $duplicate->id;
                                } else {
                                    throw $qe;
                                }
                            } else {
                                throw $qe;
                            }
                        }
                    }
                    $syncedCount++;
                } catch (\Exception $e) {
                    $skippedCount++;
                    $errorMsg = "Baris " . ($rowIndex + 2) . " (" . ($rowData['nama_dmt'] ?? 'unknown') . "): " . $e->getMessage();
                    $errors[] = $errorMsg;
                    Log::error('Sync error: ' . $errorMsg, [
                        'data' => $rowData,
                        'exception' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                }
            }

            // Get final count after sync
            $finalCount = DmtData::where('disaster_id', $disasterId)->count();
            $actualNewRecords = $finalCount - $initialCount;

            Log::info("Final data count in database: {$finalCount}");
            Log::info("Actual new records added: {$actualNewRecords}");
            Log::info("Created IDs: " . implode(', ', $createdIds));
            Log::info("Updated IDs: " . implode(', ', $updatedIds));

            Log::info('=== SYNC SUMMARY ===');
            Log::info("Total processed: " . count($sheetData));
            Log::info("Synced (attempted): {$syncedCount}");
            Log::info("Created: {$createdCount}");
            Log::info("Updated: {$updatedCount}");
            Log::info("Skipped: {$skippedCount}");
            Log::info("Errors: " . count($errors));
            Log::info("Initial DB count: {$initialCount}");
            Log::info("Final DB count: {$finalCount}");
            Log::info("Actual new records: {$actualNewRecords}");

            $message = "Sinkronisasi berhasil. {$syncedCount} data berhasil disinkronkan";
            if ($skippedCount > 0) {
                $message .= ", {$skippedCount} baris dilewati";
            }
            $message .= ".";

            // Preserve query parameters
            $redirect = redirect()->route('kelola-pendaftaran', $request->only(['page', 'search', 'status', 'sort_by', 'sort_order']));

            if (!empty($errors) && count($errors) <= 5) {
                // Show errors if there are few
                $message .= " Error: " . implode('; ', $errors);
            }

            Log::info('=== END SYNC PROCESS ===');

            return $redirect->with('success', $message);

        } catch (\Exception $e) {
            Log::error('=== SYNC ERROR ===');
            Log::error('Error message: ' . $e->getMessage());
            Log::error('Error trace: ' . $e->getTraceAsString());
            Log::error('=== END SYNC ERROR ===');

            return redirect()->route('kelola-pendaftaran')
                ->with('error', 'Terjadi kesalahan saat sinkronisasi: ' . $e->getMessage());
        }
    }

    /**
     * Read sheet data from Google Sheets API v4.
     */
    private function readSheetData(string $sheetId, string $apiKey): array
    {
        $url = "https://sheets.googleapis.com/v4/spreadsheets/{$sheetId}/values/A1:ZZ1000";

        Log::info('=== START READ SHEET DATA ===');
        Log::info('Sheet ID: ' . $sheetId);
        Log::info('API URL: ' . $url);
        Log::info('API Key exists: ' . (!empty($apiKey) ? 'Yes' : 'No'));

        $verifySSL = env('GOOGLE_DRIVE_VERIFY_SSL', env('APP_ENV') === 'production');

        $response = Http::withOptions([
            'verify' => $verifySSL,
            'headers' => [
                'Referer' => request()->getSchemeAndHttpHost(),
            ],
        ])->get($url, [
            'key' => $apiKey,
        ]);

        Log::info('API Response Status: ' . $response->status());

        if (!$response->successful()) {
            $errorData = $response->json();
            Log::error('API Error Response:', $errorData);
            throw new \Exception('Gagal mengambil data dari Google Sheets API: ' . ($errorData['error']['message'] ?? 'Unknown error'));
        }

        $values = $response->json('values', []);

        Log::info('Total rows from API: ' . count($values));

        if (empty($values)) {
            Log::warning('No values returned from API');
            return [];
        }

        // First row is header
        $headers = array_map('trim', $values[0]);

        Log::info('Headers found (' . count($headers) . ' columns):', $headers);

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

        // Log header mapping
        $mappedHeaders = [];
        foreach ($headers as $headerName) {
            if (isset($headerMap[$headerName])) {
                $mappedHeaders[$headerName] = $headerMap[$headerName];
            }
        }
        Log::info('Header mapping result:', $mappedHeaders);
        Log::info('Unmapped headers:', array_diff($headers, array_keys($headerMap)));

        $result = [];

        // Process data rows (skip header row)
        Log::info('Processing ' . (count($values) - 1) . ' data rows...');

        for ($i = 1; $i < count($values); $i++) {
            $row = $values[$i];
            $rowData = [];

            // Log raw row data (first 3 rows only)
            if ($i <= 3) {
                Log::info("Raw row {$i}:", $row);
            }

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

            // Log processed row data (first 3 rows only)
            if ($i <= 3) {
                Log::info("Processed row {$i} data:", $rowData);
            }

            // Only add if nama_dmt is not empty
            if (!empty($rowData['nama_dmt'])) {
                $result[] = $rowData;
            } else {
                Log::warning("Row {$i} skipped: nama_dmt is empty", ['rowData' => $rowData]);
            }
        }

        Log::info('Total valid rows processed: ' . count($result));
        Log::info('=== END READ SHEET DATA ===');

        return $result;
    }

    /**
     * Parse date string to Carbon instance.
     */
    private function parseDate(?string $dateString): ?\Carbon\Carbon
    {
        if (empty($dateString)) {
            return null;
        }

        try {
            return \Carbon\Carbon::parse($dateString);
        } catch (\Exception $e) {
            return null;
        }
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

        $intValue = (int) $cleaned;
        return $intValue > 0 ? $intValue : null;
    }
}

