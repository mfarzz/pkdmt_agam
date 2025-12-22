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
        Schema::create('report_weeks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_link_id')->nullable()->constrained('report_links')->onDelete('cascade');
            $table->date('week_start_date'); // Senin
            $table->date('week_end_date'); // Minggu
            $table->integer('week_number'); // 1-52
            $table->integer('year');
            $table->string('source_type')->default('manual'); // 'manual' atau 'gdrive'
            $table->text('folder_link')->nullable(); // Untuk GDrive
            $table->string('file_path')->nullable(); // Untuk upload manual
            $table->string('file_name')->nullable(); // Nama file asli (untuk upload manual)
            $table->unsignedBigInteger('file_size')->nullable(); // Ukuran file (untuk upload manual)
            $table->string('mime_type')->nullable(); // MIME type (untuk upload manual)
            $table->text('description')->nullable(); // Keterangan opsional
            $table->foreignId('disaster_id')->constrained('disasters')->onDelete('cascade');
            $table->timestamps();
            
            // Unique constraint: satu report per minggu per link per disaster
            $table->unique(['report_link_id', 'week_start_date', 'disaster_id'], 'unique_week_report');
            
            // Index untuk query cepat
            $table->index(['year', 'week_number', 'disaster_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_weeks');
    }
};