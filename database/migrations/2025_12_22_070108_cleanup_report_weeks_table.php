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
        $reportWeekFks = collect(Schema::getForeignKeys('report_weeks'))->pluck('name');
        if ($reportWeekFks->contains('report_weeks_report_link_id_foreign')) {
            Schema::table('report_weeks', function (Blueprint $table) {
                $table->dropForeign(['report_link_id']);
            });
        }

        if (Schema::hasIndex('report_weeks', 'unique_week_report')) {
            Schema::table('report_weeks', function (Blueprint $table) {
                $table->dropUnique('unique_week_report');
            });
        }

        Schema::table('report_weeks', function (Blueprint $table) {
            // Drop obsolete columns
            if (Schema::hasColumn('report_weeks', 'report_link_id')) {
                $table->dropColumn('report_link_id');
            }
            if (Schema::hasColumn('report_weeks', 'source_type')) {
                $table->dropColumn('source_type');
            }
            if (Schema::hasColumn('report_weeks', 'folder_link')) {
                $table->dropColumn('folder_link');
            }
            if (Schema::hasColumn('report_weeks', 'is_dmt')) {
                $table->dropColumn('is_dmt');
            }
        });
    }

    public function down(): void
    {
        Schema::table('report_weeks', function (Blueprint $table) {
            $table->unsignedBigInteger('report_link_id')->nullable();
            $table->string('source_type')->default('manual');
            $table->text('folder_link')->nullable();
            $table->boolean('is_dmt')->default(true);
        });
    }
};
