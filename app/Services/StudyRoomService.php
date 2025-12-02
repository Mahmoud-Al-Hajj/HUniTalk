<?php

namespace App\Services;

use App\Models\StudyRoom;
use App\Models\StudyRoomMember;
use App\Models\StudyRoomMessage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class StudyRoomService{

   public static function getOrCreateRoom($communityId, $roomName, $description){
        return DB::transaction(function () use ($communityId, $roomName, $description) {
    $room = StudyRoom::where('community_id', $communityId)
        ->lockForUpdate()
        ->first();
        if (!$room) {
            $room = new StudyRoom();
            $room->name = $roomName;
            $room->community_id = $communityId;
            $room->description = $description ?? '';
            $room->notes = null;
            $room->save();
        }

        return $room;
});

    }
   public static function joinRoom($roomId){
        $userId = Auth::id();

        $member = StudyRoomMember::where('study_room_id', $roomId)
            ->where('user_id', $userId)
            ->first();

        if (!$member) {
            $member = new StudyRoomMember();
            $member->study_room_id = $roomId;
            $member->user_id = $userId;
        }

        $member->last_active_at = now();
        $member->save();

        return true;
    }

    public static function leaveRoom($roomId){
        StudyRoomMember::where('study_room_id', $roomId)
            ->where('user_id', Auth::id())
            ->delete();

        return true;
    }

    public static function sendMessage($roomId, $message){
        $userId = Auth::id();

        self::joinRoom($roomId);

        $msg = new StudyRoomMessage();
        $msg->study_room_id = $roomId;
        $msg->user_id = $userId;
        $msg->message = $message;
        $msg->save();

        Log::info('Broadcasting message', [
            'room_id' => $roomId,
            'message_id' => $msg->id,
            'user_id' => $userId
        ]);

        broadcast(new \App\Events\MessageSent($msg))->toOthers();
        return $msg->load('user');
    }
public static function getMessages($roomId){
    $messages = StudyRoomMessage::where('study_room_id', $roomId)
        ->with('user')
        ->orderBy('created_at', 'desc')
        ->limit(50)
        ->get();

    return $messages->reverse()->values();
}


    // get members list with online flag
    public static function getMembers($roomId){
        $activeLimit = now()->subMinutes(2);

        $members = StudyRoomMember::where('study_room_id', $roomId)
            ->with('user')
            ->get()
            ->map(function ($m) use ($activeLimit) {
            $lastActive = $m->last_active_at
                ? \Carbon\Carbon::parse($m->last_active_at)
                : null;

            return [
                'user_id' => $m->user->id,
                'name' => $m->user->name ?? 'Unknown User',
                'last_active_at' => $lastActive ? $lastActive->toDateTimeString() : null,
                'online' => $lastActive && $lastActive->gt($activeLimit),
            ];
            });

        return $members;
    }

 public static function updateActivity($roomId): void
    {
        StudyRoomMember::where('study_room_id', $roomId)
            ->where('user_id', Auth::id())
            ->update(['last_active_at' => now()]);
    }
    // get notes
    // public function getNotes(int $roomId): string{
    //     $room = StudyRoom::findOrFail($roomId);
    //     return $room->notes ?? '';
    // }

    // // update notes
    // public function updateNotes(int $roomId, string $notes): bool{
    //     $room = StudyRoom::findOrFail($roomId);
    //     $room->notes = $notes;
    //     $room->save();

    //     $this->joinRoom($roomId);

    //     return true;
    // }
}
