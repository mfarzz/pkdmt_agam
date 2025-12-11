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
            // Remove report_type column
            $table->dropColumn('report_type');
            
            // Add is_public column (default true for backward compatibility)
            $table->boolean('is_public')->default(true)->after('title');
        });

        Schema::table('report_dates', function (Blueprint $table) {
            // Remove report_type column
            $table->dropColumn('report_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('report_dates', function (Blueprint $table) {
            // Add report_type back
            $table->string('report_type')->nullable()->after('report_link_id');
        });

        Schema::table('report_links', function (Blueprint $table) {
            // Remove is_public column
            $table->dropColumn('is_public');
            
            // Add report_type back
            $table->string('report_type')->nullable()->after('title');
        });
    }
};
