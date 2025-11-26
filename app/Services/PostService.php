<?php

namespace App\Services;
use App\Models\Post;
use App\Models\Vote;
use App\Models\SavedPost;
use App\Models\PostComment;
use Illuminate\Support\Facades\Auth;
use App\Services\Base64ConverterService;
use \App\Models\Attachment;


class PostService{

    public static function createPost($request){
        $post = new Post();

        $user_id = Auth::id();
        $post->user_id = $user_id;
        $post->communities_id = $request->communities_id;
        $post->title = $request->title;
        $post->upvotes = 0;
        $post->downvotes = 0;
        $post->body = $request->body;
        $post->save();

       if ($request->attachments && is_array($request->attachments)) {
  $urls = Base64ConverterService::convert($request->attachments);

        foreach ($urls as $url) {
            $attachment = new Attachment();
            $attachment->post_id = $post->id;
            $attachment->user_id = $user_id;
            $attachment->filename = $url;
            $attachment->save();
        }
    }

    return $post->load('attachments');
}


    public static function getAllPosts($user_id = null, $perPage = 10){
        $posts = Post::with(['user','community'])
        ->withCount('comments')
        ->orderBy('created_at','desc')
        ->paginate($perPage);

        $postIds = $posts->pluck('id');

        // Get all vote counts in bulk (from ALL users)
        $voteCounts = Vote::whereIn('post_id', $postIds)
            ->selectRaw('post_id,
                SUM(CASE WHEN type = "upvote" THEN 1 ELSE 0 END) as upvotes,
                SUM(CASE WHEN type = "downvote" THEN 1 ELSE 0 END) as downvotes')
            ->groupBy('post_id')
            ->get()
            ->keyBy('post_id');

        if ($user_id) {
            // Get current user's votes
            $userVotes = Vote::whereIn('post_id', $postIds)
                ->where('user_id', $user_id)
                ->get()
                ->keyBy('post_id');

            $savedPosts = SavedPost::whereIn('post_id', $postIds)
                ->where('user_id', $user_id)
                ->pluck('post_id')
                ->flip();

            $posts->getCollection()->each(function ($post) use ($userVotes, $voteCounts, $savedPosts) {
                // User's personal vote
                $userVote = $userVotes->get($post->id);
                $post->user_vote = $userVote ? ($userVote->type === 'upvote' ? 1 : -1) : null;

                // TOTAL votes from everyone
                $voteCount = $voteCounts->get($post->id);
                $post->votes = $voteCount ? ($voteCount->upvotes - $voteCount->downvotes) : 0;

                $post->is_saved = $savedPosts->has($post->id);
            });
        } else {
            $posts->getCollection()->each(function ($post) use ($voteCounts) {
                // TOTAL votes from everyone
                $voteCount = $voteCounts->get($post->id);
                $post->votes = $voteCount ? ($voteCount->upvotes - $voteCount->downvotes) : 0;
                $post->user_vote = null;
            });
        }

        return $posts;
    }

     public static function DeletePost($id){
        $post = Post::findOrFail($id);
        $post->delete();
        return "Deleted Successfully";
    }

    public static function GetPostById($id, $user_id = null){
        $post = Post::with(['user','community','votes'])
        ->withCount('comments')
        ->findOrFail($id);

        if ($user_id) {
            $post->is_upvoted = Vote::where('post_id', $post->id)
                ->where('user_id', $user_id)
                ->where('type', 'upvote')
                ->exists();
            $post->is_downvoted = Vote::where('post_id', $post->id)
                ->where('user_id', $user_id)
                ->where('type', 'downvote')
                ->exists();
            $post->is_saved = SavedPost::where('post_id', $post->id)
                ->where('user_id', $user_id)
                ->exists();
        }

    return $post->load('attachments');
    }

    public static function GetPostsByUserId($user_id){
        $posts = Post::with(['user','community','votes'])
        ->withCount('comments')
        ->where('user_id',$user_id)
        ->orderBy('created_at','desc')
        ->get();

        if ($user_id) {
            $posts->each(function ($post) use ($user_id) {
                $post->is_upvoted = Vote::where('post_id', $post->id)
                    ->where('user_id', $user_id)
                    ->where('type', 'upvote')
                    ->exists();
                $post->is_downvoted = Vote::where('post_id', $post->id)
                    ->where('user_id', $user_id)
                    ->where('type', 'downvote')
                    ->exists();
                $post->is_saved = SavedPost::where('post_id', $post->id)
                    ->where('user_id', $user_id)
                    ->exists();
            });
        }

        return $posts;
    }

    public static function GetPostsByCommunityId($community_id, $user_id = null){
        $posts = Post::with(['user','community','votes'])
        ->withCount('comments')
        ->where('communities_id',$community_id)
        ->orderBy('created_at','desc')
        ->get();

        if ($user_id) {
            $posts->each(function ($post) use ($user_id) {
                $post->is_upvoted = Vote::where('post_id', $post->id)
                    ->where('user_id', $user_id)
                    ->where('type', 'upvote')
                    ->exists();
                $post->is_downvoted = Vote::where('post_id', $post->id)
                    ->where('user_id', $user_id)
                    ->where('type', 'downvote')
                    ->exists();
                $post->is_saved = SavedPost::where('post_id', $post->id)
                    ->where('user_id', $user_id)
                    ->exists();
            });
        }

        return $posts->load('attachments');
    }

    public static function UpVotePost($post_id, $user_id){
        $post = Post::findOrFail($post_id);

        $existingVote = Vote::where('post_id', $post->id)->where('user_id', $user_id)->first();

        if ($existingVote) {
            if ($existingVote->type === 'upvote') {
                // Remove upvote
                $existingVote->delete();
                $post->decrement('upvotes');
            } else {
                // Change downvote to upvote
                $existingVote->type = 'upvote';
                $existingVote->save();
                $post->increment('upvotes');
                $post->decrement('downvotes');
            }
        } else {
            // Add upvote
            $vote = new Vote();
            $vote->post_id = $post->id;
            $vote->user_id = $user_id;
            $vote->type = 'upvote';
            $vote->save();
            $post->increment('upvotes');
        }

        $post->save();

        // Determine current user_vote
        $currentVote = Vote::where('post_id', $post->id)->where('user_id', $user_id)->first();
        $post->user_vote = $currentVote ? ($currentVote->type === 'upvote' ? 1 : -1) : null;

        return $post;
    }

    public static function DownVotePost($post_id, $user_id){
        $post = Post::findOrFail($post_id);

        $existingVote = Vote::where('post_id', $post->id)->where('user_id', $user_id)->first();

        if ($existingVote) {
            if ($existingVote->type === 'downvote') {

                $existingVote->delete();
                $post->decrement('downvotes');
            } else {

                $existingVote->type = 'downvote';
                $existingVote->save();
                $post->decrement('upvotes');
                $post->increment('downvotes');
            }
        } else {

            $vote = new Vote();
            $vote->post_id = $post->id;
            $vote->user_id = $user_id;
            $vote->type = 'downvote';
            $vote->save();
            $post->increment('downvotes');
        }

        $post->save();

        // Determine current user_vote
        $currentVote = Vote::where('post_id', $post->id)->where('user_id', $user_id)->first();
        $post->user_vote = $currentVote ? ($currentVote->type === 'upvote' ? 1 : -1) : null;

        return $post;
    }
    public static function SavePost($post_id, $user_id){
        $savedPost = SavedPost::where('post_id',$post_id)->where('user_id',$user_id)->first();
        if($savedPost){
            return "Post already saved.";
        }
        $savedPost = new SavedPost();
        $savedPost->post_id = $post_id;
        $savedPost->user_id = $user_id;
        $savedPost->save();
        return "Post saved: $savedPost";
    }
    public static function UnsavePost($post_id, $user_id){
        $savedPost = SavedPost::where('post_id',$post_id)->where('user_id',$user_id)->first();
        if(!$savedPost){
            return "Post not found in saved posts.";
        }
        $savedPost->delete();
        return "Post unsaved.";
    }
    public static function AddComment($post_id, $body){
        $userid = Auth::id();
        $comment = new PostComment();
        $comment->post_id = $post_id;
        $comment->user_id = $userid;
        $comment->body = $body;
        $comment->upvotes=0;
        $comment->downvotes=0;
        $comment->save();
        return $comment;
    }
    public static function GetCommentsByPostId($post_id){
        return PostComment::with('user','votes')
        ->where('post_id',$post_id)
        ->orderBy('upvotes','desc')
        ->get();
    }
    public static function UpVoteComment($comment_id, $user_id){
        $comment = PostComment::findOrFail($comment_id);

        $existingVote = Vote::where('comment_id', $comment->id)->where('user_id', $user_id)->first();

        if ($existingVote) {
            if ($existingVote->type === 'upvote') {
                // Remove upvote
                $existingVote->delete();
                $comment->decrement('upvotes');
            } else {
                // Change downvote to upvote
                $existingVote->type = 'upvote';
                $existingVote->save();
                $comment->increment('upvotes');
                $comment->decrement('downvotes');
            }
        } else {
            // Add upvote
            $vote = new Vote();
            $vote->comment_id = $comment->id;
            $vote->user_id = $user_id;
            $vote->type = 'upvote';
            $vote->save();
            $comment->increment('upvotes');
        }

        $comment->save();

        // Load votes and determine user_vote
        $comment->load('votes');
        $currentVote = Vote::where('comment_id', $comment->id)->where('user_id', $user_id)->first();
        $comment->user_vote = $currentVote ? ($currentVote->type === 'upvote' ? 1 : -1) : null;

        return $comment;
    }
    public static function DownVoteComment($comment_id, $user_id){
        $comment = PostComment::findOrFail($comment_id);

        $existingVote = Vote::where('comment_id', $comment->id)->where('user_id', $user_id)->first();

        if ($existingVote) {
            if ($existingVote->type === 'downvote') {
                // Remove downvote
                $existingVote->delete();
                $comment->decrement('downvotes');
            } else {
                // Change upvote to downvote
                $existingVote->type = 'downvote';
                $existingVote->save();
                $comment->decrement('upvotes');
                $comment->increment('downvotes');
            }
        } else {
            // Add downvote
            $vote = new Vote();
            $vote->comment_id = $comment->id;
            $vote->user_id = $user_id;
            $vote->type = 'downvote';
            $vote->save();
            $comment->increment('downvotes');
        }

        $comment->save();

        // Load votes and determine user_vote
        $comment->load('votes');
        $currentVote = Vote::where('comment_id', $comment->id)->where('user_id', $user_id)->first();
        $comment->user_vote = $currentVote ? ($currentVote->type === 'upvote' ? 1 : -1) : null;

        return $comment;
    }
        public static function DeleteComment($comment_id){
        $comment = PostComment::findOrFail($comment_id);
        $comment->delete();
        return "Comment Deleted Successfully";
    }
}
