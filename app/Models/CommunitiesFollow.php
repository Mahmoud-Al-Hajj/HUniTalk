<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommunitiesFollow extends Model
{
    protected $table = 'communities_follows';

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function community()
    {
        return $this->belongsTo(Community::class);
    }
}
