<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // $table->string('company_name')->nullable()->after('bio'); // Already exists, skip
            // $table->string('company_number')->nullable()->after('company_name'); // Already exists, skip
            // $table->string('company_location')->nullable()->after('company_number'); // Already exists, skip
            // $table->string('position')->nullable()->after('company_location'); // Already exists, skip
            // $table->string('role')->default('user')->after('email'); // Already exists, skip
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // $table->dropColumn(['company_name', 'company_number', 'company_location', 'position']); // Not added by this migration
            // $table->dropColumn('role'); // Do not drop 'role' as it was not added by this migration
        });
    }
};
