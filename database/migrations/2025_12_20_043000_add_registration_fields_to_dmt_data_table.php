<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('dmt_data', function (Blueprint $table) {
            // Logistik fields
            $table->text('logistik_non_medis')->nullable()->after('jumlah_petugas_keamanan');
            $table->json('logistik_non_medis_files')->nullable()->after('logistik_non_medis');
            $table->text('logistik_medis')->nullable()->after('logistik_non_medis_files');
            $table->json('logistik_medis_files')->nullable()->after('logistik_medis');
            
            // Dokumen fields
            $table->string('surat_tugas_file')->nullable()->after('logistik_medis_files');
            $table->string('scan_str_file')->nullable()->after('surat_tugas_file');
            $table->string('daftar_nama_anggota_file')->nullable()->after('scan_str_file');
            
            // Status pendaftaran (pending, approved, rejected)
            $table->enum('status_pendaftaran', ['pending', 'approved', 'rejected'])->default('pending')->after('daftar_nama_anggota_file');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dmt_data', function (Blueprint $table) {
            $table->dropColumn([
                'logistik_non_medis',
                'logistik_non_medis_files',
                'logistik_medis',
                'logistik_medis_files',
                'surat_tugas_file',
                'scan_str_file',
                'daftar_nama_anggota_file',
                'status_pendaftaran',
            ]);
        });
    }
};
