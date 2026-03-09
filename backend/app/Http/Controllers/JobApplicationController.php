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

    /**
     * Update application status (accept/reject)
     */
    public function updateStatus(Request $request, JobApplication $application): JsonResponse
    {
        $this->authorizeRecruiter();
        $this->authorizeApplicationOwnership($application);

        $request->validate([
            'status' => 'required|in:accepted,rejected',
        ]);

        $application->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => "Application {$request->status} successfully",
            'data' => $application,
        ]);
    }

    private function authorizeRecruiter(): void
    {
        $user = Auth::guard('api')->user();
        if (!$user || $user->role !== 'recruiter') {
            abort(403, 'Only recruiters can manage applications.');
        }
    }

    /**
     * Ensure recruiter can only manage applications for their own job postings
     */
    private function authorizeApplicationOwnership(JobApplication $application): void
    {
        $user = Auth::guard('api')->user();
        
        // Check if this application belongs to a job posting owned by this recruiter
        if ($application->jobPosting->user_id !== $user->id) {
            abort(403, 'You can only manage applications for your own job postings.');
        }
    }
}
