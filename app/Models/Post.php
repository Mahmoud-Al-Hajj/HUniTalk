<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Post extends Model
{

    public function comments()
    {
        return $this->hasMany(PostComment::class);
    }
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function community()
    {
        return $this->belongsTo(Community::class, 'communities_id');
    }

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }

}
