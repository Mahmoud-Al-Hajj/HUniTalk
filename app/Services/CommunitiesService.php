<?php

namespace App\Services;
use App\Models\Community;
use App\Models\CommunitiesFollow;

class CommunitiesService{

    public static function CreateCommunity($request){
    $community = new Community();
    $community->name = $request->name;
    $community->description = $request->description;
    $community->followers_count = 0;
    $community->save();
    return $community;
    }
    public static function GetCommunities(){
        return Community::with(['posts', 'followers'])->get();
    }
    public static function GetCommunityById($id){
        return Community::findOrFail($id);
    }
    public static function UpdateCommunity($id, $request){
        $community = Community::findOrFail($id);
        $community->name = $request->name ?? $community->name;
        $community->description = $request->description ?? $community->description;
        $community->save();
        return $community;
    }
    public static function FollowCommunity($user_id, $community_id){

        $FollowedCommunity = CommunitiesFollow::where('user_id', $user_id)->where('community_id', $community_id)->first();
        if ($FollowedCommunity) {
            return "User is already following this community.";
        }
        $communityFollow = new CommunitiesFollow();
        $communityFollow->user_id = $user_id;
        $communityFollow->community_id = $community_id;
        $communityFollow->save();

        $community = Community::findOrFail($community_id);
        $community->increment('followers_count');

        return "Followed Successfully";
    }
        public static function UnfollowCommunity($user_id, $community_id){

        $FollowedCommunity = CommunitiesFollow::where('user_id', $user_id)->where('community_id', $community_id)->first();
        if (!$FollowedCommunity) {
            return "User is not following this community.";
        }
        $FollowedCommunity->delete();
        $community = Community::findOrFail($community_id);
        $community->decrement('followers_count');
        return "Unfollowed Successfully";
    }
}
