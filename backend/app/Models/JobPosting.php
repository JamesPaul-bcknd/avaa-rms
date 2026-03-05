<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\JobApplication;
use App\Models\User;

class JobPosting extends Model
{
    // Point to the specific table name
    protected $table = 'job_postings';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'initials',
        'color',
        'title',
        'company',
        'location',
        'time_ago',
        'type',
        'tags',
        'salary',
        'description',
        'what_youll_do',
        'why_company',
        'user_id',
        'recruiter_name',
        'recruiter_role',
    ];

    // Allow these to be treated as arrays instead of strings
    protected $casts = [
        'tags' => 'array',
        'what_youll_do' => 'array',
        'why_company' => 'array',
    ];

    public function applications()
    {
        return $this->hasMany(JobApplication::class, 'job_posting_id');
    }

    public function recruiter()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}