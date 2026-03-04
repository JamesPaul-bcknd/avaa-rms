<?php

namespace App\Http\Controllers;

use App\Models\JobPosting;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        // Fetch all jobs
        $jobs = JobPosting::withCount('applications')->latest()->get();

        // Return as JSON with a 200 OK status
        return response()->json([
            'success' => true,
            'data' => $jobs
        ], 200);
    }
}