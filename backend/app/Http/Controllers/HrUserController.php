<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;

class HrUserController extends Controller
{
    // Fetch all HR users or search
    public function index(Request $request)
    {
        $search = $request->query('search');

        $query = User::query()
            ->where('role', '!=', 'admin'); // exclude admin

        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->get(['id', 'name', 'role']); // select only needed fields

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }
}