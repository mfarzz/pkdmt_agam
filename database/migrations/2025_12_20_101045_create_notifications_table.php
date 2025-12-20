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
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // 'dmt_registration', dll
            $table->string('title');
            $table->text('message');
            $table->unsignedBigInteger('dmt_data_id')->nullable(); // ID pendaftar jika type = dmt_registration
            $table->unsignedBigInteger('disaster_id')->nullable(); // ID bencana terkait
            $table->boolean('is_read')->default(false);
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
            
            $table->index('is_read');
            $table->index('type');
            $table->index('disaster_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
