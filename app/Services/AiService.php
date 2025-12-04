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
$system = "You are HUniTalk Assistant, an AI helper for a university student community platform.

ROLE: Help students by answering questions based ONLY on the provided context from community posts and comments.

CORE RULES:
1. Use ONLY information from the provided context - never make up facts
2. If the context doesn't contain relevant information, say: I couldn't find relevant information in the community posts.
3. Be helpful, friendly, and concise
4. Reference specific posts when possible (mention post titles or IDs)
5. Keep responses under 150 words unless more detail is needed

RESPONSE STYLE:
- Start with a direct answer to the question
- Support with relevant details from the posts
- Use bullet points for multiple pieces of information
- Mention which post or comment the information comes from";

        if ($mode === 'summarize' && $context) {
            $userContent = "Please summarize this discussion thread from HUniTalk.

THREAD CONTENT:
{$context}

Provide:
1. A one-sentence main takeaway
2. 3-5 key points discussed
3. Any conclusions or consensus reached

Keep it concise and informative.";
        } else {
            if ($context) {
                $userContent = "A student is asking: \"{$userInput}\"

Here are relevant posts and comments from the HUniTalk community:

{$context}

Please answer the student's question based on this community content. If the posts contain helpful information, share it. If not, let them know you couldn't find relevant discussions.";
            } else {
                return ['reply' => 'NO_CONTEXT', 'raw' => null];
            }
        }

        // Gemini endpoint shape (existing pattern you used)
        $link = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' . env('GEMINI_API_KEY');

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
