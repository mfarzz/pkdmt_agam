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
        Schema::create('notulensi_images', function (Blueprint $table) {
            $table->id();
            $table->date('date'); // Tanggal notulensi
            $table->foreignId('disaster_id')->constrained('disasters')->onDelete('cascade');
            $table->string('image_path'); // Path ke file gambar
            $table->string('image_name')->nullable(); // Nama file asli
            $table->string('description')->nullable(); // Keterangan opsional
            $table->unsignedBigInteger('file_size')->nullable(); // Ukuran file dalam bytes
            $table->string('mime_type')->nullable(); // MIME type (image/jpeg, image/png, etc)
            $table->integer('order')->default(0); // Urutan berdasarkan waktu upload
            $table->timestamps();
            
            // Index untuk query cepat
            $table->index(['date', 'disaster_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notulensi_images');
    }
};
