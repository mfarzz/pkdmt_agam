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
        Schema::create('notulensi_dates', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->string('sheet_id');
            $table->string('tab_name');
            $table->string('tab_id'); // gid untuk link langsung ke tab
            $table->text('sheet_link'); // Link langsung ke tab
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notulensi_dates');
    }
};
