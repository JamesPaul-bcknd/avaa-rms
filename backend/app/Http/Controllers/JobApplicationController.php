<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use App\Models\JobPosting;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobApplicationController extends Controller
{
    public function index(JobPosting $jobPosting): JsonResponse
    {
        $this->authorizeRecruiter();

        $applications = $jobPosting->applications()
            ->where(function ($query) {
                $query->whereNull('status')->orWhere('status', 'pending');
            })
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $applications,
        ], 200);
    }

    public function interviews(): JsonResponse
    {
        $this->authorizeRecruiter();

        $applications = JobApplication::with('jobPosting:id,title')
            ->where('status', 'approved')
            ->orderByDesc('approved_at')
            ->get();

        $interviews = $applications->map(function (JobApplication $application) {
            return [
                'id' => $application->id,
                'candidateName' => $application->full_name,
                'role' => $application->jobPosting?->title ?? 'Unknown Role',
                'date' => $application->interview_date
                    ? $application->interview_date->format('Y-m-d')
                    : ($application->created_at?->format('Y-m-d') ?? ''),
                'interviewer' => $application->interviewer ?? 'TBD',
                'status' => 'Active',
            ];
        })->values();

        return response()->json([
            'success' => true,
            'data' => $interviews,
        ], 200);
    }

    public function approve(Request $request, JobApplication $jobApplication): JsonResponse
    {
        $this->authorizeRecruiter();

        $validated = $request->validate([
            'interview_date' => 'required|date',
            'interview_time' => 'required|string|max:50',
            'interview_type' => 'nullable|string|max:100',
            'interviewer' => 'required|string|max:255',
        ]);

        $jobApplication->update([
            'status' => 'approved',
            'approved_at' => now(),
            'rejected_at' => null,
            'rejection_reason' => null,
            'interview_date' => $validated['interview_date'],
            'interview_time' => $validated['interview_time'],
            'interview_type' => $validated['interview_type'] ?? 'Online Interview',
            'interviewer' => $validated['interviewer'],
        ]);

        $jobApplication->load('jobPosting:id,title');

        return response()->json([
            'success' => true,
            'data' => [
                'application' => $jobApplication,
                'interview' => [
                    'id' => $jobApplication->id,
                    'candidateName' => $jobApplication->full_name,
                    'role' => $jobApplication->jobPosting?->title ?? 'Unknown Role',
                    'date' => $jobApplication->interview_date
                        ? $jobApplication->interview_date->format('Y-m-d')
                        : '',
                    'interviewer' => $jobApplication->interviewer ?? 'TBD',
                    'status' => 'Active',
                ],
            ],
        ], 200);
    }

    public function reject(Request $request, JobApplication $jobApplication): JsonResponse
    {
        $this->authorizeRecruiter();

        $validated = $request->validate([
            'reason' => 'required|string|max:2000',
        ]);

        $jobApplication->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'approved_at' => null,
            'rejection_reason' => $validated['reason'],
            'interview_date' => null,
            'interview_time' => null,
            'interview_type' => null,
            'interviewer' => null,
        ]);

        $sender = Auth::guard('api')->user();

        if ($jobApplication->user_id) {
            $jobApplication->load('jobPosting:id,title');
            $jobTitle = $jobApplication->jobPosting?->title ?? 'the role';

            Message::create([
                'sender_id' => $sender->id,
                'receiver_id' => $jobApplication->user_id,
                'content' => "Application update for {$jobTitle}: your application was not selected. Reason: {$validated['reason']}",
                'type' => 'text',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $jobApplication,
        ], 200);
    }

    public function approveInterview(JobApplication $jobApplication): JsonResponse
    {
        $this->authorizeRecruiter();

        $jobApplication->update([
            'status' => 'hired',
            'rejected_at' => null,
            'rejection_reason' => null,
        ]);

        return response()->json([
            'success' => true,
            'data' => $jobApplication,
        ], 200);
    }

    public function rejectInterview(Request $request, JobApplication $jobApplication): JsonResponse
    {
        $this->authorizeRecruiter();

        $validated = $request->validate([
            'reason' => 'nullable|string|max:2000',
        ]);

        $reason = $validated['reason'] ?? 'Rejected after interview.';

        $jobApplication->update([
            'status' => 'rejected',
            'rejected_at' => now(),
            'rejection_reason' => $reason,
        ]);

        $sender = Auth::guard('api')->user();

        if ($jobApplication->user_id) {
            $jobApplication->load('jobPosting:id,title');
            $jobTitle = $jobApplication->jobPosting?->title ?? 'the role';

            Message::create([
                'sender_id' => $sender->id,
                'receiver_id' => $jobApplication->user_id,
                'content' => "Interview update for {$jobTitle}: you were not selected. Reason: {$reason}",
                'type' => 'text',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $jobApplication,
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
        if (!$user || !in_array($user->role, ['recruiter', 'hr', 'admin'], true)) {
            abort(403, 'Only HR users can manage applications.');
        }
    }
}
