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
        // 1. Disable foreign key checks
        Schema::disableForeignKeyConstraints();

        // 2. Truncate tables to ensure clean transition
        DB::table('report_dates')->truncate();
        DB::table('report_weeks')->truncate();

        // 3. Modify report_dates table
        Schema::table('report_dates', function (Blueprint $table) {
            if (Schema::hasColumn('report_dates', 'report_link_id')) {
                $table->dropColumn('report_link_id');
            }
            if (Schema::hasColumn('report_dates', 'source_type')) {
                $table->dropColumn('source_type');
            }
            if (!Schema::hasColumn('report_dates', 'is_dmt')) {
                $table->boolean('is_dmt')->default(true)->after('id');
            }
        });

        // 4. Modify report_weeks table
        Schema::table('report_weeks', function (Blueprint $table) {
            if (Schema::hasColumn('report_weeks', 'report_link_id')) {
                $table->dropColumn('report_link_id');
            }
            if (Schema::hasColumn('report_weeks', 'source_type')) {
                $table->dropColumn('source_type');
            }
            if (Schema::hasColumn('report_weeks', 'folder_link')) {
                $table->dropColumn('folder_link');
            }
            if (!Schema::hasColumn('report_weeks', 'is_dmt')) {
                $table->boolean('is_dmt')->default(true)->after('id');
            }
        });

        // 5. Drop report_links table
        Schema::dropIfExists('report_links');

        // 6. Re-enable foreign key checks
        Schema::enableForeignKeyConstraints();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::disableForeignKeyConstraints();

        // Re-create report_links table
        Schema::create('report_links', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->boolean('is_public')->default(true);
            $table->text('gdrive_url');
            $table->foreignId('disaster_id')->constrained('disasters')->onDelete('cascade');
            $table->timestamps();
        });

        // Restore report_dates table
        Schema::table('report_dates', function (Blueprint $table) {
            $table->dropColumn('is_dmt');
            $table->foreignId('report_link_id')->nullable()->after('id')->constrained('report_links')->onDelete('cascade');
            $table->enum('source_type', ['manual', 'gdrive'])->default('manual')->after('report_link_id');
        });

        // Restore report_weeks table
        Schema::table('report_weeks', function (Blueprint $table) {
            $table->dropColumn('is_dmt');
            $table->foreignId('report_link_id')->nullable()->after('id')->constrained('report_links')->onDelete('cascade');
            $table->string('source_type')->default('manual')->after('report_link_id');
        });

        Schema::enableForeignKeyConstraints();
    }
};
