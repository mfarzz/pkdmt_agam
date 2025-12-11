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
        Schema::create('notulensi_sheets', function (Blueprint $table) {
            $table->id();
            $table->string('sheet_id')->unique();
            $table->string('sheet_name');
            $table->text('sheet_url');
            $table->integer('total_tabs')->default(0);
            $table->integer('total_dates')->default(0); // Jumlah tanggal yang berhasil di-scan
            $table->timestamp('last_scanned_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notulensi_sheets');
    }
};
