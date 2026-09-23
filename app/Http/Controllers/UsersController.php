<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;

class UsersController extends Controller
{
    public function index()
    {
        return Inertia::render('Users');
    }

    public function userRegister(Request $request)
    {
        // 1. Validate
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);



        // 2. Create user (NO bcrypt needed because of 'hashed' cast)
        User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'], // auto-hashed
            'role' => 'Staff', // default role, adjust as needed
        ]);
    }
}
