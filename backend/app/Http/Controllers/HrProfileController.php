<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class HrProfileController extends Controller
{
    /**
     * Get all users that HR can view profiles for
     * SECURITY: Only show users who have applied to recruiter's jobs and been accepted
     */
    public function index(): JsonResponse
    {
        $hrUser = Auth::guard('api')->user();
        
        // Verify user is HR/recruiter
        if (!$this->isHrUser($hrUser)) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized access',
            ], 403);
        }

        // Get only users who applied to this recruiter's jobs and were accepted
        $users = User::where('role', 'user')
            ->whereHas('jobApplications', function($query) use ($hrUser) {
                $query->where('status', 'accepted')
                      ->whereHas('jobPosting', function($jobQuery) use ($hrUser) {
                          $jobQuery->where('user_id', $hrUser->id);
                      });
            })
            ->select(['id', 'name', 'email', 'phone', 'location', 'bio', 'profile_image', 'skills', 'position', 'created_at', 'updated_at'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Get specific user profile details
     * SECURITY: Only allow viewing users who applied to recruiter's jobs and were accepted
     */
    public function show($userId): JsonResponse
    {
        $hrUser = Auth::guard('api')->user();
        
        // Verify user is HR/recruiter
        if (!$this->isHrUser($hrUser)) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized access',
            ], 403);
        }

        // Only allow viewing users who applied to this recruiter's jobs and were accepted
        $user = User::where('id', $userId)
            ->where('role', 'user')
            ->whereHas('jobApplications', function($query) use ($hrUser) {
                $query->where('status', 'accepted')
                      ->whereHas('jobPosting', function($jobQuery) use ($hrUser) {
                          $jobQuery->where('user_id', $hrUser->id);
                      });
            })
            ->select(['id', 'name', 'email', 'phone', 'location', 'bio', 'profile_image', 'skills', 'position', 'created_at', 'updated_at'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    /**
     * Get users that HR has conversations with
     * SECURITY: Only show accepted applicants from recruiter's jobs
     */
    public function getConversableUsers(): JsonResponse
    {
        $hrUser = Auth::guard('api')->user();
        
        // Verify user is HR/recruiter
        if (!$this->isHrUser($hrUser)) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized access',
            ], 403);
        }

        // Get only accepted applicants from this recruiter's jobs
        $users = User::where('role', 'user')
            ->whereHas('jobApplications', function($query) use ($hrUser) {
                $query->where('status', 'accepted')
                      ->whereHas('jobPosting', function($jobQuery) use ($hrUser) {
                          $jobQuery->where('user_id', $hrUser->id);
                      });
            })
            ->where(function($query) use ($hrUser) {
                // Users HR has messaged with or can message (accepted applicants only)
                $query->whereHas('receivedMessages', function($q) use ($hrUser) {
                    $q->where('sender_id', $hrUser->id);
                })
                ->orWhereHas('messages', function($q) use ($hrUser) {
                    $q->where('receiver_id', $hrUser->id);
                })
                // Or all accepted applicants (for messaging)
                ->orWhereRaw('1 = 1');
            })
            ->select(['id', 'name', 'email', 'phone', 'location', 'bio', 'profile_image', 'skills', 'position'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Search users by name or email
     * SECURITY: Only search within accepted applicants from recruiter's jobs
     */
    public function search(Request $request): JsonResponse
    {
        $hrUser = Auth::guard('api')->user();
        
        // Verify user is HR/recruiter
        if (!$this->isHrUser($hrUser)) {
            return response()->json([
                'success' => false,
                'error' => 'Unauthorized access',
            ], 403);
        }

        $request->validate([
            'query' => 'required|string|min:2|max:100',
        ]);

        $query = $request->input('query');

        // Search only within accepted applicants from this recruiter's jobs
        $users = User::where('role', 'user')
            ->whereHas('jobApplications', function($query) use ($hrUser) {
                $query->where('status', 'accepted')
                      ->whereHas('jobPosting', function($jobQuery) use ($hrUser) {
                          $jobQuery->where('user_id', $hrUser->id);
                      });
            })
            ->where(function($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('email', 'like', "%{$query}%")
                  ->orWhere('position', 'like', "%{$query}%");
            })
            ->select(['id', 'name', 'email', 'phone', 'location', 'bio', 'profile_image', 'skills', 'position'])
            ->orderBy('name')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    /**
     * Get current HR user's own profile
     */
    public function profile(): JsonResponse
    {
        $user = Auth::guard('api')->user();
        
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'location' => $user->location,
                'bio' => $user->bio,
                'profile_image_url' => $user->profile_image_url,
                'role' => $user->role,
                'position' => $user->position ?? 'Senior Tech Talent Partner',
                'company_name' => $user->company_name,
                'company_number' => $user->company_number,
                'skills' => $user->skills ?? [],
                'created_at' => $user->created_at,
            ]
        ]);
    }

    /**
     * Update current HR user's profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = Auth::guard('api')->user();
        
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:20',
            'location' => 'nullable|string|max:255',
            'bio' => 'nullable|string|max:1000',
            'position' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'company_number' => 'nullable|string|max:20',
            'skills' => 'nullable|array',
            'skills.*' => 'string|max:50',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'location' => $user->location,
                'bio' => $user->bio,
                'profile_image_url' => $user->profile_image_url,
                'role' => $user->role,
                'position' => $user->position ?? 'Senior Tech Talent Partner',
                'company_name' => $user->company_name,
                'company_number' => $user->company_number,
                'skills' => $user->skills ?? [],
                'created_at' => $user->created_at,
            ]
        ]);
    }

    /**
     * Check if current user is HR/recruiter
     */
    private function isHrUser($user): bool
    {
        return in_array($user->role, ['recruiter', 'hr', 'admin']);
    }
}
