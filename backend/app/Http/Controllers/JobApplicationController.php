<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use App\Models\JobPosting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobApplicationController extends Controller
{
    public function index(JobPosting $jobPosting): JsonResponse
    {
        $this->authorizeRecruiter();

        $applications = $jobPosting->applications()->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $applications,
        ], 200);
    }

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
            'cv' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
        ]);

        // Handle CV file upload
        $cvPath = null;
        if ($request->hasFile('cv')) {
            $cvPath = $request->file('cv')->store('cvs', 'public');
        }

        $application = JobApplication::create([
            'job_posting_id' => $jobPosting->id,
            'user_id' => $user->id,
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'linkedin' => $data['linkedin'] ?? null,
            'cover_letter' => $data['cover_letter'] ?? null,
            'why_interested' => $data['why_interested'] ?? null,
            'experience' => $data['experience'] ?? null,
            'cv_path' => $cvPath,
        ]);

        return response()->json(['success' => true, 'data' => $application], 201);
    }

    private function authorizeRecruiter(): void
    {
        $user = Auth::guard('api')->user();
        if (!$user || $user->role !== 'recruiter') {
            abort(403, 'Only recruiters can manage applications.');
        }
    }
}
