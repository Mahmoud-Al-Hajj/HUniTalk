<?php

use Illuminate\Container\Attributes\Auth;
use Illuminate\Support\Facades\Broadcast;
use App\Models\StudyRoomMember;

Broadcast::channel('study-room.{roomId}', function ($user, $roomId) {
     return StudyRoomMember::where('study_room_id', $roomId)
        ->where('user_id', $user->id)
        ->exists();
});
