<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\AiService;
use App\Services\ChatToolsService;

class AiController extends Controller
{
    protected $tools;

    public function __construct(ChatToolsService $tools)
    {
        $this->tools = $tools;
    }

    /**
     * Main endpoint: /api/agent/message
     *
     * Request body:
     * - message: string
     * - mode: optional (search|answer|summarize)
     * - post_id: optional (for summarize)
     */
    public function message(Request $req)
    {
        $req->validate(['message' => 'required|string|max:3000', 'mode' => 'nullable|string']);

        $userInput = $req->input('message');
        $mode = $req->input('mode', null);

        // Auto-detect mode if not specified
        if (!$mode) {
            $lower = strtolower($userInput);
            if (str_contains($lower, 'summarize') || str_contains($lower, 'summary')) $mode = 'summarize';
            elseif (str_contains($lower, 'find') || str_contains($lower, 'search') || str_contains($lower, 'show posts')) $mode = 'search';
            else $mode = 'answer';
        }

        // SEARCH MODE
        if ($mode === 'search') {
            $results = $this->tools->searchPosts($userInput, 6);
            return response()->json(['type' => 'search', 'results' => $results]);
        }

        // SUMMARIZE MODE
        if ($mode === 'summarize') {
            $postId = $req->input('post_id') ?? $this->tools->searchPosts($userInput, 1)[0]['id'] ?? null;

            if (! $postId) {
                return response()->json([
                    'error' => true,
                    'message' => 'Please specify a post id to summarize. Example: "summarize post 123" or pass post_id in payload.'
                ], 400);
            }

            $thread = $this->tools->getPostThread((int)$postId, 50);
            if (! $thread) return response()->json(['error' => true, 'message' => 'Post not found.'], 404);

            $context = "Title: {$thread['title']}\n\nBody:\n{$thread['body']}\n\nComments:\n" . implode("\n---\n", $thread['comments']);

            $aiRes = AiService::ask($req, ['mode' => 'summarize', 'context' => $context]);

            return response()->json([
                'type' => 'summary',
                'post_id' => $postId,
                'ai' => $aiRes
            ]);
        }

        $matches = $this->tools->searchPosts($userInput, 4);

        // Build context from matches (title + snippet)
        $contextParts = [];
        foreach ($matches as $m) {
            $contextParts[] = "Post ID: {$m['id']}\nTitle: {$m['title']}\nSnippet: {$m['snippet']}";
        }

        // Optionally include the uploaded proposal doc as extra source
        $proposalPath = '/mnt/data/HUniTalk Project Proposal.docx';
        $contextParts[] = "Source: HUniTalk Project Proposal (file)\nURL: {$proposalPath}\nNote: include proposal content if converted to text";

        $context = implode("\n---\n", $contextParts);

        // Ask AI
        $aiRes = AiService::ask($req, ['mode' => 'answer', 'context' => $context]);

        $replyText = $aiRes['reply'] ?? '';
        $parsed = null;

        if (preg_match('/\{.*\}/s', $replyText, $m)) {
            $json = json_decode($m[0], true);
            if (json_last_error() === JSON_ERROR_NONE) $parsed = $json;
        }

        if ($parsed) {
            return response()->json(['type' => 'answer', 'result' => $parsed, 'matches' => $matches]);
        }

        // Fallback: plain text + matches
        return response()->json(['type' => 'answer', 'result' => ['answer' => $replyText], 'matches' => $matches]);
    }

    // Extract post ID from text like "post 123"
    protected function extractPostId(string $text): ?int
    {
        if (preg_match('/post\s*(\d+)/i', $text, $m)) return (int)$m[1];
        return null;
    }
}
