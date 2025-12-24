<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Community;
use App\Services\CommunitiesService;
use Illuminate\Support\Facades\Auth;

class CommunitiesController extends Controller{

    function createCommunity(Request $request){
        $community = CommunitiesService::CreateCommunity($request);
        return response()->json($community, 200);
    }
    function getCommunities(){
        $user_id = Auth::id();
        $communities = CommunitiesService::GetCommunities($user_id);
        return response()->json($communities, 200);
    }
    function getCommunityById($id){
        $user_id = Auth::id();
        $community = CommunitiesService::GetCommunityById($id, $user_id);
        return response()->json($community, 200);
    }
    function followCommunity($community_id){
        $user_id = Auth::id();
        $message = CommunitiesService::FollowCommunity($user_id, $community_id);
        return response()->json(['message' => $message], 200);
    }
    function unfollowCommunity($community_id){
        $user_id = Auth::id();
        $message = CommunitiesService::UnfollowCommunity($user_id, $community_id);
        return response()->json(['message' => $message], 200);
    }
    function getCommunitiesByUserId(){
        $communities = CommunitiesService::getCommunityByUserId();
        return response()->json($communities, 200);
    }
}
