<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Display a listing of the resource.
     */public function index()
{
    $currentUserId = auth()->id(); // or Auth::id()
    $userList = User::where('status', 'Approved')
        ->where('id', '!=', $currentUserId)
        ->where('id','!=',9)
        ->get();

    return inertia('Admin', ['userList' => $userList]);
}

public function getUserList(){
     $currentUserId = auth()->id(); // or Auth::id()
    $userList = User::where('status', 'Approved')
        ->where('id', '!=', $currentUserId)
        ->where('id','!=',9)
        ->get();
        return response()->json(['userList' => $userList]);
}
    public function getRole()
    {

    $userId = auth()->id();
        $user = User::where('id', $userId)->firstOrFail();

    
        return response()->json(['role' => $user->role]);
    }



    public function setRole($userId, $role){
        $user = User::findOrFail($userId);
        $user->role = $role;
        $user->save();  

    }

    public function getRequets()
    {
        $requests = User::where('status','!=', 'Approved')
        
        ->where('id','>',27)
        ->get();
        return response()->json(['requests' => $requests]);
    }

public function setStatus($userId, $status)
{
    $user = User::findOrFail($userId);

    $status = strtolower($status);

    if ($status === "rejected") {
        DB::transaction(function () use ($user) {
            $user->email = 'deleted_' . time() . '_' . $user->email;
            $user->save();
            $user->delete();
        });

        return response()->json(['message' => 'User revoked and deleted successfully']);
    }

    $user->status = $status;
    $user->save();

    return response()->json(['message' => 'User status updated successfully']);
}



public function revokeAccess($userId)
{
    $user = User::findOrFail($userId);
    $user->status='Revoked';
    $user->role='Staff';
    $user->save();
     // uses soft delete if trait enabled
    return response()->json(['message' => 'User access revoked and deleted successfully']); 
}
}
