<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\OtpCode;
use App\Mail\OtpMail;
use App\Mail\ResetPasswordMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Create a new AuthController instance.
     */
    public function __construct()
    {
    // middleware is now handled in routes/api.php or bootstrap/app.php in Laravel 11
    }

    /**
     * Register a User and send OTP for email verification.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'     => 'required|string|max:255|regex:/^[a-zA-Z\s]+$/',
            'email' => 'required|string|email|max:100|unique:users',
            'password' => 'required|string|min:6',
            'phone' => 'required|string|regex:/^639\d{9}$/',
            'location' => 'required|string|max:100',
            'role' => 'required|string|in:user,recruiter',
        ], [
            'phone.regex' => 'Phone must be a valid PH number (e.g. 09123456789).',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors()->toJson(), 400);
        }

        $user = User::create(array_merge(
            $validator->validated(),
        ['password' => Hash::make($request->password)]
        ));

        // Generate and send OTP
        $this->generateAndSendOtp($user->email);

        return response()->json([
            'message' => 'User registered successfully. Please check your email for the verification code.',
            'email' => $user->email,
        ], 201);
    }

    /**
     * Get a JWT via given credentials (only if email is verified).
     */
    public function login()
    {
        $credentials = request(['email', 'password']);

        // Check if user exists and email is verified
        $user = User::where('email', $credentials['email'])->first();

        if ($user && !$user->email_verified_at) {
            return response()->json([
                'error' => 'Please verify your email before signing in.',
                'email_not_verified' => true,
                'email' => $user->email,
            ], 403);
        }

        if (!$token = auth()->guard('api')->attempt($credentials)) {
            return response()->json(['error' => 'Invalid email or password'], 401);
        }

        return $this->respondWithToken($token);
    }

    /**
     * Verify OTP and activate user account.
     */
    public function verifyOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $otpRecord = OtpCode::where('email', $request->email)
            ->where('otp', $request->otp)
            ->first();

        if (!$otpRecord) {
            return response()->json(['error' => 'Invalid verification code.'], 400);
        }

        if ($otpRecord->isExpired()) {
            $otpRecord->delete();
            return response()->json(['error' => 'Verification code has expired. Please request a new one.'], 400);
        }

        // Mark email as verified
        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->email_verified_at = Carbon::now();
            $user->save();
        }

        // Delete all OTPs for this email
        OtpCode::where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Email verified successfully! You can now sign in.',
        ], 200);
    }

    /**
     * Resend OTP to user's email.
     */
    public function resendOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'No account found with this email.'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['error' => 'Email is already verified.'], 400);
        }

        $this->generateAndSendOtp($request->email);

        return response()->json([
            'message' => 'A new verification code has been sent to your email.',
        ], 200);
    }

    /**
     * Get the authenticated User.
     */
    public function me()
    {
        return response()->json(auth()->guard('api')->user());
    }

    /**
     * Update the authenticated user's profile information.
     */
    public function updateProfile(Request $request)
    {
        if ($request->has('skills') && is_string($request->input('skills'))) {
            $decoded = json_decode($request->input('skills'), true);
            if (is_array($decoded)) {
                $request->merge(['skills' => $decoded]);
            }
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|between:2,100',
            'phone' => 'sometimes|nullable|string|max:30',
            'location' => 'sometimes|nullable|string|max:100',
            'bio' => 'sometimes|nullable|string|max:500',
            'skills' => 'sometimes|array',
            'skills.*' => 'nullable|string|max:50',
            'profile_image' => 'sometimes|file|image|max:2048',
            // Recruiter fields
            'company_name' => 'sometimes|nullable|string|max:150',
            'company_number' => 'sometimes|nullable|string|max:50',
            'company_location' => 'sometimes|nullable|string|max:150',
            'position' => 'sometimes|nullable|string|max:150',
            'role' => 'sometimes|string|in:user,recruiter,admin',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        /** @var User $user */
        $user = auth()->guard('api')->user();
        $user->fill($validator->validated());

        if ($request->hasFile('profile_image')) {
            if ($user->profile_image && Storage::disk('public')->exists($user->profile_image)) {
                Storage::disk('public')->delete($user->profile_image);
            }

            $path = $request->file('profile_image')->store('profile-images', 'public');
            $user->profile_image = $path;
        }

        if ($request->has('skills')) {
            $cleanSkills = array_values(array_filter(
                $request->input('skills', []),
                fn ($skill) => is_string($skill) && trim($skill) !== ''
            ));
            $user->skills = $cleanSkills;
        }

        $user->save();
        $user->refresh();

        return response()->json($user);
    }

    /**
     * Change the authenticated user's password.
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        /** @var User $user */
        $user = auth()->guard('api')->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['error' => 'Current password is incorrect.'], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password changed successfully.']);
    }

    /**
     * Log the user out (Invalidate the token).
     */
    public function logout()
    {
        auth()->guard('api')->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh a token.
     */
    public function refresh()
    {
        /** @var \Tymon\JWTAuth\JWTGuard $guard */
        $guard = auth()->guard('api');

        return $this->respondWithToken($guard->refresh());
    }

    /**
     * Get the token array structure.
     */
    protected function respondWithToken($token)
{
    // Get the authenticated user
    /** @var \Tymon\JWTAuth\JWTGuard $jwtGuard */
    $jwtGuard = auth()->guard('api');
    $user = $jwtGuard->user();

    // Intelephense fix: call factory() on typed $jwtGuard
    $expiresIn = method_exists($jwtGuard, 'factory') ? $jwtGuard->factory()->getTTL() * 60 : (60 * 60);

    return response()->json([
        'access_token' => $token,
        'token_type' => 'bearer',
        'expires_in' => $expiresIn,
        'user' => [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ]
    ]);
}

    /**
     * Generate a 6-digit OTP and send it via email.
     */
    private function generateAndSendOtp(string $email): void
    {
        // Delete any existing OTPs for this email
        OtpCode::where('email', $email)->delete();

        // Generate a random 6-digit OTP
        $otp = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP with 10-minute expiry
        OtpCode::create([
            'email' => $email,
            'otp' => $otp,
            'expires_at' => Carbon::now()->addMinutes(10),
        ]);

        // Send the OTP email
        Mail::to($email)->send(new OtpMail($otp));
    }

    /**
     * Send a password reset link to the given email.
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // Don't reveal whether the email exists
            return response()->json([
                'message' => 'If an account with that email exists, we have sent a password reset link.',
            ], 200);
        }

        // Delete any existing tokens for this email
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Generate token
        $token = Str::random(64);

        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => Hash::make($token),
            'created_at' => Carbon::now(),
        ]);

        // Build reset URL pointing to the frontend
        $resetUrl = 'http://localhost:3000/user/reset-password?token=' . $token . '&email=' . urlencode($request->email);

        Mail::to($request->email)->send(new ResetPasswordMail($resetUrl));

        return response()->json([
            'message' => 'If an account with that email exists, we have sent a password reset link.',
        ], 200);
    }

    /**
     * Reset the user's password using the token.
     */
    public function resetPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'token' => 'required|string',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record) {
            return response()->json(['error' => 'Invalid or expired reset link.'], 400);
        }

        // Check if token matches
        if (!Hash::check($request->token, $record->token)) {
            return response()->json(['error' => 'Invalid or expired reset link.'], 400);
        }

        // Check if token is expired (60 minutes)
        if (Carbon::parse($record->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            return response()->json(['error' => 'Reset link has expired. Please request a new one.'], 400);
        }

        // Update password
        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->password = Hash::make($request->password);
            $user->save();
        }

        // Delete the token
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json([
            'message' => 'Password reset successfully! You can now sign in with your new password.',
        ], 200);
    }
}
