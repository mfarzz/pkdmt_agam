<?php

namespace App\Http\Controllers;

use App\Mail\DmtRegistrationNotification;
use App\Models\DmtData;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DmtRegistrationController extends Controller
{
    /**
     * Display the registration form.
     */
    public function create(Request $request): Response
    {
        $activeDisaster = \App\Models\Disaster::where('is_active', true)->first();
        
        return Inertia::render('pendaftaran-dmt', [
            'activeDisasterName' => $activeDisaster ? $activeDisaster->name : null,
            'success' => $request->session()->get('success'),
        ]);
    }

    /**
     * Store a new DMT registration.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            // Data Rincian Tim
            'nama_dmt' => ['required', 'string', 'max:255'],
            'nama_ketua_tim' => ['required', 'string', 'max:255'],
            'tanggal_kedatangan' => ['required', 'date'],
            'masa_penugasan_hari' => ['required', 'numeric', 'integer', 'min:1'],
            'tanggal_pelayanan_dimulai' => ['required', 'date'],
            'tanggal_pelayanan_diakhiri' => ['nullable', 'date', 'after_or_equal:tanggal_pelayanan_dimulai'],
            'rencana_tanggal_kepulangan' => ['nullable', 'date'],
            
            // Nara Hubung
            'nama_nara_hubung' => ['required', 'string', 'max:255'],
            'posisi_jabatan' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'nomor_hp' => ['required', 'string', 'max:20'],
            
            // Kapasitas Logistik
            'logistik_non_medis' => ['required', 'string'],
            'logistik_non_medis_files' => ['nullable', 'array', 'max:5'],
            'logistik_non_medis_files.*' => ['file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:5120'], // 5MB
            'logistik_medis' => ['required', 'string'],
            'logistik_medis_files' => ['nullable', 'array', 'max:5'],
            'logistik_medis_files.*' => ['file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:5120'], // 5MB
            
            // Kapasitas Layanan
            'kapasitas_rawat_jalan' => ['required', 'numeric', 'integer', 'min:0'],
            'kapasitas_rawat_inap' => ['required', 'numeric', 'integer', 'min:0'],
            'kapasitas_operasi_bedah_mayor' => ['required', 'numeric', 'integer', 'min:0'],
            'kapasitas_operasi_bedah_minor' => ['required', 'numeric', 'integer', 'min:0'],
            'jenis_layanan_tersedia' => ['required', 'array', 'min:1'],
            'jenis_layanan_lainnya' => ['nullable', 'string', 'max:255'],
            
            // Komposisi Anggota Tim
            'jumlah_dokter_umum' => ['required', 'numeric', 'integer', 'min:0'],
            'rincian_dokter_spesialis' => ['required', 'string'],
            'jumlah_perawat' => ['required', 'numeric', 'integer', 'min:0'],
            'jumlah_bidan' => ['required', 'numeric', 'integer', 'min:0'],
            'jumlah_apoteker' => ['required', 'numeric', 'integer', 'min:0'],
            'jumlah_psikolog' => ['required', 'numeric', 'integer', 'min:0'],
            'jumlah_staf_logistik' => ['required', 'numeric', 'integer', 'min:0'],
            'jumlah_staf_administrasi' => ['required', 'numeric', 'integer', 'min:0'],
            'jumlah_petugas_keamanan' => ['required', 'numeric', 'integer', 'min:0'],
            
            // Lampiran Dokumen
            'surat_tugas_file' => ['required', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:5120'], // 5MB
            'scan_str_file' => ['required', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:5120'], // 5MB
            'daftar_nama_anggota_file' => ['nullable', 'file', 'mimes:pdf,doc,docx,jpg,jpeg,png', 'max:5120'], // 5MB
        ]);

        // Get active disaster
        $activeDisaster = \App\Models\Disaster::where('is_active', true)->first();
        if (!$activeDisaster) {
            return back()->withErrors(['error' => 'Tidak ada bencana aktif. Silakan hubungi administrator.']);
        }

        // No longer need DMT link - data goes directly to database

        // Handle file uploads
        $logistikNonMedisFiles = [];
        if ($request->hasFile('logistik_non_medis_files')) {
            $files = $request->file('logistik_non_medis_files');
            // Handle both single file and array of files
            if (is_array($files)) {
                // Multiple files
                foreach ($files as $file) {
                    if ($file && $file->isValid()) {
                        $path = $file->store('dmt/logistik-non-medis', 'public');
                        $logistikNonMedisFiles[] = $path;
                    }
                }
            } else {
                // Single file
                if ($files && $files->isValid()) {
                    $path = $files->store('dmt/logistik-non-medis', 'public');
                    $logistikNonMedisFiles[] = $path;
                }
            }
        }

        $logistikMedisFiles = [];
        if ($request->hasFile('logistik_medis_files')) {
            $files = $request->file('logistik_medis_files');
            // Handle both single file and array of files
            if (is_array($files)) {
                // Multiple files
                foreach ($files as $file) {
                    if ($file && $file->isValid()) {
                        $path = $file->store('dmt/logistik-medis', 'public');
                        $logistikMedisFiles[] = $path;
                    }
                }
            } else {
                // Single file
                if ($files && $files->isValid()) {
                    $path = $files->store('dmt/logistik-medis', 'public');
                    $logistikMedisFiles[] = $path;
                }
            }
        }

        $suratTugasPath = null;
        if ($request->hasFile('surat_tugas_file')) {
            $suratTugasPath = $request->file('surat_tugas_file')->store('dmt/dokumen', 'public');
        }

        $scanStrPath = null;
        if ($request->hasFile('scan_str_file')) {
            $scanStrPath = $request->file('scan_str_file')->store('dmt/dokumen', 'public');
        }

        $daftarNamaPath = null;
        if ($request->hasFile('daftar_nama_anggota_file')) {
            $daftarNamaPath = $request->file('daftar_nama_anggota_file')->store('dmt/dokumen', 'public');
        }

        // Combine jenis layanan
        $jenisLayanan = $validated['jenis_layanan_tersedia'];
        if (!empty($validated['jenis_layanan_lainnya'])) {
            $jenisLayanan[] = 'Lainnya: ' . $validated['jenis_layanan_lainnya'];
        }
        $jenisLayananString = implode(', ', $jenisLayanan);

        // Create DMT data
        $dmtData = DmtData::create([
            'disaster_id' => $activeDisaster->id,
            'nama_dmt' => $validated['nama_dmt'],
            'nama_ketua_tim' => $validated['nama_ketua_tim'],
            'status_pendaftaran' => 'approved', // Auto-approved on registration
            'tanggal_kedatangan' => $validated['tanggal_kedatangan'],
            'masa_penugasan_hari' => $validated['masa_penugasan_hari'],
            'tanggal_pelayanan_dimulai' => $validated['tanggal_pelayanan_dimulai'],
            'tanggal_pelayanan_diakhiri' => $validated['tanggal_pelayanan_diakhiri'] ?? null,
            'rencana_tanggal_kepulangan' => $validated['rencana_tanggal_kepulangan'] ?? null,
            'nama_nara_hubung' => $validated['nama_nara_hubung'],
            'posisi_jabatan' => $validated['posisi_jabatan'],
            'email' => $validated['email'],
            'nomor_hp' => $validated['nomor_hp'],
            'kapasitas_rawat_jalan' => $validated['kapasitas_rawat_jalan'],
            'kapasitas_rawat_inap' => $validated['kapasitas_rawat_inap'],
            'kapasitas_operasi_bedah_mayor' => $validated['kapasitas_operasi_bedah_mayor'],
            'kapasitas_operasi_bedah_minor' => $validated['kapasitas_operasi_bedah_minor'],
            'jenis_layanan_tersedia' => $jenisLayananString,
            'jumlah_dokter_umum' => $validated['jumlah_dokter_umum'],
            'rincian_dokter_spesialis' => $validated['rincian_dokter_spesialis'],
            'jumlah_perawat' => $validated['jumlah_perawat'],
            'jumlah_bidan' => $validated['jumlah_bidan'],
            'jumlah_apoteker' => $validated['jumlah_apoteker'],
            'jumlah_psikolog' => $validated['jumlah_psikolog'],
            'jumlah_staf_logistik' => $validated['jumlah_staf_logistik'],
            'jumlah_staf_administrasi' => $validated['jumlah_staf_administrasi'],
            'jumlah_petugas_keamanan' => $validated['jumlah_petugas_keamanan'],
            'logistik_non_medis' => $validated['logistik_non_medis'],
            'logistik_non_medis_files' => !empty($logistikNonMedisFiles) ? $logistikNonMedisFiles : null,
            'logistik_medis' => $validated['logistik_medis'],
            'logistik_medis_files' => !empty($logistikMedisFiles) ? $logistikMedisFiles : null,
            'surat_tugas_file' => $suratTugasPath,
            'scan_str_file' => $scanStrPath,
            'daftar_nama_anggota_file' => $daftarNamaPath,
            'timestamp' => now(),
        ]);

        // Create notification for admin
        Notification::create([
            'type' => 'dmt_registration',
            'title' => 'Pendaftaran DMT Baru',
            'message' => "Tim DMT baru telah mendaftar: {$validated['nama_dmt']} (Ketua: {$validated['nama_ketua_tim']})",
            'dmt_data_id' => $dmtData->id,
            'disaster_id' => $activeDisaster->id,
            'is_read' => false,
        ]);

        // Send email notification to all admins
        try {
            $admins = User::all();
            foreach ($admins as $admin) {
                Mail::to($admin->email)->send(
                    new DmtRegistrationNotification($dmtData, $activeDisaster)
                );
            }
        } catch (\Exception $e) {
            // Log error but don't fail the registration
            \Log::error('Failed to send email notification: ' . $e->getMessage());
        }

        return redirect()->route('pendaftaran-dmt.create')
            ->with('success', 'Pendaftaran DMT berhasil dikirim! Tim akan meninjau pendaftaran Anda.');
    }
}
