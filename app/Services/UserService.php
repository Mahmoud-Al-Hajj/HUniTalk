<?php

namespace App\Services;
use App\Models\User;
use App\Models\PostComment;

class UserService{

    public static function GetUserProfile($user_id){
    return User::with(['posts','savedPosts'])->findOrFail($user_id);
    }

    public static function UpdateUserProfile($user_id, $request){
        $user = User::findOrFail($user_id);
        $user->name = $request->name ?? $user->name;
        $user->major = $request->major ?? $user->major;
        $user->save();
        return $user;
    }
public static function CalculateUserReputation($user_id){
    $user = User::findOrFail($user_id);
    $posts = $user->posts;
    $reputation = 0;

    foreach($posts as $post){
        //hol l votes tb3 l post table
        $reputation += ($post->upvotes - $post->downvotes);
        $comments = $post->comments;
        foreach($comments as $comment){
            $reputation += ($comment->upvotes - $comment->downvotes);
        }
    }
    $userComments = PostComment::where('user_id', $user_id)->get();
    //get user comments from other posts
    foreach($userComments as $comment){
        $isOwnPost = $comment->post->user_id == $user_id;
        if (!$isOwnPost) {
            $reputation += ($comment->upvotes - $comment->downvotes);
        }
    }

    $user->reputation = $reputation;
    $user->save();
    return $user;
}
}
