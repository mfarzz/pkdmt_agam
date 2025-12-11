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
        Schema::create('report_dates', function (Blueprint $table) {
            $table->id();
            $table->enum('report_type', ['DMT', 'HEOC']);
            $table->date('date');
            $table->text('folder_link');
            $table->timestamps();

            // Unique constraint: one entry per report_type and date
            $table->unique(['report_type', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('report_dates');
    }
};
