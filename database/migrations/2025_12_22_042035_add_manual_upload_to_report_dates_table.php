<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('report_dates', function (Blueprint $table) {
            // Add source type column
            $table->enum('source_type', ['manual', 'gdrive'])->default('gdrive')->after('folder_link');
            
            // Add manual upload columns
            $table->string('file_path')->nullable()->after('source_type');
            $table->string('file_name')->nullable()->after('file_path');
            $table->bigInteger('file_size')->nullable()->after('file_name');
            
            // Track who uploaded
            $table->unsignedBigInteger('uploaded_by')->nullable()->after('file_size');
            $table->foreign('uploaded_by')->references('id')->on('users')->onDelete('set null');
        });
        
        // Clear all existing data (fresh start as requested)
        DB::table('report_dates')->truncate();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('report_dates', function (Blueprint $table) {
            $table->dropForeign(['uploaded_by']);
            $table->dropColumn(['source_type', 'file_path', 'file_name', 'file_size', 'uploaded_by']);
        });
    }
};
