<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class AiService
{
    /**
     * Ask the LLM a question.
     *
     * $request is the incoming Request instance (or any object with input())
     * $options: ['mode' => 'answer'|'summarize', 'context' => 'string']
     *
     * Returns an array: ['reply' => string, 'raw' => array]
     */
    public static function ask($request, array $options = []): array
    {
        $userInput = $request->input('message');
        $userId = Auth::id();

        if (empty($userInput)) {
            return ['error' => true, 'status' => 400, 'reply' => 'Invalid input.'];
        }
        if (! $userId) {
            return ['error' => true, 'status' => 401, 'reply' => 'User not authenticated.'];
        }

        $mode = $options['mode'] ?? $request->input('mode', 'answer'); // answer|summarize
        $context = $options['context'] ?? $request->input('context', null);

        // System instruction - keep short and strict
        $system = "
        You are the HUniTalk Academic Assistant.
Task: A student has asked a question. Your job:
Search your database of posts for the most relevant posts.
Use those posts as the only sources to craft a clear, concise answer.

Rules:
Use only the content from the context posts you retrieved.
If the context does not provide enough information to make a confident answer, say:
“I could not find a precise answer in the posts; here are helpful posts instead.”
Use a professional, academic tone appropriate for students.
Do not hallucinate or invent references. Facts must come from the source posts.
Limit your answer to about 300 words max (unless the question explicitly asks for more).
Provide at least 1 sources, at most 4 sources.

        ";

        if ($mode === 'summarize' && $context) {
            $userContent = "Summarize the thread below. Output: one-sentence takeaway, then 5 bullet points. Use neutral academic tone.\n\nThread:\n{$context}\n\nReturn the summary only.";
        } else {
            if ($context) {
                // instruct model to return JSON so parsing is easier
                $userContent = "Answer the question using ONLY the context below. If the context is insufficient, say 'I could not find a precise answer in the posts; here are helpful posts instead.'\n\nQuestion:\n{$userInput}\n\nContext:\n{$context}\n\nReturn JSON with keys: {\"answer\":\"...\",\"sources\":[{\"id\":<id>,\"title\":\"...\",\"reason\":\"why relevant\"}]}";
            } else {
                $userContent = "Answer the student's question concisely:\n\n{$userInput}\n\nIf you need more info, ask a clarifying question.";
            }
        }

        // Gemini endpoint shape (existing pattern you used)
        $link = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=' . env('GEMINI_API_KEY');

        $payload = [
            'systemInstruction' => [
                'parts' => [['text' => $system]],
            ],
            'contents' => [
                [
                    'role' => 'user',
                    'parts' => [['text' => $userContent]],
                ],
            ],
        ];

        $headers = [
            'x-goog-api-key' => env('GEMINI_API_KEY'),
        ];

        try {
            $response = Http::withOptions(['verify' => false])->withHeaders($headers)->post($link, $payload);
        } catch (\Exception $e) {
            return ['error' => true, 'status' => 502, 'reply' => 'Failed to reach AI service: ' . $e->getMessage()];
        }

        if ($response->failed()) {
            return ['error' => true, 'status' => 502, 'reply' => 'AI service returned an error.', 'detail' => $response->body()];
        }

        $responseJson = $response->json();
        $reply = null;

        if (isset($responseJson['candidates'][0]['content']['parts'])) {
            $parts = $responseJson['candidates'][0]['content']['parts'];
            $texts = array_map(fn($p) => $p['text'] ?? '', $parts);
            $reply = implode("", $texts);
        } else {
            $reply = $response->body();
        }

        return ['reply' => $reply, 'raw' => $responseJson];
    }
}
