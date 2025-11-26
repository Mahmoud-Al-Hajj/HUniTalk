<?php

namespace App\Services;

use App\Models\Post;
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

        // If summarizing and no context was provided, fetch post + comments
        if (!$context && $mode === 'summarize' && $request->has('post_id')) {
            $postId = $request->input('post_id');
            $post = Post::with(['comments.user'])->find($postId);

            if ($post) {
                $commentsText = $post->comments
                    ->map(fn($c) => ($c->user->name ?? $c->user->username ?? 'Anonymous') . ": {$c->body}")
                    ->implode("\n");

                $context = "Post:\n{$post->body}\n\nComments:\n{$commentsText}";
            }
        }

        // If still no context for summarization
        if ($mode === 'summarize' && empty($context)) {
            return ['reply' => 'No relevant posts found.', 'raw' => null];
        }
        // System instruction - keep short and strict
        $system = "


You are the HUniTalk Academic Assistant.

Rules:
Use only the content from the context posts you retrieved.
Do not hallucinate or invent references. Facts must come from the source posts.
If a student’s question cannot be fully answered, provide the closest relevant information from the retrieved posts.
Tone: neutral academic; strictly concise; **no word count above ~50 words in total**. Temperature: 0.0.
Begin with a one-sentence direct answer that uses only source content.
Then give 1–3 supporting bullets that explicitly reference the retrieved posts (include post ID or title for each reference).
If you directly quote a sentence from a post, wrap it in quotes and cite the post ID.
If posts conflict, use the most recent post and state which post was prioritized.
Never add external facts, assumptions, or personal opinions.
Prefer concise paraphrase over long quotes; quotes ≤ 12 words with post ID immediately after.
Do not output long Sources paragraphs or full post content.
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
                $userContent = "Answer the question using ONLY the context below.

Question:
{$userInput}

Context:
{$context}

Return JSON with keys: {\"answer\":\"...\",\"sources\":[{\"id\":<id>,\"title\":\"...\",\"reason\":\"why relevant\"}]}";
            } else {
                // If no context provided, we do NOT call the LLM with the 'use only context' instruction.
                // Let the caller handle fallbacks. Return a specific signal.
                return ['reply' => 'NO_CONTEXT', 'raw' => null];
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
