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
        // Add foreign key for notulensi_dates -> notulensi_links
        Schema::table('notulensi_dates', function (Blueprint $table) {
            // Add notulensi_link_id column
            $table->foreignId('notulensi_link_id')->nullable()->after('id');

            // Migrate existing data: try to match sheet_id with notulensi_links
            // This will be done after adding the column
        });

        // Migrate existing notulensi_dates data
        // Match sheet_id from notulensi_dates with sheet_id extracted from notulensi_links
        $notulensiLinks = DB::table('notulensi_links')->get();
        foreach ($notulensiLinks as $link) {
            // Extract sheet_id from gdrive_url
            $sheetId = $this->extractSheetId($link->gdrive_url);
            if ($sheetId) {
                // Update all notulensi_dates with matching sheet_id
                DB::table('notulensi_dates')
                    ->where('sheet_id', $sheetId)
                    ->update(['notulensi_link_id' => $link->id]);
            }
        }

        // Now add the foreign key constraint
        Schema::table('notulensi_dates', function (Blueprint $table) {
            $table->foreign('notulensi_link_id')
                ->references('id')
                ->on('notulensi_links')
                ->onDelete('cascade');
        });

        // Add foreign key for infografis -> infografis_links
        Schema::table('infografis', function (Blueprint $table) {
            // Add infografis_link_id column
            $table->foreignId('infografis_link_id')->nullable()->after('id');
        });

        // Migrate existing infografis data
        // Since there's only one link (id=1), set all infografis to that link
        $infografisLink = DB::table('infografis_links')->first();
        if ($infografisLink) {
            DB::table('infografis')
                ->whereNull('infografis_link_id')
                ->update(['infografis_link_id' => $infografisLink->id]);
        }

        // Now add the foreign key constraint
        Schema::table('infografis', function (Blueprint $table) {
            $table->foreign('infografis_link_id')
                ->references('id')
                ->on('infografis_links')
                ->onDelete('cascade');
        });

        // Add foreign key for dmt_data -> dmt_links
        Schema::table('dmt_data', function (Blueprint $table) {
            // Add dmt_link_id column
            $table->foreignId('dmt_link_id')->nullable()->after('id');
        });

        // Migrate existing dmt_data
        // Since there's only one link (id=1), set all dmt_data to that link
        $dmtLink = DB::table('dmt_links')->first();
        if ($dmtLink) {
            DB::table('dmt_data')
                ->whereNull('dmt_link_id')
                ->update(['dmt_link_id' => $dmtLink->id]);
        }

        // Now add the foreign key constraint
        Schema::table('dmt_data', function (Blueprint $table) {
            $table->foreign('dmt_link_id')
                ->references('id')
                ->on('dmt_links')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop foreign keys and columns
        Schema::table('notulensi_dates', function (Blueprint $table) {
            $table->dropForeign(['notulensi_link_id']);
            $table->dropColumn('notulensi_link_id');
        });

        Schema::table('infografis', function (Blueprint $table) {
            $table->dropForeign(['infografis_link_id']);
            $table->dropColumn('infografis_link_id');
        });

        Schema::table('dmt_data', function (Blueprint $table) {
            $table->dropForeign(['dmt_link_id']);
            $table->dropColumn('dmt_link_id');
        });
    }

    /**
     * Extract sheet ID from Google Drive URL.
     */
    private function extractSheetId(string $url): ?string
    {
        // Pattern: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
        if (preg_match('/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/', $url, $matches)) {
            return $matches[1];
        }

        // Pattern: https://drive.google.com/file/d/{SHEET_ID}/view
        if (preg_match('/\/file\/d\/([a-zA-Z0-9-_]+)/', $url, $matches)) {
            return $matches[1];
        }

        // Pattern: https://drive.google.com/open?id={SHEET_ID}
        if (preg_match('/[?&]id=([a-zA-Z0-9-_]+)/', $url, $matches)) {
            return $matches[1];
        }

        return null;
    }
};
