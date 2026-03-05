<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateHrUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-hr-user';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create HR user account';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $user = User::create([
            'name' => 'HR Manager',
            'email' => 'hr@avaa.com',
            'password' => Hash::make('hrpassword123'),
            'role' => 'recruiter',
            'email_verified_at' => now(),
        ]);

        $this->info('HR user created successfully!');
        $this->info('Email: hr@avaa.com');
        $this->info('Password: hrpassword123');
        $this->info('Role: recruiter');
        
        return 0;
    }
}
