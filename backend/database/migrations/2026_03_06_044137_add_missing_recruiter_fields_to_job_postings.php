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
    Schema::table('job_postings', function (Blueprint $table) {
        // Essential for JobPostingController::index and store
        $table->unsignedBigInteger('user_id')->after('id')->nullable();
        $table->string('recruiter_name')->after('user_id')->nullable();
        $table->string('recruiter_role')->after('recruiter_name')->nullable();
        
        // Setup relationship
        $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_postings', function (Blueprint $table) {
            //
        });
    }
};
