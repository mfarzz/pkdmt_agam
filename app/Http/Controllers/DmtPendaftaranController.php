<?php

namespace App\Http\Controllers;

use App\Models\DmtData;
use App\Models\Disaster;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

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
}

