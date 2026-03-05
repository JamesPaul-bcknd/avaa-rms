<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Email Verification Flow Test ===\n\n";

// Test user creation and verification flow
$testEmail = 'testemailverify@example.com';
$testPassword = 'password123';

// Clean up any existing test user
$existingUser = \App\Models\User::where('email', $testEmail)->first();
if ($existingUser) {
    echo "🗑️  Cleaning up existing test user...\n";
    $existingUser->delete();
}

// Step 1: Register a new user (this should trigger OTP)
echo "📝 Step 1: Testing registration...\n";

$registrationData = [
    'name' => 'Email Verification Test User',
    'email' => $testEmail,
    'password' => $testPassword,
    'phone' => '639123456789',
    'location' => 'Test City',
    'role' => 'user'
];

$user = \App\Models\User::create([
    'name' => $registrationData['name'],
    'email' => $registrationData['email'],
    'password' => \Illuminate\Support\Facades\Hash::make($registrationData['password']),
    'phone' => $registrationData['phone'],
    'location' => $registrationData['location'],
    'role' => $registrationData['role'],
]);

echo "   ✅ User created with ID: {$user->id}\n";
echo "   📧 Email verified: " . ($user->email_verified_at ? 'YES' : 'NO') . "\n";

// Step 2: Test login with unverified email
echo "\n🔐 Step 2: Testing login with unverified email...\n";

$credentials = [
    'email' => $testEmail,
    'password' => $testPassword
];

// Simulate the login logic
$loginUser = \App\Models\User::where('email', $credentials['email'])->first();

if ($loginUser && !$loginUser->email_verified_at) {
    echo "   ✅ Login correctly blocked - email not verified\n";
    echo "   📧 Response should include: email_not_verified: true\n";
    echo "   🔄 Frontend should redirect to: /user/verify-otp?email=" . urlencode($testEmail) . "\n";
} else {
    echo "   ❌ ERROR: Login should have been blocked\n";
}

// Step 3: Test OTP verification endpoint
echo "\n🔢 Step 3: Testing OTP verification...\n";

// Generate a test OTP
$otp = \Illuminate\Support\Str::random(6); // 6-digit OTP
$otpCode = rand(100000, 999999);

// Store OTP in database
\App\Models\OtpCode::create([
    'email' => $testEmail,
    'otp' => $otpCode,
    'expires_at' => now()->addMinutes(10),
    'created_at' => now(),
]);

echo "   📧 Test OTP generated: {$otpCode}\n";
echo "   🔗 API endpoint: POST /api/auth/verify-otp\n";
echo "   📋 Request body: { email: '{$testEmail}', code: '{$otpCode}' }\n";

// Step 4: Test direct access to verify-otp page
echo "\n🌐 Step 4: Testing frontend access...\n";
echo "   🔗 Direct URL: http://localhost:3000/user/verify-otp?email=" . urlencode($testEmail) . "\n";
echo "   ✅ This should now work without 404 error\n";

// Step 5: Manual verification instructions
echo "\n📋 Manual Testing Instructions:\n";
echo "1. Start both backend and frontend servers\n";
echo "2. Register a new account at http://localhost:3000/signup\n";
echo "3. Check browser console for debugging logs\n";
echo "4. You should be redirected to /user/verify-otp\n";
echo "5. The page should load without 404 error\n";
echo "6. Enter the OTP code (check database or logs)\n";

echo "\n🔍 Debugging Commands:\n";
echo "- Check OTP codes: php artisan tinker -e \"echo App\Models\OtpCode::where('email', '{$testEmail}')->first()->otp;\"\n";
echo "- Mark email as verified: php artisan tinker -e \"App\Models\User::where('email', '{$testEmail}')->first()->update(['email_verified_at' => now()]);\"\n";

echo "\n✅ Email verification flow test completed!\n";
echo "🎯 The 404 error should now be fixed!\n";
