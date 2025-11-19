<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\AuthService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;


class AuthController extends Controller{

    public function login(Request $request){
        $user = AuthService::login($request);
        return response()->json($user, $user ? 200 : 401);
    }

public function register(Request $request){
        $response = AuthService::register($request);
        return response()->json($response, $response ? 201 : 400);
    }

    public function logout(){
        return AuthService::logout();
    }
}
