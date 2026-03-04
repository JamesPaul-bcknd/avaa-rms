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
    ];
}
