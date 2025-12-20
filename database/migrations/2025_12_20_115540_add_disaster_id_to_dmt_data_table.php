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
        // Check if column already exists
        if (!Schema::hasColumn('dmt_data', 'disaster_id')) {
            // Get default disaster (active disaster or first disaster)
            $defaultDisaster = DB::table('disasters')
                ->where('is_active', true)
                ->first();
            
            if (!$defaultDisaster) {
                $defaultDisaster = DB::table('disasters')->first();
            }
            
            $defaultDisasterId = $defaultDisaster ? $defaultDisaster->id : null;

            // Add column as nullable first
            Schema::table('dmt_data', function (Blueprint $table) {
                $table->unsignedBigInteger('disaster_id')->nullable()->after('id');
            });
            
            // Assign existing data to default disaster if exists
            if ($defaultDisasterId) {
                DB::table('dmt_data')
                    ->whereNull('disaster_id')
                    ->update(['disaster_id' => $defaultDisasterId]);
            }
            
            // Make it required and add FK constraint
            Schema::table('dmt_data', function (Blueprint $table) use ($defaultDisasterId) {
                if ($defaultDisasterId) {
                    // Update any remaining null values
                    DB::table('dmt_data')
                        ->whereNull('disaster_id')
                        ->update(['disaster_id' => $defaultDisasterId]);
                }
                
                // Change to not null
                $table->unsignedBigInteger('disaster_id')->nullable(false)->change();
                
                // Add foreign key constraint
                $table->foreign('disaster_id')
                    ->references('id')
                    ->on('disasters')
                    ->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('dmt_data', function (Blueprint $table) {
            // Drop foreign key if exists
            $table->dropForeign(['disaster_id']);
            // Drop column
            $table->dropColumn('disaster_id');
        });
    }
};
