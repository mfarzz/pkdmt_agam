<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DmtData extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'disaster_id',
        'nama_dmt',
        'nama_ketua_tim',
        'status_penugasan',
        'tanggal_kedatangan',
        'masa_penugasan_hari',
        'tanggal_pelayanan_dimulai',
        'tanggal_pelayanan_diakhiri',
        'rencana_tanggal_kepulangan',
        'nama_nara_hubung',
        'posisi_jabatan',
        'email',
        'nomor_hp',
        'kapasitas_rawat_jalan',
        'kapasitas_rawat_inap',
        'kapasitas_operasi_bedah_mayor',
        'kapasitas_operasi_bedah_minor',
        'jenis_layanan_tersedia',
        'jumlah_dokter_umum',
        'rincian_dokter_spesialis',
        'jumlah_perawat',
        'jumlah_bidan',
        'jumlah_apoteker',
        'jumlah_psikolog',
        'jumlah_staf_logistik',
        'jumlah_staf_administrasi',
        'jumlah_petugas_keamanan',
        'logistik_non_medis',
        'logistik_non_medis_files',
        'logistik_medis',
        'logistik_medis_files',
        'surat_tugas_file',
        'scan_str_file',
        'daftar_nama_anggota_file',
        'status_pendaftaran',
        'timestamp',
    ];
    
    /**
     * Get the disaster that owns this DMT data.
     */
    public function disaster()
    {
        return $this->belongsTo(Disaster::class);
    }
    
    protected $casts = [
        'tanggal_kedatangan' => 'date',
        'tanggal_pelayanan_dimulai' => 'date',
        'tanggal_pelayanan_diakhiri' => 'date',
        'rencana_tanggal_kepulangan' => 'date',
        'timestamp' => 'datetime',
        'logistik_non_medis_files' => 'array',
        'logistik_medis_files' => 'array',
        'masa_penugasan_hari' => 'integer',
    ];


    /**
     * Calculate status based on tanggal_kedatangan and masa_penugasan_hari.
     */
    public function calculateStatusFromDates(): ?string
    {
        if (!$this->tanggal_kedatangan || !$this->masa_penugasan_hari) {
            return null;
        }

        $today = \Carbon\Carbon::today();
        $tanggalKedatangan = \Carbon\Carbon::parse($this->tanggal_kedatangan);
        // Ensure masa_penugasan_hari is an integer
        $masaPenugasan = (int) $this->masa_penugasan_hari;
        $tanggalSelesai = $tanggalKedatangan->copy()->addDays($masaPenugasan);

        // Belum Datang: tanggal kedatangan masih di masa depan
        if ($tanggalKedatangan->isFuture()) {
            return 'Belum Datang';
        }

        // Selesai: sudah melewati tanggal kedatangan + masa penugasan
        if ($today->isAfter($tanggalSelesai)) {
            return 'Selesai';
        }

        // Aktif: sudah datang dan masih dalam masa penugasan
        if ($tanggalKedatangan->isPast() || $tanggalKedatangan->isToday()) {
            if ($today->isBefore($tanggalSelesai) || $today->isSameDay($tanggalSelesai)) {
                return 'Aktif';
            }
        }

        return null;
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-calculate status from dates when tanggal_kedatangan or masa_penugasan_hari changes
        static::saving(function ($dmtData) {
            // Auto-calculate status if status is one of: Aktif, Selesai, Belum Datang
            // These statuses should be calculated from dates, not from Google Forms
            $autoCalculatedStatuses = ['Aktif', 'Selesai', 'Belum Datang'];
            $currentStatus = $dmtData->status_penugasan;
            
            // If status is one of auto-calculated statuses, recalculate it from dates
            if ($currentStatus && in_array($currentStatus, $autoCalculatedStatuses)) {
                $calculatedStatus = $dmtData->calculateStatusFromDates();
                if ($calculatedStatus) {
                    $dmtData->status_penugasan = $calculatedStatus;
                }
            }
            
            // Also calculate if status is null and we have dates
            if (!$currentStatus) {
                $calculatedStatus = $dmtData->calculateStatusFromDates();
                if ($calculatedStatus) {
                    $dmtData->status_penugasan = $calculatedStatus;
                }
            }

            // Auto-sync status_penugasan when status_pendaftaran changes (for form web)
            if ($dmtData->isDirty('status_pendaftaran')) {
                $statusPenugasanMap = [
                    'pending' => 'Pending',
                    'approved' => null, // Will be calculated from dates
                    'rejected' => 'Dibatalkan',
                ];
                
                if (isset($statusPenugasanMap[$dmtData->status_pendaftaran])) {
                    $mappedStatus = $statusPenugasanMap[$dmtData->status_pendaftaran];
                    if ($mappedStatus === null) {
                        // If approved, calculate from dates
                        $calculatedStatus = $dmtData->calculateStatusFromDates();
                        if ($calculatedStatus) {
                            $dmtData->status_penugasan = $calculatedStatus;
                        } else {
                            $dmtData->status_penugasan = 'Aktif'; // Default fallback
                        }
                    } else {
                        $dmtData->status_penugasan = $mappedStatus;
                    }
                }
            }
        });

        // Auto-calculate status on create if not set
        static::creating(function ($dmtData) {
            // If status_pendaftaran is set (from form web), use that mapping first
            if ($dmtData->status_pendaftaran) {
                $statusPenugasanMap = [
                    'pending' => 'Pending',
                    'approved' => null, // Will be calculated from dates
                    'rejected' => 'Dibatalkan',
                ];
                
                if (isset($statusPenugasanMap[$dmtData->status_pendaftaran])) {
                    $mappedStatus = $statusPenugasanMap[$dmtData->status_pendaftaran];
                    if ($mappedStatus === null) {
                        // If approved, calculate from dates
                        $calculatedStatus = $dmtData->calculateStatusFromDates();
                        if ($calculatedStatus) {
                            $dmtData->status_penugasan = $calculatedStatus;
                        } else {
                            $dmtData->status_penugasan = 'Aktif'; // Default fallback
                        }
                    } else {
                        $dmtData->status_penugasan = $mappedStatus;
                    }
                }
            }
            
            // If status_penugasan is not set, try to calculate from dates
            if (!$dmtData->status_penugasan) {
                $calculatedStatus = $dmtData->calculateStatusFromDates();
                if ($calculatedStatus) {
                    $dmtData->status_penugasan = $calculatedStatus;
                }
            }
        });
    }
}
