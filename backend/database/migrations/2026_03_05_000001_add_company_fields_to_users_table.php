<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('company_name')->nullable()->after('website');
            $table->string('company_number')->nullable()->after('company_name');
            $table->string('company_location')->nullable()->after('company_number');
            $table->string('position')->nullable()->after('company_location');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['company_name', 'company_number', 'company_location', 'position']);
        });
    }
};
