<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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
        'status', // 'pending', 'accepted', 'rejected'
    ];

    /**
     * Get the user that applied.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the job posting that was applied to.
     */
    public function jobPosting()
    {
        return $this->belongsTo(JobPosting::class, 'job_posting_id');
    }
}
