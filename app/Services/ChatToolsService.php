<?php

namespace App\Services;
use Illuminate\Support\Str;
use App\Models\Post;

class ChatToolsService{
  public function searchPosts(string $query, int $limit = 6, ?string $course = null): array {
        $query = trim($query);
        if ($query === '') {
            return [];
        }
            $select = "id, title, SUBSTRING(body,1,400) as snippet,
                   MATCH(title, body) AGAINST (? IN NATURAL LANGUAGE MODE) as score";

        $rows = Post::selectRaw($select, [$query])
            ->whereRaw("MATCH(title, body) AGAINST (? IN NATURAL LANGUAGE MODE)", [$query])
            ->orderByDesc('score')
            ->limit($limit)
            ->get();

        return $rows->map(function ($r) {
            return [
                'id' => (int)$r->id,
                'title' => $r->title,
                'snippet' => strip_tags($r->snippet),
                'score' => isset($r->score) ? (float)$r->score : 0.0,
            ];
        })->toArray();
  }

  // Get post and top comments (sanitized + truncated)
  public function getPostThread(int $postId, int $limitComments = 20): ?array
  {
        $post = Post::with(['comments' => function ($q) use ($limitComments) {
            $q->orderByDesc('upvotes')->take($limitComments);
        }])->find($postId);

        if (! $post) {
            return null;
        }

        $comments = $post->comments->map(function ($c) {
            return mb_strimwidth(strip_tags($c->body), 0, 1000);
        })->toArray();

        return [
            'id' => $post->id,
            'title' => $post->title,
            'body' => mb_strimwidth(strip_tags($post->body), 0, 6000),
            'comments' => $comments,
            'upvotes' => $post->upvotes,
        ];
    }

    /**
     * Given an array of search matches (as returned by searchPosts),
     * load full post threads (post body + comments) for each match.
     *
     * Returns array of full threads (or empty array if none).
     */
    public function getFullPostsFromMatches(array $matches, int $limitComments = 20): array
    {
        $full = [];
        foreach ($matches as $m) {
            if (!isset($m['id'])) continue;
            $thread = $this->getPostThread((int)$m['id'], $limitComments);
            if ($thread) $full[] = $thread;
        }
        return $full;
    }

    /**
     * Build a plain-text context block suitable to send to the AI.
     * Each post contains Title, Body and Comments (bullet list).
     */
    public function buildAiContext(array $fullPosts): string
    {
        $context = "";

        foreach ($fullPosts as $p) {
            $context .= "Post ID: {$p['id']}\n";
            $context .= "Title: {$p['title']}\n";
            $context .= "Body:\n{$p['body']}\n";

            if (!empty($p['comments'])) {
                $context .= "Comments:\n";
                foreach ($p['comments'] as $c) {
                    // ensure single-line bullets
                    $line = preg_replace("/\s+/", " ", trim($c));
                    $context .= "- {$line}\n";
                }
            }

            $context .= "\n====================\n\n";
        }

        return trim($context);
    }

public function summarizeSpecificPost(int $postId, int $limitComments = 10): ?array{
    $thread = $this->getPostThread($postId, $limitComments);
        if (! $thread) return null;

        $context = "Title: {$thread['title']}\n\nBody:\n{$thread['body']}";

        if (!empty($thread['comments'])) {
            $context .= "\n\nComments:\n" . implode("\n---\n", $thread['comments']);
        }

        // Fake request wrapper for AiService
        $fakeRequest = new class($context) {
            protected $context;
            public function __construct($context) { $this->context = $context; }
            public function input($key, $default = null) {
                if ($key === 'message') return "summarize this post";
                if ($key === 'context') return $this->context;
                return $default;
            }
        };

        return \App\Services\AiService::ask($fakeRequest, [
            'mode' => 'summarize',
            'context' => $context
        ]);
}
public function getHighestRatedPosts(){
        return Post::orderByDesc('upvotes')
            ->take(5)
            ->get()
            ->map(fn($post) => [
                'id' => $post->id,
                'title' => $post->title,
                'snippet' => mb_strimwidth(strip_tags($post->body), 0, 200),
                'upvotes' => $post->upvotes,
            ])->toArray();
}

}
