<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\PostService;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;

class CommentsController extends Controller{

    function createComment(Request $request){
        $request->validate([
            'post_id' => 'required|integer|exists:posts,id',
            'body' => 'required|string',
        ]);
        $user_id = Auth::id();
        $post_id = $request->post_id;
        $body = $request->body;
        $comment = PostService::AddComment($user_id, $post_id, $body);
        return response()->json($comment, 200);
    }
    function getCommentsByPostId($post_id){
        $comments = PostService::GetCommentsByPostId($post_id);
        return response()->json($comments, 200);
    }
    function deleteComment($id){
        $message = PostService::DeleteComment($id);
        return response()->json(['message' => $message], 200);
    }
    function upVoteComment($comment_id){
        $user_id = Auth::id();
        $message = PostService::UpVoteComment($comment_id, $user_id);
        return response()->json(['message' => $message], 200);
    }
    function downVoteComment($comment_id){
        $user_id = Auth::id();
        $message = PostService::DownVoteComment($comment_id, $user_id);
        return response()->json(['message' => $message], 200);
    }
}
