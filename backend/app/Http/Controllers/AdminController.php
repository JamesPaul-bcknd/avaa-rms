<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use App\Models\JobPosting;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Carbon\Carbon;
use Tymon\JWTAuth\JWTGuard;

class AdminController extends Controller
{
    /**
     * Admin login — validates credentials and checks role.
     */
    public function login(Request $request)
    {
        $credentials = $request->only(['email', 'password']);

        /** @var JWTGuard $guard */
        $guard = auth()->guard('api');

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !$user->isAdmin()) {
            return response()->json(['error' => 'Invalid admin credentials.'], 401);
        }

        if (!$token = $guard->attempt($credentials)) {
            return response()->json(['error' => 'Invalid admin credentials.'], 401);
        }

        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => $guard->factory()->getTTL() * 60,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'profile_image_url' => $user->profile_image_url,
            ],
        ]);
    }

    /**
     * Get the authenticated admin user.
     */
    public function me()
    {
        /** @var User|null $user */
        $user = auth()->guard('api')->user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'profile_image_url' => $user->profile_image_url,
        ]);
    }

    /**
     * Update authenticated admin profile details.
     */
    public function updateProfile(Request $request)
    {
        /** @var User|null $user */
        $user = auth()->guard('api')->user();

        if (!$user || !$user->isAdmin()) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|between:2,100',
            'email' => [
                'sometimes',
                'string',
                'email',
                'max:100',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'current_password' => 'required_with:new_password|string|min:6',
            'new_password' => 'nullable|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        if ($request->filled('new_password')) {
            if (!Hash::check((string) $request->current_password, (string) $user->password)) {
                return response()->json(['error' => 'Current password is incorrect.'], 422);
            }

            $user->password = Hash::make((string) $request->new_password);
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'profile_image_url' => $user->profile_image_url,
            ],
        ]);
    }

    /**
     * Admin logout.
     */
    public function logout()
    {
        auth()->guard('api')->logout();
        return response()->json(['message' => 'Successfully logged out.']);
    }

    /**
     * Dashboard stats from the database.
     */
    public function dashboard()
    {
        $months = (int) request()->query('months', 6);
        if (!in_array($months, [6, 12], true)) {
            $months = 6;
        }

        $totalUsers = User::where('role', 'user')->count();
        $verifiedUsers = User::where('role', 'user')->whereNotNull('email_verified_at')->count();
        $unverifiedUsers = User::where('role', 'user')->whereNull('email_verified_at')->count();
        $totalJobs = JobPosting::count();
        $totalApplications = JobApplication::count();

        $startOfCurrentMonth = Carbon::now()->startOfMonth();
        $usersThisMonth = User::where('role', 'user')->where('created_at', '>=', $startOfCurrentMonth)->count();
        $jobsThisMonth = JobPosting::where('created_at', '>=', $startOfCurrentMonth)->count();
        $applicationsThisMonth = JobApplication::where('created_at', '>=', $startOfCurrentMonth)->count();

        // There is no dedicated visits table yet. We use real monthly platform events as a live engagement proxy.
        $totalVisits = $usersThisMonth + $jobsThisMonth + $applicationsThisMonth + Message::where('created_at', '>=', $startOfCurrentMonth)->count();

        $previousMonthStart = Carbon::now()->subMonth()->startOfMonth();
        $previousMonthEnd = Carbon::now()->subMonth()->endOfMonth();

        $previousUsers = User::where('role', 'user')
            ->whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])
            ->count();
        $previousJobs = JobPosting::whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])->count();
        $previousApplications = JobApplication::whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])->count();
        $previousVisits =
            $previousUsers +
            $previousJobs +
            $previousApplications +
            Message::whereBetween('created_at', [$previousMonthStart, $previousMonthEnd])->count();

        $toTrend = function (int $current, int $previous): array {
            if ($previous === 0) {
                return [
                    'value' => $current > 0 ? 100 : 0,
                    'direction' => $current > 0 ? 'up' : 'flat',
                ];
            }

            $delta = (($current - $previous) / $previous) * 100;

            return [
                'value' => round(abs($delta), 1),
                'direction' => $delta > 0 ? 'up' : ($delta < 0 ? 'down' : 'flat'),
            ];
        };

        // Monthly registrations
        $userGrowth = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $userGrowth[] = [
                'month' => $date->format('M'),
                'users' => User::where('role', 'user')
                    ->whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
            ];
        }

        // Monthly applications for trends chart
        $applicationGrowth = [];
        for ($i = $months - 1; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $applicationGrowth[] = [
                'month' => $date->format('M'),
                'applications' => JobApplication::whereYear('created_at', $date->year)
                    ->whereMonth('created_at', $date->month)
                    ->count(),
            ];
        }

        // Recent users summary table (last 5)
        $recentUsers = User::where('role', 'user')
            ->withCount('jobApplications')
            ->latest()
            ->take(5)
            ->get(['id', 'name', 'email', 'created_at', 'email_verified_at']);

        // System activity feed from real events
        $jobActivities = JobPosting::latest()->take(5)->get(['id', 'title', 'recruiter_name', 'created_at'])
            ->map(function (JobPosting $job) {
                return [
                    'id' => 'job-' . $job->id,
                    'type' => 'job_posted',
                    'title' => 'JOB POSTED',
                    'description' => $job->title,
                    'author' => $job->recruiter_name ?: 'Admin',
                    'created_at' => $job->created_at,
                ];
            });

        $registrationActivities = User::where('role', 'user')->latest()->take(5)
            ->get(['id', 'name', 'created_at'])
            ->map(function (User $user) {
                return [
                    'id' => 'user-' . $user->id,
                    'type' => 'user_registered',
                    'title' => 'USER REGISTERED',
                    'description' => $user->name . ' joined the platform.',
                    'author' => $user->name,
                    'created_at' => $user->created_at,
                ];
            });

        $applicationActivities = JobApplication::with('jobPosting:id,title')->latest()->take(5)
            ->get(['id', 'full_name', 'job_posting_id', 'created_at'])
            ->map(function (JobApplication $application) {
                return [
                    'id' => 'application-' . $application->id,
                    'type' => 'application_submitted',
                    'title' => 'APPLICATION SUBMITTED',
                    'description' => $application->full_name . ' applied for ' . ($application->jobPosting?->title ?? 'a role') . '.',
                    'author' => $application->full_name,
                    'created_at' => $application->created_at,
                ];
            });

        $activityFeedAll = collect([$jobActivities, $registrationActivities, $applicationActivities])
            ->flatten(1)
            ->sortByDesc('created_at')
            ->values();

        $activityFeedRecent = $activityFeedAll->take(5)->values();

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'verified_users' => $verifiedUsers,
                'unverified_users' => $unverifiedUsers,
                'total_jobs' => $totalJobs,
                'total_applications' => $totalApplications,
                'total_visits' => $totalVisits,
                'monthly' => [
                    'users' => $usersThisMonth,
                    'jobs' => $jobsThisMonth,
                    'applications' => $applicationsThisMonth,
                    'visits' => $totalVisits,
                ],
                'trends' => [
                    'users' => $toTrend($usersThisMonth, $previousUsers),
                    'jobs' => $toTrend($jobsThisMonth, $previousJobs),
                    'applications' => $toTrend($applicationsThisMonth, $previousApplications),
                    'visits' => $toTrend($totalVisits, $previousVisits),
                ],
            ],
            'months' => $months,
            'user_growth' => $userGrowth,
            'application_growth' => $applicationGrowth,
            'recent_users' => $recentUsers,
            'activity_feed' => $activityFeedRecent,
            'activity_feed_all' => $activityFeedAll,
        ]);
    }

    /**
     * List all users with optional search and pagination.
     */
    public function users(Request $request)
    {
        $query = User::whereIn('role', ['user', 'recruiter'])
            ->withCount('jobApplications');

        // Search by name or email
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Filter by active status
        $status = $request->query('status');
        if (in_array($status, ['active', 'verified'], true)) {
            $query->whereNotNull('email_verified_at');
        } elseif (in_array($status, ['inactive', 'unverified'], true)) {
            $query->whereNull('email_verified_at');
        }

        // Filter by role in user management UI
        if ($request->query('user_type') === 'user') {
            $query->where('role', 'user');
        } elseif ($request->query('user_type') === 'recruiter') {
            $query->where('role', 'recruiter');
        }

        $users = $query->latest()->paginate($request->query('per_page', 15));

        return response()->json($users);
    }

    /**
     * Get job details for admin job management drill-down.
     */
    public function showJob(int $id)
    {
        $job = JobPosting::with([
            'recruiter:id,name,email',
        ])->withCount([
            'applications',
            'applications as pending_applications_count' => function ($query) {
                $query->where(function ($statusQuery) {
                    $statusQuery->whereNull('status')->orWhere('status', 'pending');
                });
            },
            'applications as approved_applications_count' => function ($query) {
                $query->whereIn('status', ['approved', 'accepted']);
            },
            'applications as rejected_applications_count' => function ($query) {
                $query->where('status', 'rejected');
            },
            'applications as interview_applications_count' => function ($query) {
                $query->whereIn('status', ['interview', 'interview_scheduled']);
            },
        ])->findOrFail($id);

        return response()->json([
            'job' => [
                'id' => $job->id,
                'title' => $job->title,
                'company' => $job->company,
                'location' => $job->location,
                'type' => $job->type,
                'salary' => $job->salary,
                'description' => $job->description,
                'tags' => $job->tags ?? [],
                'what_youll_do' => $job->what_youll_do ?? [],
                'why_company' => $job->why_company ?? [],
                'created_at' => $job->created_at,
                'recruiter' => [
                    'name' => $job->recruiter_name ?: $job->recruiter?->name,
                    'role' => $job->recruiter_role,
                    'email' => $job->recruiter?->email,
                ],
                'applicant_counts' => [
                    'total' => $job->applications_count,
                    'pending' => $job->pending_applications_count,
                    'approved' => $job->approved_applications_count,
                    'rejected' => $job->rejected_applications_count,
                    'interview' => $job->interview_applications_count,
                ],
            ],
        ]);
    }

    /**
     * List job applicants with status/date/sort filtering for admin views.
     */
    public function jobApplicants(Request $request, int $id)
    {
        $job = JobPosting::findOrFail($id);

        $status = (string) $request->query('status', 'all');
        $sort = (string) $request->query('sort', 'newest');
        $dateRange = (string) $request->query('date_range', 'all');

        $query = JobApplication::with('applicant:id,name,email,phone,location')
            ->where('job_posting_id', $job->id);

        if ($status !== 'all') {
            if ($status === 'pending') {
                $query->where(function ($statusQuery) {
                    $statusQuery->whereNull('status')->orWhere('status', 'pending');
                });
            } elseif ($status === 'approved') {
                $query->whereIn('status', ['approved', 'accepted']);
            } elseif ($status === 'interview') {
                $query->whereIn('status', ['interview', 'interview_scheduled']);
            } else {
                $query->where('status', $status);
            }
        }

        if ($dateRange === '7d') {
            $query->where('created_at', '>=', Carbon::now()->subDays(7));
        } elseif ($dateRange === '30d') {
            $query->where('created_at', '>=', Carbon::now()->subDays(30));
        } elseif ($dateRange === '90d') {
            $query->where('created_at', '>=', Carbon::now()->subDays(90));
        }

        if ($sort === 'oldest') {
            $query->oldest();
        } elseif ($sort === 'name_asc') {
            $query->orderBy('full_name', 'asc');
        } elseif ($sort === 'name_desc') {
            $query->orderBy('full_name', 'desc');
        } else {
            $query->latest();
        }

        $applications = $query->get();

        $allForCounts = JobApplication::where('job_posting_id', $job->id)->get(['status']);
        $counts = [
            'all' => $allForCounts->count(),
            'pending' => $allForCounts->filter(function (JobApplication $application) {
                return $application->status === null || $application->status === 'pending';
            })->count(),
            'approved' => $allForCounts->filter(function (JobApplication $application) {
                return in_array($application->status, ['approved', 'accepted'], true);
            })->count(),
            'rejected' => $allForCounts->where('status', 'rejected')->count(),
            'interview' => $allForCounts->filter(function (JobApplication $application) {
                return in_array($application->status, ['interview', 'interview_scheduled'], true);
            })->count(),
        ];

        return response()->json([
            'job' => [
                'id' => $job->id,
                'title' => $job->title,
            ],
            'filters' => [
                'status' => $status,
                'sort' => $sort,
                'date_range' => $dateRange,
            ],
            'counts' => $counts,
            'applicants' => $applications->map(function (JobApplication $application) {
                return [
                    'id' => $application->id,
                    'full_name' => $application->full_name,
                    'email' => $application->email,
                    'phone' => $application->phone,
                    'location' => $application->applicant?->location,
                    'experience' => $application->experience,
                    'linkedin' => $application->linkedin,
                    'status' => in_array($application->status, ['approved', 'accepted'], true)
                        ? 'accepted'
                        : ($application->status ?: 'pending'),
                    'created_at' => $application->created_at,
                    'interview_date' => $application->interview_date,
                    'interview_time' => $application->interview_time,
                ];
            })->values(),
        ]);
    }

    /**
     * Get complete applicant details for the job applicants drill-down screen.
     */
    public function jobApplicantDetails(int $id, int $applicationId)
    {
        $job = JobPosting::findOrFail($id);

        $application = JobApplication::with([
            'applicant:id,name,email,phone,location,bio,skills,position,profile_image',
            'jobPosting:id,title',
        ])->where('job_posting_id', $job->id)->findOrFail($applicationId);

        $applicant = $application->applicant;

        $timeline = collect();
        if ($applicant) {
            $timeline = JobApplication::with('jobPosting:id,title')
                ->where('user_id', $applicant->id)
                ->latest()
                ->take(3)
                ->get()
                ->map(function (JobApplication $item) {
                    $company = $item->jobPosting?->title ?: 'Role Application';
                    $from = optional($item->created_at)->format('M Y') ?: 'N/A';
                    $to = optional($item->updated_at)->format('M Y') ?: 'Present';
                    $status = $item->status ?: 'pending';

                    return [
                        'id' => $item->id,
                        'title' => $company,
                        'company' => 'Application Track',
                        'period' => $from . ' - ' . $to,
                        'status' => $status,
                        'summary' => $item->experience,
                    ];
                });
        }

        return response()->json([
            'applicant' => [
                'application_id' => $application->id,
                'job_id' => $job->id,
                'job_title' => $job->title,
                'name' => $application->full_name ?: $applicant?->name,
                'headline' => $applicant?->position ?: 'Aspiring UI/UX Designer',
                'email' => $application->email ?: $applicant?->email,
                'phone' => $application->phone ?: $applicant?->phone,
                'location' => $applicant?->location,
                'status' => $application->status ?: 'pending',
                'about' => $applicant?->bio,
                'skills' => $applicant?->skills ?: [],
                'experience_text' => $application->experience,
                'linkedin' => $application->linkedin,
                'profile_image_url' => $applicant?->profile_image_url,
                'timeline' => $timeline->values(),
                'certificates' => [],
            ],
        ]);
    }

    /**
     * Get a single user.
     */
    public function showUser(int $id)
    {
        $user = User::whereIn('role', ['user', 'recruiter'])
            ->withCount(['jobApplications', 'jobPostings'])
            ->findOrFail($id);

        $applicationActivities = JobApplication::where('user_id', $user->id)
            ->latest()
            ->take(3)
            ->get(['id', 'created_at', 'status'])
            ->map(function (JobApplication $application) {
                return [
                    'id' => 'application-' . $application->id,
                    'title' => 'Submitted Application',
                    'description' => 'Application status: ' . ($application->status ?: 'pending'),
                    'created_at' => $application->created_at,
                ];
            });

        $messageActivities = Message::where('sender_id', $user->id)
            ->orWhere('receiver_id', $user->id)
            ->latest()
            ->take(2)
            ->get(['id', 'created_at'])
            ->map(function (Message $message) {
                return [
                    'id' => 'message-' . $message->id,
                    'title' => 'Messaging Activity',
                    'description' => 'User exchanged a message.',
                    'created_at' => $message->created_at,
                ];
            });

        $recentActivity = collect([$applicationActivities, $messageActivities])
            ->flatten(1)
            ->sortByDesc('created_at')
            ->take(5)
            ->values();

        return response()->json([
            'user' => $user,
            'recent_activity' => $recentActivity,
        ]);
    }

    /**
     * Update a user (name, email, role, or reset password).
     */
    public function updateUser(Request $request, int $id)
    {
        $user = User::whereIn('role', ['user', 'recruiter'])->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|between:2,100',
            'email' => 'sometimes|string|email|max:100|unique:users,email,' . $id,
            'role' => 'sometimes|in:user,recruiter',
            'phone' => 'sometimes|nullable|string|max:50',
            'location' => 'sometimes|nullable|string|max:255',
            'bio' => 'sometimes|nullable|string|max:2000',
            'skills' => 'sometimes|array',
            'skills.*' => 'string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 422);
        }

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        if ($request->has('role')) {
            $user->role = $request->role;
        }

        if ($request->has('phone')) {
            $user->phone = $request->phone;
        }

        if ($request->has('location')) {
            $user->location = $request->location;
        }

        if ($request->has('bio')) {
            $user->bio = $request->bio;
        }

        if ($request->has('skills')) {
            $user->skills = $request->skills ?? [];
        }

        // Allow toggling email verification
        if ($request->has('email_verified')) {
            $user->email_verified_at = $request->email_verified
                ? ($user->email_verified_at ?? Carbon::now())
                : null;
        }

        $user->save();

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user,
        ]);
    }

    /**
     * Delete a user.
     */
    public function deleteUser(int $id)
    {
        $user = User::whereIn('role', ['user', 'recruiter'])->findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }
}
