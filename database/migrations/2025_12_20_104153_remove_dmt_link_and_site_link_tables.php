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
        // Remove foreign key and column dmt_link_id from dmt_data
        Schema::table('dmt_data', function (Blueprint $table) {
            $table->dropForeign(['dmt_link_id']);
            $table->dropColumn('dmt_link_id');
        });

        // Drop dmt_links table
        Schema::dropIfExists('dmt_links');

        // Drop site_links table
        Schema::dropIfExists('site_links');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate site_links table
        Schema::create('site_links', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('url');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Recreate dmt_links table
        Schema::create('dmt_links', function (Blueprint $table) {
            $table->id();
            $table->string('gdrive_url', 500)->unique();
            $table->timestamps();
        });

        // Re-add dmt_link_id column to dmt_data
        Schema::table('dmt_data', function (Blueprint $table) {
            $table->foreignId('dmt_link_id')->nullable()->after('id');
            $table->foreign('dmt_link_id')
                ->references('id')
                ->on('dmt_links')
                ->onDelete('cascade');
        });
    }
};
