<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->string('status')->default('pending')->after('cv_path');
            $table->text('rejection_reason')->nullable()->after('status');
            $table->timestamp('rejected_at')->nullable()->after('rejection_reason');
            $table->timestamp('approved_at')->nullable()->after('rejected_at');

            $table->date('interview_date')->nullable()->after('approved_at');
            $table->string('interview_time')->nullable()->after('interview_date');
            $table->string('interview_type')->nullable()->after('interview_time');
            $table->string('interviewer')->nullable()->after('interview_type');
        });
    }

    public function down(): void
    {
        Schema::table('job_applications', function (Blueprint $table) {
            $table->dropColumn([
                'status',
                'rejection_reason',
                'rejected_at',
                'approved_at',
                'interview_date',
                'interview_time',
                'interview_type',
                'interviewer',
            ]);
        });
    }
};
