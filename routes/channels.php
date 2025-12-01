<?php

use Illuminate\Container\Attributes\Auth;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('room.{roomId}', function ($user, $roomId) {
    return (bool)$user;
});
