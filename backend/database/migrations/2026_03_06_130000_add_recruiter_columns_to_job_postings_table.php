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
            if (!Schema::hasColumn('job_postings', 'user_id')) {
                $table->unsignedBigInteger('user_id')->nullable()->after('id');
                $table->index('user_id');
            }

            if (!Schema::hasColumn('job_postings', 'recruiter_name')) {
                $table->string('recruiter_name')->nullable()->after('description');
            }

            if (!Schema::hasColumn('job_postings', 'recruiter_role')) {
                $table->string('recruiter_role')->nullable()->after('recruiter_name');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('job_postings', function (Blueprint $table) {
            if (Schema::hasColumn('job_postings', 'recruiter_role')) {
                $table->dropColumn('recruiter_role');
            }

            if (Schema::hasColumn('job_postings', 'recruiter_name')) {
                $table->dropColumn('recruiter_name');
            }

            if (Schema::hasColumn('job_postings', 'user_id')) {
                $table->dropIndex(['user_id']);
                $table->dropColumn('user_id');
            }
        });
    }
};
