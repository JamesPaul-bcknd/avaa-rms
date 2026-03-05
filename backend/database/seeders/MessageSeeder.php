<?php

namespace Database\Seeders;

use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MessageSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get existing users
        $jobSeeker = User::where('role', 'user')->first();
        $recruiter = User::where('role', 'recruiter')->first();
        $hrUser = User::where('email', 'hr@avaa.com')->first();

        if (!$jobSeeker || !$recruiter) {
            $this->command->info('No users found for messaging test data. Please create users first.');
            return;
        }

        // Create test conversations
        $conversations = [
            [
                'sender_id' => $recruiter->id,
                'receiver_id' => $jobSeeker->id,
                'content' => 'Hi! Thanks for applying to our Senior Developer position. We\'d like to schedule an interview.',
                'type' => 'text',
                'created_at' => now()->subHours(2),
            ],
            [
                'sender_id' => $jobSeeker->id,
                'receiver_id' => $recruiter->id,
                'content' => 'Thank you for reaching out! I\'m very interested in this opportunity.',
                'type' => 'text',
                'created_at' => now()->subHours(1)->subMinutes(45),
            ],
            [
                'sender_id' => $recruiter->id,
                'receiver_id' => $jobSeeker->id,
                'content' => 'Great! Are you available tomorrow at 2 PM for a technical interview?',
                'type' => 'text',
                'created_at' => now()->subHours(1)->subMinutes(30),
            ],
            [
                'sender_id' => $jobSeeker->id,
                'receiver_id' => $recruiter->id,
                'content' => 'Yes, tomorrow at 2 PM works perfectly for me. Looking forward to it!',
                'type' => 'text',
                'created_at' => now()->subMinutes(30),
            ],
        ];

        // Add HR conversation if HR user exists
        if ($hrUser) {
            $conversations = array_merge($conversations, [
                [
                    'sender_id' => $hrUser->id,
                    'receiver_id' => $jobSeeker->id,
                    'content' => 'Welcome to our team! Your onboarding documents are ready for review.',
                    'type' => 'text',
                    'created_at' => now()->subHours(3),
                ],
                [
                    'sender_id' => $jobSeeker->id,
                    'receiver_id' => $hrUser->id,
                    'content' => 'Thank you! I\'ll review them right away.',
                    'type' => 'text',
                    'created_at' => now()->subHours(2)->subMinutes(15),
                ],
            ]);
        }

        // Insert messages
        foreach ($conversations as $message) {
            Message::create($message);
        }

        // Mark some messages as read
        Message::where('receiver_id', $recruiter->id)
            ->where('sender_id', $jobSeeker->id)
            ->update(['read_at' => now()->subMinutes(20)]);

        $this->command->info('Test messaging data created successfully!');
        $this->command->info('Users for testing:');
        $this->command->info('- Job Seeker: ' . $jobSeeker->email);
        $this->command->info('- Recruiter: ' . $recruiter->email);
        if ($hrUser) {
            $this->command->info('- HR: ' . $hrUser->email);
        }
    }
}
