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
        Schema::create('study_room_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('study_room_id')->constrained('study_rooms')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('message');

            $table->index(['study_room_id', 'created_at']);
             // Index to optimize queries filtering by study_room_id and ordering by creation time

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('study_room_messages');
    }
};
