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
        Schema::create('dmt_data', function (Blueprint $table) {
            $table->id();
            $table->string('nama_dmt');
            $table->string('nama_ketua_tim')->nullable();
            $table->string('status_penugasan')->nullable();
            $table->date('tanggal_kedatangan')->nullable();
            $table->integer('masa_penugasan_hari')->nullable();
            $table->date('tanggal_pelayanan_dimulai')->nullable();
            $table->date('tanggal_pelayanan_diakhiri')->nullable();
            $table->date('rencana_tanggal_kepulangan')->nullable();
            $table->string('nama_nara_hubung')->nullable();
            $table->string('posisi_jabatan')->nullable();
            $table->string('email')->nullable();
            $table->string('nomor_hp')->nullable();
            $table->integer('kapasitas_rawat_jalan')->nullable();
            $table->integer('kapasitas_rawat_inap')->nullable();
            $table->integer('kapasitas_operasi_bedah_mayor')->nullable();
            $table->integer('kapasitas_operasi_bedah_minor')->nullable();
            $table->text('jenis_layanan_tersedia')->nullable();
            $table->integer('jumlah_dokter_umum')->nullable();
            $table->text('rincian_dokter_spesialis')->nullable();
            $table->integer('jumlah_perawat')->nullable();
            $table->integer('jumlah_bidan')->nullable();
            $table->integer('jumlah_apoteker')->nullable();
            $table->integer('jumlah_psikolog')->nullable();
            $table->integer('jumlah_staf_logistik')->nullable();
            $table->integer('jumlah_staf_administrasi')->nullable();
            $table->integer('jumlah_petugas_keamanan')->nullable();
            $table->timestamp('timestamp')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dmt_data');
    }
};
