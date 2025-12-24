<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\PostService;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;

class PostsController extends Controller{

    function createPost(Request $request){
        $request->validate([
            'communities_id' => 'required|integer|exists:communities,id',
            'title' => 'required|string|max:255',
            'body' => 'nullable|string',
            'attachments' => 'array|max:10', // max of 10 attachments by policy
    ]);
        $request->merge(['user_id' => Auth::id()]);
        $post = PostService::createPost($request);
        return response()->json($post, 200);
    }

    function getAllPosts(Request $request){
        $user_id = Auth::id();
        $perPage = $request->query('per_page', 10);
        $posts = PostService::getAllPosts($user_id, $perPage);
        return response()->json($posts, 200);
    }
    function deletePost($id){
        $message = PostService::DeletePost($id);
        return response()->json(['message' => $message], 200);
    }
    function getPostById($id){
        $user_id = Auth::id();
        $post = PostService::GetPostById($id, $user_id);
        return response()->json($post, 200);
    }
    function getPostsByUserId(){
        $user_id = Auth::id();
        $posts = PostService::GetPostsByUserId($user_id);
        return response()->json($posts, 200);
    }
    function getPostsByCommunityId($community_id){
        $user_id = Auth::id();
        $posts = PostService::GetPostsByCommunityId($community_id, $user_id);
        return response()->json($posts, 200);
    }
    function upVotePost($post_id){
        $user_id = Auth::id();
        $result = PostService::UpVotePost($post_id, $user_id);
        return response()->json($result, 200);
    }
    function downVotePost($post_id){
        $user_id = Auth::id();
        $result = PostService::DownVotePost($post_id, $user_id);
        return response()->json($result, 200);
    }
    function savePost($post_id){
        $user_id = Auth::id();
        $message = PostService::SavePost($post_id, $user_id);
        return response()->json(['message' => $message], 200);
    }
    function unsavePost($post_id){
        $user_id = Auth::id();
        $message = PostService::UnsavePost($post_id, $user_id);
        return response()->json(['message' => $message], 200);
    }

}
