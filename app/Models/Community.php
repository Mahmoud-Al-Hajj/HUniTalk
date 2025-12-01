<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Community extends Model
{

    public function posts()
    {
        return $this->hasMany(Post::class, 'communities_id');
    }

    public function followers()
    {
        return $this->belongsToMany(User::class, 'communities_follows', 'community_id', 'user_id');
    }
    public function studyRooms()
    {
        return $this->hasOne(StudyRoom::class, 'community_id');
    }



}
