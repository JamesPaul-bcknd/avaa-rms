<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\JobApplication;

class UpdateApplicationStatusSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update some existing applications to 'accepted' status for testing
        JobApplication::whereNull('status')->limit(5)->update(['status' => 'accepted']);
        
        // Update some to 'rejected' status for testing
        JobApplication::whereNull('status')->limit(3)->update(['status' => 'rejected']);
        
        $this->command->info('Application statuses updated for testing!');
    }
}
