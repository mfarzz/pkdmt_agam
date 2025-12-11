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
        Schema::table('report_links', function (Blueprint $table) {
            // Remove unique constraint from report_type
            $table->dropUnique(['report_type']);
            
            // Change report_type from enum to string
            $table->string('report_type')->nullable()->change();
            
            // Add title column
            $table->string('title')->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('report_links', function (Blueprint $table) {
            // Remove title column
            $table->dropColumn('title');
            
            // Change report_type back to enum (this might fail if data exists)
            $table->enum('report_type', ['DMT', 'HEOC'])->change();
            
            // Add unique constraint back
            $table->unique('report_type');
        });
    }
};
