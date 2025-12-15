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
        // Create default disaster
        $defaultDisasterId = \Illuminate\Support\Facades\DB::table('disasters')->insertGetId([
            'name' => 'Bencana Default',
            'slug' => 'bencana-default',
            'description' => 'Disaster default untuk data migrasi',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $tables = [
            'report_links',
            'notulensi_links',
            'infografis_links',
            'dmt_links',
            'site_links',
            'laporan_excel_files'
        ];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) use ($defaultDisasterId) {
                // Add column as nullable first
                $table->foreignId('disaster_id')->nullable()->after('id');
            });
            
            // Assign existing data to default
            \Illuminate\Support\Facades\DB::table($table)->update(['disaster_id' => $defaultDisasterId]);
            
            Schema::table($table, function (Blueprint $table) {
                // Change to not null and add FK constraint
                // Note: We need to use DB statement for modifying column to not null in some drivers if 'change()' trait isn't available, 
                // but Laravel 12 should handle it. To be safe and since this is a fresh migration, we can rely on standard schema builder.
                 // However, separating the FK definition is safer.
                 // Re-defining column to make it required is complex across DBs.
                 // Easier approach: Just add FK constraint now. We'll leave it 'nullable' technically in schema if change() causes issues, 
                 // OR we try to change it. Let's try change().
                 $table->foreignId('disaster_id')->nullable(false)->change();
                 $table->foreign('disaster_id')->references('id')->on('disasters')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tables', function (Blueprint $table) {
            //
        });
    }
};
