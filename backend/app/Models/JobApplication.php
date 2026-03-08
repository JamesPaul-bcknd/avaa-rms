<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobApplication extends Model
{
    protected $fillable = [
        'job_posting_id',
        'user_id',
        'full_name',
        'email',
        'phone',
        'linkedin',
        'cover_letter',
        'why_interested',
        'experience',
        'cv_path',
        'status',
        'rejection_reason',
        'rejected_at',
        'approved_at',
        'interview_date',
        'interview_time',
        'interview_type',
        'interviewer',
    ];

    protected $casts = [
        'rejected_at' => 'datetime',
        'approved_at' => 'datetime',
        'interview_date' => 'date',
    ];

    public function jobPosting(): BelongsTo
    {
        return $this->belongsTo(JobPosting::class, 'job_posting_id');
    }

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
