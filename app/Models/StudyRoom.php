<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Models\StudyRoomMember;
use App\Models\StudyRoomMessage;
use App\Models\Community;

class StudyRoom extends Model
{
public function members()
    {
        return $this->hasMany(StudyRoomMember::class, 'study_room_id');
    }

    public function messages()
    {
        return $this->hasMany(StudyRoomMessage::class, 'study_room_id');
    }
        public function community()
    {
        return $this->belongsTo(Community::class, 'community_id');
    }
}
