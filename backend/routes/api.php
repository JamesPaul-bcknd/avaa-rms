<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SocialAuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\JobPostingController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\HrProfileController;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- Authentication Routes (Prefix: /api/auth) ---
Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {
    // Standard Auth
    Route::post('register', [AuthController::class , 'register']);
    Route::post('login', [AuthController::class , 'login']);
    Route::post('verify-otp', [AuthController::class , 'verifyOtp']);
    Route::post('resend-otp', [AuthController::class , 'resendOtp']);
    Route::post('forgot-password', [AuthController::class , 'forgotPassword']);
    Route::post('reset-password', [AuthController::class , 'resetPassword']);

    // Social Auth
    Route::get('google', [SocialAuthController::class, 'redirectToGoogle']);
    Route::get('google/callback', [SocialAuthController::class, 'handleGoogleCallback']);
    Route::get('linkedin', [SocialAuthController::class, 'redirectToLinkedIn']);
    Route::get('linkedin/callback', [SocialAuthController::class, 'handleLinkedInCallback']);

    // Protected User Auth
    Route::group(['middleware' => 'auth:api'], function() {
        Route::post('logout', [AuthController::class , 'logout']);
        Route::post('refresh', [AuthController::class , 'refresh']);
        Route::post('me', [AuthController::class , 'me']);
        Route::put('profile', [AuthController::class , 'updateProfile']);
        Route::put('change-password', [AuthController::class , 'changePassword']);
    });
});

// --- Admin Routes (Prefix: /api/admin) ---
Route::group([
    'prefix' => 'admin'
], function ($router) {
    Route::post('login', [AdminController::class, 'login']);

    Route::group(['middleware' => ['auth:api', 'admin']], function () {
        Route::post('me', [AdminController::class, 'me']);
        Route::post('logout', [AdminController::class, 'logout']);
        Route::get('dashboard', [AdminController::class, 'dashboard']);
        Route::get('users', [AdminController::class, 'users']);
        Route::get('users/{id}', [AdminController::class, 'showUser']);
        Route::put('users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('users/{id}', [AdminController::class, 'deleteUser']);
    });
});

// --- Job Routes (Prefix: /api/jobs) ---
Route::group([
    'prefix' => 'jobs'
], function () {
    // Public: View all jobs
    Route::get('/', [DashboardController::class, 'index']); 

    // Recruiter: Manage jobs
    Route::group(['middleware' => 'auth:api'], function () {
        Route::get('/my-jobs', [JobPostingController::class, 'index']);
        Route::post('/', [JobPostingController::class, 'store']);
        Route::put('/{jobPosting}', [JobPostingController::class, 'update']);
        Route::delete('/{jobPosting}', [JobPostingController::class, 'destroy']);
        Route::get('/{jobPosting}/applications', [JobApplicationController::class, 'index']);
        Route::post('/{jobPosting}/apply', [JobApplicationController::class, 'store']);
    });

    // Protected: Bookmark a specific job
    // URL: POST /api/jobs/{jobId}/bookmark
    Route::post('/{jobId}/bookmark', [BookmarkController::class, 'toggleBookmark'])
        ->middleware('auth:api');
});

// --- User Bookmarks Management (Prefix: /api/bookmarks) ---
Route::group([
    'middleware' => 'auth:api',
], function () {
    // URL: GET /api/bookmarks
   Route::get('/bookmarks', [BookmarkController::class, 'index']);
   Route::get('/bookmarks/jobs', [BookmarkController::class, 'getSavedJobs']);
});

// --- HR Profile Routes (Prefix: /api/hr) ---
Route::group([
    'middleware' => 'auth:api',
    'prefix' => 'hr'
], function () {
    Route::get('/users', [HrProfileController::class, 'index']);
    Route::get('/users/{userId}', [HrProfileController::class, 'show']);
    Route::get('/conversable-users', [HrProfileController::class, 'getConversableUsers']);
    Route::get('/search', [HrProfileController::class, 'search']);
    Route::get('/profile', [HrProfileController::class, 'profile']);
    Route::put('/profile', [HrProfileController::class, 'updateProfile']);
});

// --- Messaging Routes (Prefix: /api/messages) ---
Route::group([
    'middleware' => 'auth:api',
    'prefix' => 'messages'
], function () {
    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::get('/conversation/{userId}', [MessageController::class, 'conversation']);
    Route::post('/conversation/{userId}', [MessageController::class, 'send']);
    Route::put('/{messageId}/read', [MessageController::class, 'markAsRead']);
    Route::delete('/conversation/{userId}', [MessageController::class, 'deleteConversation']);
    Route::get('/unread-count', [MessageController::class, 'unreadCount']);
});