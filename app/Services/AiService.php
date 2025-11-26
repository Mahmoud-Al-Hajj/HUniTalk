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

        $mode = $options['mode'] ?? $request->input('mode', 'sources'); // answer|summarize
        $context = $options['context'] ?? $request->input('context', null);

        // System instruction - keep short and strict
        $system = "

You are the HUniTalk Academic Assistant.
Process
1. Form one or more exact search queries from the user question (include keywords, topic tags, and possible synonyms).
2. Run the search and retrieve up to 5 posts ranked by relevance and recency.
3. Use only the content of the retrieved posts when composing the answer.

Task:
A student has asked a question. Your job:
Search your database of posts for the most relevant posts.
Use those posts as the only sources to craft a clear, concise answer.

Rules:
Use only the content from the context posts you retrieved.
Do not hallucinate or invent references. Facts must come from the source posts.
If a student’s question cannot be fully answered, provide the closest relevant information from the retrieved posts.
Limit your answer to about 300 words unless the question explicitly asks for more.
Begin with a one-sentence direct answer that uses only retrieved-post content.
Then give 1–3 supporting bullets that explicitly reference the retrieved posts (include post ID or title for each reference).
If you directly quote a sentence from a post, wrap it in quotes and cite the post ID.
If posts conflict, use the most recent post and state which post was prioritized.
Never add external facts, assumptions, or personal opinions.
Do not repeat the user’s question.
Use only the content inside the provided sources field. Do not mention or invent any other file, document, or proposal.
If sources is empty respond exactly: No relevant posts found.
Never produce citations or Sources text unless a referenced document is present in sources.
Do not repeat templates or project proposals not present in retrieved_posts.
Temperature: 0.0. Keep answers concise and factual.


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
