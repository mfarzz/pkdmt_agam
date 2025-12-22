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
        // Remove existing unique constraints using DB statement (more reliable)
        try {
            DB::statement('ALTER TABLE `notulensi_dates` DROP INDEX `notulensi_dates_date_unique`');
        } catch (\Exception $e) {
            // Ignore if constraint doesn't exist
        }
        
        try {
            DB::statement('ALTER TABLE `notulensi_dates` DROP INDEX `notulensi_dates_date_sheet_id_unique`');
        } catch (\Exception $e) {
            // Ignore if constraint doesn't exist
        }
        
        Schema::table('notulensi_dates', function (Blueprint $table) {
            // Add type column (spreadsheet or image)
            $table->string('type')->default('spreadsheet')->after('id');
            
            // Add disaster_id foreign key
            $table->foreignId('disaster_id')->nullable()->after('notulensi_link_id');
            $table->foreign('disaster_id')->references('id')->on('disasters')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notulensi_dates', function (Blueprint $table) {
            $table->dropForeign(['disaster_id']);
            $table->dropColumn(['type', 'disaster_id']);
            // Note: We don't restore unique constraint as it might cause issues
        });
    }
};
