<?php

namespace App\Services;
use App\Models\Community;
use App\Models\CommunitiesFollow;
use Illuminate\Support\Facades\Auth;

class CommunitiesService{

    public static function CreateCommunity($request){
    $community = new Community();
    $community->name = $request->name;
    $community->description = $request->description;
    $community->followers_count = 0;
    $community->save();
    return $community;
    }
    public static function GetCommunities($user_id = null){
        $communities = Community::with(['posts', 'followers'])->get();

        if ($user_id) {
            $communities->each(function ($community) use ($user_id) {
                $community->is_following = CommunitiesFollow::where('user_id', $user_id)
                    ->where('community_id', $community->id)
                    ->exists();
            });
        }

        return $communities;
    }
    public static function GetCommunityById($id, $user_id = null){
        $community = Community::with(['posts', 'followers'])->findOrFail($id);

        if ($user_id) {
            $community->is_following = CommunitiesFollow::where('user_id', $user_id)
                ->where('community_id', $community->id)
                ->exists();
        }

        return $community;
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

    public static function getCommunityByUserId(){
        $user_id = Auth::id();
        $communities = Community::whereHas('followers', function ($query) use ($user_id) {
            $query->where('user_id', $user_id);
        })->with(['posts', 'followers'])->get();

        return $communities;
    }
}
