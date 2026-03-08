<?php

namespace App\Http\Controllers;

use App\Models\JobPosting;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        // Include both total applications and active applications.
        // Active applicants are those still pending review.
        $jobs = JobPosting::withCount([
            'applications',
            'applications as active_applications_count' => function ($query) {
                $query->where(function ($statusQuery) {
                    $statusQuery->whereNull('status')
                        ->orWhere('status', 'pending');
                });
            },
        ])->latest()->get();

        // Return as JSON with a 200 OK status
        return response()->json([
            'success' => true,
            'data' => $jobs
        ], 200);
    }
}