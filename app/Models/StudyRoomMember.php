<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\User;;
use App\Models\StudyRoom;

class StudyRoomMember extends Model
{
public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function room()
    {
        return $this->belongsTo(StudyRoom::class, 'study_room_id');
    }
}
