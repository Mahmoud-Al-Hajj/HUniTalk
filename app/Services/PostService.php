<?php

namespace App\Services;
use App\Models\Post;
use App\Models\Vote;
use App\Models\SavedPost;
use App\Models\PostComment;


class PostService{

    public static function createPost($request){
        $post = new Post();
        $post->user_id = $request->user_id;
        $post->community_id = $request->community_id;
        $post->title = $request->title;
        $post->body = $request->body;
        $post->save();
        return $post;
    }

    public static function getAllPosts(){
        return Post::with(['user','community'])
        ->orderBy('created_at','desc')
        ->get();
    }

    public static function DeletePost($id){
        $post = Post::findOrFail($id);
        $post->delete();
        return "Deleted Successfully";
    }

    public static function GetPostById($id){
        return Post::with(['user','community'])->findOrFail($id);
    }

    public static function GetPostsByUserId($user_id){
        return Post::with(['user','community'])
        ->where('user_id',$user_id)
        ->get();
    }

    public static function GetPostsByCommunityId($community_id){
        return Post::with(['user','community'])
        ->where('community_id',$community_id)
        ->get();
    }

    public static function UpVotePost($post_id, $user_id){
        $post = Post::findOrFail($post_id);

        $existingVote = Vote::where('post_id', $post->id)->where('user_id', $user_id)->where('type', 'upvote')->first();
        if ($existingVote) {
            return "User has already upvoted this post.";
        }
            $vote = new Vote();
            $vote->post_id = $post->id;
            $vote->user_id = $user_id;
            $vote->type = 'upvote';
            $vote->save();

        $post->increment('upvotes');
        $post->save();
        return $post;
    }

    public static function DownVotePost($post_id, $user_id){
        $post = Post::findOrFail($post_id);

        $existingVote = Vote::where('post_id', $post->id)->where('user_id', $user_id)->where('type', 'downvote')->first();
        if ($existingVote) {
            return "User has already downvoted this post.";
        }
            $vote = new Vote();
            $vote->post_id = $post->id;
            $vote->user_id = $user_id;
            $vote->type = 'downvote';
            $vote->save();

        $post->decrement('downvotes');
        $post->save();
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
    public static function AddComment($post_id, $user_id, $body){
        $comment = new PostComment();
        $comment->post_id = $post_id;
        $comment->user_id = $user_id;
        $comment->body = $body;
        $comment->upvotes=0;
        $comment->downvotes=0;
        $comment->save();
        return $comment;
    }
    public static function GetCommentsByPostId($post_id){
        return PostComment::with('user')
        ->where('post_id',$post_id)
        ->orderBy('upvotes','desc')
        ->get();
    }
    public static function UpVoteComment($comment_id, $user_id){
        $comment = PostComment::findOrFail($comment_id);

        $existingVote = Vote::where('comment_id', $comment->id)->where('user_id', $user_id)->where('type', 'upvote')->first();
        if ($existingVote) {
            return "User has already upvoted this comment.";
        }
            $vote = new Vote();
            $vote->comment_id = $comment->id;
            $vote->user_id = $user_id;
            $vote->type = 'upvote';
            $vote->save();

        $comment->increment('upvotes');
        $comment->save();
        return $comment;
    }
    public static function DownVoteComment($comment_id, $user_id){
        $comment = PostComment::findOrFail($comment_id);

        $existingVote = Vote::where('comment_id', $comment->id)->where('user_id', $user_id)->where('type', 'downvote')->first();
        if ($existingVote) {
            return "User has already downvoted this comment.";
        }
            $vote = new Vote();
            $vote->comment_id = $comment->id;
            $vote->user_id = $user_id;
            $vote->type = 'downvote';
            $vote->save();

        $comment->decrement('downvotes');
        $comment->save();
        return $comment;
    }
        public static function DeleteComment($comment_id){
        $comment = PostComment::findOrFail($comment_id);
        $comment->delete();
        return "Comment Deleted Successfully";
    }
}
