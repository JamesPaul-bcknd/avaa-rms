<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== AVAA RMS Messaging Test ===\n\n";

// Get test users
$jobSeeker = \App\Models\User::where('email', 'jobseeker@test.com')->first();
$recruiter = \App\Models\User::where('email', 'recruiter@test.com')->first();

if (!$jobSeeker || !$recruiter) {
    echo "❌ Test users not found!\n";
    exit(1);
}

echo "✅ Test users found:\n";
echo "   Job Seeker: {$jobSeeker->name} ({$jobSeeker->email})\n";
echo "   Recruiter: {$recruiter->name} ({$recruiter->email})\n\n";

// Test messaging permissions
$messageController = new \App\Http\Controllers\MessageController();
$reflection = new ReflectionClass($messageController);
$canMessageMethod = $reflection->getMethod('canMessage');
$canMessageMethod->setAccessible(true);

$canMessage = $canMessageMethod->invoke($messageController, $jobSeeker, $recruiter);
echo "✅ Job Seeker can message Recruiter: " . ($canMessage ? 'YES' : 'NO') . "\n";

$canMessage = $canMessageMethod->invoke($messageController, $recruiter, $jobSeeker);
echo "✅ Recruiter can message Job Seeker: " . ($canMessage ? 'YES' : 'NO') . "\n\n";

// Check existing messages
$messages = \App\Models\Message::count();
echo "📨 Total messages in database: {$messages}\n";

$conversations = \App\Models\Message::where('sender_id', $jobSeeker->id)
    ->orWhere('receiver_id', $jobSeeker->id)
    ->count();
echo "📨 Job Seeker conversations: {$conversations}\n";

$conversations = \App\Models\Message::where('sender_id', $recruiter->id)
    ->orWhere('receiver_id', $recruiter->id)
    ->count();
echo "📨 Recruiter conversations: {$conversations}\n\n";

// Test API endpoints
echo "🔗 API Endpoints to test:\n";
echo "   GET    http://127.0.0.1:8000/api/messages/conversations\n";
echo "   GET    http://127.0.0.1:8000/api/messages/conversation/{userId}\n";
echo "   POST   http://127.0.0.1:8000/api/messages/conversation/{userId}\n";
echo "   PUT    http://127.0.0.1:8000/api/messages/{messageId}/read\n";
echo "   DELETE http://127.0.0.1:8000/api/messages/conversation/{userId}\n";
echo "   GET    http://127.0.0.1:8000/api/messages/unread-count\n\n";

echo "🔑 Login credentials:\n";
echo "   Job Seeker: jobseeker@test.com / password123\n";
echo "   Recruiter: recruiter@test.com / password123\n";
echo "   HR: hr@avaa.com / hrpassword123\n\n";

echo "📱 Testing Steps:\n";
echo "1. Login as Job Seeker\n";
echo "2. Go to /user/messages\n";
echo "3. You should see conversations with recruiters\n";
echo "4. Click on a conversation to view messages\n";
echo "5. Send a test message\n";
echo "6. Login as Recruiter\n";
echo "7. Check if you received the message\n\n";

echo "✅ Messaging system is ready for testing!\n";
