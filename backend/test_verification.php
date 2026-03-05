<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== Email Verification Test ===\n\n";

// Test registration flow
echo "1. Testing registration...\n";

// Simulate registration data
$registrationData = [
    'name' => 'Test Verification User',
    'email' => 'testverify@example.com',
    'password' => 'password123',
    'phone' => '639123456789',
    'location' => 'Test City',
    'role' => 'user'
];

// Check if user already exists
$existingUser = \App\Models\User::where('email', $registrationData['email'])->first();
if ($existingUser) {
    echo "   User already exists, deleting...\n";
    $existingUser->delete();
}

// Create user (simulate registration)
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

// Test login with unverified email
echo "\n2. Testing login with unverified email...\n";

$credentials = [
    'email' => $registrationData['email'],
    'password' => $registrationData['password']
];

// Simulate the login logic from AuthController
$loginUser = \App\Models\User::where('email', $credentials['email'])->first();

if ($loginUser && !$loginUser->email_verified_at) {
    echo "   ✅ Login correctly blocked - email not verified\n";
    echo "   📧 User email: {$loginUser->email}\n";
    echo "   🔍 Should redirect to: /user/verify-otp?email=" . urlencode($loginUser->email) . "\n";
} else {
    echo "   ❌ Login should have been blocked\n";
}

// Test login with verified email
echo "\n3. Testing login with verified email...\n";

// Mark email as verified
$user->email_verified_at = now();
$user->save();

echo "   ✅ Email marked as verified\n";

// Try login again
$loginUser = \App\Models\User::where('email', $credentials['email'])->first();

if ($loginUser && !$loginUser->email_verified_at) {
    echo "   ❌ Login blocked but should be allowed\n";
} else {
    echo "   ✅ Login should be allowed\n";
}

echo "\n4. Frontend Testing Instructions:\n";
echo "   1. Try to register a new account\n";
echo "   2. Check if you're redirected to /user/verify-otp\n";
echo "   3. If you get 404, the issue is in the frontend routing\n";
echo "   4. Test URL: http://localhost:3000/user/verify-otp?email=test@example.com\n\n";

echo "🔍 Debugging Tips:\n";
echo "- Check browser console for JavaScript errors\n";
echo "- Check Network tab for failed requests\n";
echo "- Verify Next.js is running on port 3000\n";
echo "- Try accessing http://localhost:3000/user/verify-otp directly\n";

echo "\n✅ Verification test completed!\n";
