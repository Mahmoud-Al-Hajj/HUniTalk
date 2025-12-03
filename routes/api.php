<?php

use App\Http\Controllers\AiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Broadcast;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostsController;
use App\Http\Controllers\CommunitiesController;
use App\Http\Controllers\CommentsController;
use App\Http\Controllers\StudyRoomController;
use App\Services\UserService;
use \App\Models\User;

// Broadcasting authentication
Broadcast::routes(['middleware' => ['auth:api']]);

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

//Study Rooms
Route::post('/study-rooms/join', [StudyRoomController::class, 'joinRoom']);
Route::post('/study-rooms/leave', [StudyRoomController::class, 'leaveRoom']);
Route::post('/study-rooms/message', [StudyRoomController::class, 'sendMessage']);
Route::get('/study-rooms/messages', [StudyRoomController::class, 'getMessages']);
Route::get('/study-rooms/members', [StudyRoomController::class, 'getMembers']);
Route::post('/study-rooms/heartbeat', [StudyRoomController::class, 'heartbeat']);


Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/ai/ask', [AiController::class, 'message']);

});

Route::post('/study-rooms', [StudyRoomController::class, 'getOrCreateRoom']);

Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::get('/verify-email/{id}/{hash}', function (Request $request, $id, $hash) {
    $user = User::findOrFail($id);
    // Check hash validity
    if (! hash_equals(sha1($user->email), $hash)) {
        return response()->json(['message' => 'Invalid verification link'], 400);
    }
    // Already verified?
    if ($user->hasVerifiedEmail()) {
        return response()->json(['message' => 'Email already verified'], 200);
    }
    // Mark verified
    $user->email_verified_at = now();
    $user->save();

    return redirect('http://localhost:3000/home?verified=1');
})->name('verification.verify');

Route::post('/resend-verification', function (Request $request) {
    $request->user()->sendEmailVerificationNotification();

    return response()->json(['message' => 'Verification link sent']);
})->middleware('auth:api');

Route::get('/test', function() {
    return response()->json(['status' => 'ok']);
});

// Health check endpoint for Railway
Route::get('/health', function() {
    return response()->json(['status' => 'healthy', 'timestamp' => now()]);
});

//only us devs
Route::post('/communities', [CommunitiesController::class, 'createCommunity']);
