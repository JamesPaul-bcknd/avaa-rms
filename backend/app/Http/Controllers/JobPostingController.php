<?php

namespace App\Http\Controllers;

use App\Models\JobPosting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class JobPostingController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $this->authorizeRecruiter();

        $validated = $this->validateJob($request);
        $job = JobPosting::create($validated);

        return response()->json(['success' => true, 'data' => $job], 201);
    }

    public function update(Request $request, JobPosting $jobPosting): JsonResponse
    {
        $this->authorizeRecruiter();

        $validated = $this->validateJob($request, false);
        $jobPosting->update($validated);

        return response()->json(['success' => true, 'data' => $jobPosting], 200);
    }

    public function destroy(JobPosting $jobPosting): JsonResponse
    {
        $this->authorizeRecruiter();

        $jobPosting->delete();

        return response()->json(['success' => true], 200);
    }

    private function authorizeRecruiter(): void
    {
        $user = Auth::guard('api')->user();
        if (!$user || $user->role !== 'recruiter') {
            abort(403, 'Only recruiters can manage jobs.');
        }
    }

    private function validateJob(Request $request, bool $isCreate = true): array
    {
        $rules = [
            'title' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'type' => 'required|string|max:100',
            'salary' => 'nullable|string|max:100',
            'description' => 'required|string',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
            'what_youll_do' => 'nullable|array',
            'what_youll_do.*' => 'string|max:500',
            'why_company' => 'nullable|array',
            'why_company.*' => 'string|max:500',
            'initials' => 'nullable|string|max:5',
            'color' => 'nullable|string|max:7',
            'time_ago' => 'nullable|string|max:50',
        ];

        $validated = $request->validate($rules);

        // Defaults
        $validated['initials'] = $validated['initials'] ?? strtoupper(substr($validated['company'], 0, 2));
        $validated['color'] = $validated['color'] ?? '#7EB0AB';
        $validated['time_ago'] = $validated['time_ago'] ?? 'Just now';
        $validated['tags'] = $validated['tags'] ?? [];
        $validated['what_youll_do'] = $validated['what_youll_do'] ?? [];
        $validated['why_company'] = $validated['why_company'] ?? [];

        return $validated;
    }
}
