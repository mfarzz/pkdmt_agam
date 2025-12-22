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
        Schema::table('report_dates', function (Blueprint $table) {
            $table->foreignId('disaster_id')->nullable()->after('id')->constrained('disasters')->onDelete('cascade');
        });

        // Assign existing reports to the first disaster if any exists
        $firstDisaster = DB::table('disasters')->first();
        if ($firstDisaster) {
            DB::table('report_dates')->update(['disaster_id' => $firstDisaster->id]);
        }
    }

    public function down(): void
    {
        Schema::table('report_dates', function (Blueprint $table) {
            $table->dropForeign(['disaster_id']);
            $table->dropColumn('disaster_id');
        });
    }
};
