<?php

namespace App\Services;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
class AiService{

public static function ask($request){
    $userInput = $request->input('message');
    $userId = Auth::id();
            if (empty($userInput)) {
            return response()->json(['reply' => 'Invalid input.'], 400);
        }
        if (!$userId) {
            return response()->json(['reply' => 'User not authenticated.'], 401);
        }
        $system = "You are an AI assistant for a university community app. Provide helpful and concise answers to user queries related to university life, courses, events, and campus resources. Maintain a friendly and professional tone.";
        $link = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . env('GEMINI_API_KEY');
        try {
            $response = Http::withOptions([
                'verify' => false,
            ])->post($link, [
            "system_instruction" => [
                "role" => "system",
                "parts" => [["text" => $system]]
            ],
            "contents" => $userInput
        ]);

        } catch (\Exception $e) {
            return response()->json(['reply' => 'Failed to reach AI service: ' . $e->getMessage()], 502);
        }
        if ($response->failed()) {
            return response()->json(['reply' => 'AI service returned an error.', 'detail' => $response->body()], 502);
        }

        return $response->json();
    }
}
