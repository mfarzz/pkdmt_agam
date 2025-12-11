<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DmtData extends Model
{
    use HasFactory;
    
    protected $fillable = [
        'dmt_link_id',
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
        'timestamp',
    ];
    
    protected $casts = [
        'tanggal_kedatangan' => 'date',
        'tanggal_pelayanan_dimulai' => 'date',
        'tanggal_pelayanan_diakhiri' => 'date',
        'rencana_tanggal_kepulangan' => 'date',
        'timestamp' => 'datetime',
    ];

    /**
     * Get the DMT link that owns this data.
     */
    public function dmtLink()
    {
        return $this->belongsTo(DmtLink::class);
    }
}
