<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use \PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Illuminate\Auth\Events\Registered;


class AuthService{

    static public function login($request){

        $credentials = $request->only('email', 'password');
        $token = Auth::attempt($credentials);

        if (!$token) {return null;}

            $user = User::find(Auth::id());

        if (! $user->hasVerifiedEmail()) {
    return response()->json(['message' => 'Email not verified'], 403);
}

        $user = Auth::user();
        $token = JWTAuth::fromUser($user);
        $user->token = $token;
        return $user ;

    }

    static function register($request){
        $user = new User;
        $user->name = $request->name;
        $user->email = $request->email;
        $user->major = $request->major;
        $user->password = Hash::make($request->password);
        $user->save();
        event(new Registered($user));


        // Generate JWT token
        $token = JWTAuth::fromUser($user);
        $user->token = $token;
        $user->email_verified = $user->hasVerifiedEmail();
        return $user;
    }

    static function logout(){
        Auth::logout();
        return response()->json([
            'status' => 'success',
            'message' => 'Successfully logged out',
        ]);
    }

}
