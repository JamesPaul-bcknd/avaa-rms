<?php

namespace App\Http\Controllers;

use App\Models\JobPosting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobPostingController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorizeRecruiter();

        $recruiter = Auth::guard('api')->user();
        $jobs = JobPosting::where('user_id', $recruiter->id)
            ->withCount('applications')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $jobs
        ], 200);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorizeRecruiter();

        $validated = $this->validateJob($request);
        
        // Add recruiter information
        $recruiter = Auth::guard('api')->user();
        $validated['user_id'] = $recruiter->id;
        $validated['recruiter_name'] = $recruiter->name;
        $validated['recruiter_role'] = $recruiter->role === 'recruiter' ? 'Senior Tech Talent Partner' : 'Hiring Manager';
        
        $job = JobPosting::create($validated);

        return response()->json(['success' => true, 'data' => $job], 201);
    }

    public function update(Request $request, JobPosting $jobPosting): JsonResponse
    {
        $this->authorizeRecruiter();
        $this->authorizeJobOwnership($jobPosting);

        $validated = $this->validateJob($request, false);
        $jobPosting->update($validated);

        return response()->json(['success' => true, 'data' => $jobPosting], 200);
    }

    public function destroy(JobPosting $jobPosting): JsonResponse
    {
        $this->authorizeRecruiter();
        $this->authorizeJobOwnership($jobPosting);

        $jobPosting->delete();

        return response()->json(['success' => true], 200);
    }

    // ---------- NEW SEARCH FUNCTION ----------
    public function search(Request $request): JsonResponse
    {
        $query = $request->query('query', '');

        if (!$query) {
            return response()->json([]);
        }

        $jobs = JobPosting::query()
            ->where('title', 'like', "%{$query}%")
            ->orWhere('company', 'like', "%{$query}%")
            ->orWhere('location', 'like', "%{$query}%")
            ->orderBy('created_at', 'desc')
            ->take(10) // limit to 10 results
            ->get(['title', 'company', 'location']); // only return necessary fields

        return response()->json($jobs, 200);
    }

    // ---------- HELPER FUNCTIONS ----------
    private function authorizeRecruiter(): void
    {
        $user = Auth::guard('api')->user();
        if (!$user || !in_array($user->role, ['recruiter', 'hr', 'admin'], true)) {
            abort(403, 'Only HR users can manage jobs.');
        }
    }

    private function authorizeJobOwnership(JobPosting $jobPosting): void
    {
        $user = Auth::guard('api')->user();
        if ($jobPosting->user_id !== $user->id) {
            abort(403, 'You can only manage your own jobs.');
        }
    }

    private function validateJob(Request $request, bool $isCreate = true): array
    {
        $rules = [
            'title' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'salary' => ['nullable', 'regex:/^\\d+$/', 'max:100'],
            'description' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'what_youll_do' => 'nullable|array',
            'what_youll_do.*' => 'string|max:500',
            'why_company' => 'nullable|array',
            'why_company.*' => 'string|max:500',
            'project_timeline' => 'nullable|string',
            'onboarding_process' => 'nullable|string',
            'initials' => 'nullable|string|max:5',
            'color' => 'nullable|string|max:7',
            'time_ago' => 'nullable|string|max:50',
            'user_id' => 'nullable|integer',
            'recruiter_name' => 'nullable|string|max:255',
            'recruiter_role' => 'nullable|string|max:255',
        ];

        $validated = $request->validate($rules, [
            'salary.regex' => 'Salary range must contain numbers only.',
        ]);

        // Defaults
        $validated['initials'] = $validated['initials'] ?? strtoupper(substr($validated['company'], 0, 2));
        $validated['color'] = $validated['color'] ?? '#7EB0AB';
        $validated['time_ago'] = $validated['time_ago'] ?? 'Just now';
        $validated['tags'] = $validated['tags'] ?? [];
        $validated['what_youll_do'] = $validated['what_youll_do'] ?? [];
        $validated['why_company'] = $validated['why_company'] ?? [];

        if (array_key_exists('salary', $validated) && $validated['salary'] !== null) {
            $validated['salary'] = preg_replace('/\D+/', '', (string) $validated['salary']);
        }

        return $validated;
    }
}