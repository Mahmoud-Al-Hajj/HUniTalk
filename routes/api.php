<?php

use App\Http\Controllers\AiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostsController;
use App\Http\Controllers\CommunitiesController;
use App\Http\Controllers\CommentsController;
use App\Services\UserService;



Route::group(["middleware" => "auth:api"], function () {

    //posts
    Route::post('/posts', [PostsController::class, 'createPost']);
    Route::get('/posts', [PostsController::class, 'getAllPosts']);
    Route::get('/posts/{id}', [PostsController::class, 'getPostById']);
    Route::get('/posts/user/{user_id}', [PostsController::class, 'getPostsByUserId']);
    Route::get('/posts/community/{community_id}', [PostsController::class, 'getPostsByCommunityId']);
    Route::delete('/posts/{id}', [PostsController::class, 'deletePost']);
    Route::post('/posts/{post_id}/upvote', [PostsController::class, 'upVotePost']);
    Route::post('/posts/{post_id}/downvote', [PostsController::class, 'downVotePost']);
    Route::post('/posts/{post_id}/save', [PostsController::class, 'savePost']);
    Route::post('/posts/{post_id}/unsave', [PostsController::class, 'unsavePost']);

    //comments
    Route::post('/posts/{post_id}/comments', [CommentsController::class, 'createComment']);
    Route::get('/posts/{post_id}/comments', [CommentsController::class, 'getCommentsByPostId']);
    Route::delete('/comments/{id}', [CommentsController::class, 'deleteComment']);
    Route::post('/comments/{comment_id}/upvote', [CommentsController::class, 'upVoteComment']);
    Route::post('/comments/{comment_id}/downvote', [CommentsController::class, 'downVoteComment']);

    //communities
    Route::get('/communities', [CommunitiesController::class, 'getCommunities']);
    Route::get('/communities/user', [CommunitiesController::class, 'getCommunitiesByUserId']);
    Route::get('/communities/{id}', [CommunitiesController::class, 'getCommunityById']);
    Route::post('/communities/{community_id}/follow', [CommunitiesController::class, 'followCommunity']);
    Route::post('/communities/{community_id}/unfollow', [CommunitiesController::class, 'unfollowCommunity']);

    //user
    Route::get('/user/profile', [UserService::class, 'GetUserProfile']);
    Route::put('/user/profile', [UserService::class, 'UpdateUserProfile']);
    Route::put('/user/reputation', [UserService::class, 'calculateUserReputation']);


    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/ai/ask', [AiController::class, 'message']);

});


Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);


//only us devs
Route::post('/communities', [CommunitiesController::class, 'createCommunity']);
