<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use App\Models\JobPosting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobApplicationController extends Controller
{
    public function store(Request $request, JobPosting $jobPosting): JsonResponse
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $data = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'linkedin' => 'nullable|string|max:255',
            'cover_letter' => 'nullable|string',
            'why_interested' => 'nullable|string',
            'experience' => 'nullable|string',
        ]);

        $application = JobApplication::create([
            'job_posting_id' => $jobPosting->id,
            'user_id' => $user->id,
            ...$data,
        ]);

        return response()->json(['success' => true, 'data' => $application], 201);
    }
}
