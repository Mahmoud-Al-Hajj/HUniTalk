<?php

namespace App\Events;

use App\Models\StudyRoomMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

  public $message;

    public function __construct(StudyRoomMessage $message)
    {
        $this->message = $message->load('user');
    }

    public function broadcastOn()
    {
        return new PrivateChannel('room.' . $this->message->room_id);
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->message->id,
            'study_room_id' => $this->message->study_room_id,
            'user' => [
                'id' => $this->message->user->id,
                'name' => $this->message->user->name,
            ],
            'message' => $this->message->message,
            'created_at' => $this->message->created_at->toDateTimeString(),
        ];
    }
}
