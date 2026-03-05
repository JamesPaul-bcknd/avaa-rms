<?php

namespace Database\Seeders;

use App\Models\Message;
use App\Models\User;
use Illuminate\Database\Seeder;

class TestMessageSeeder extends Seeder
{
    public function run(): void
    {
        $jobSeeker = User::where('email', 'jobseeker@test.com')->first();
        $recruiter = User::where('email', 'recruiter@test.com')->first();

        if (!$jobSeeker || !$recruiter) {
            $this->command->error('Test users not found!');
            return;
        }

        // Create test conversation
        Message::create([
            'sender_id' => $recruiter->id,
            'receiver_id' => $jobSeeker->id,
            'content' => 'Hello! I saw your application and would like to discuss the position.',
            'type' => 'text',
            'created_at' => now()->subMinutes(30),
        ]);

        Message::create([
            'sender_id' => $jobSeeker->id,
            'receiver_id' => $recruiter->id,
            'content' => 'Thank you for reaching out! I am very interested in this opportunity.',
            'type' => 'text',
            'created_at' => now()->subMinutes(25),
        ]);

        Message::create([
            'sender_id' => $recruiter->id,
            'receiver_id' => $jobSeeker->id,
            'content' => 'Great! Are you available for a quick call this week?',
            'type' => 'text',
            'created_at' => now()->subMinutes(20),
        ]);

        // Mark recruiter's messages as read
        Message::where('receiver_id', $recruiter->id)->update(['read_at' => now()]);

        $this->command->info('Test messages created successfully!');
        $this->command->info('Job Seeker has ' . Message::where('receiver_id', $jobSeeker->id)->whereNull('read_at')->count() . ' unread messages');
    }
}
