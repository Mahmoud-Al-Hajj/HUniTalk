<?php

namespace App\Http\Controllers;

use App\Models\StudyRoom;
use App\Services\StudyRoomService;
use Illuminate\Http\Request;

class StudyRoomController extends Controller{
    public function getOrCreateRoom(Request $request){
        $communityId = $request->community_id;
        $room = StudyRoomService::getOrCreateRoom($communityId, $request->name, $request->description);
        return response()->json($room, 200);
    }
    public function joinRoom(Request $request){
        $roomId = $request->study_room_id;
        StudyRoomService::joinRoom($roomId);
        return response()->json(['message' => 'Joined room'], 200);
    }
    public function leaveRoom(Request $request){
        $roomId = $request->study_room_id;
        StudyRoomService::leaveRoom($roomId);
        return response()->json(['message' => 'Left room'], 200);
    }
    public function sendMessage(Request $request){
            $request->validate([
        'study_room_id' => 'required|exists:study_rooms,id',
        'message' => 'required|string|max:2000',
    ]);

        $roomId = $request-> study_room_id;
        $message = $request->message;
        $msg = StudyRoomService::sendMessage($roomId, $message);
        return response()->json($msg, 200);
    }
    public function getMessages(Request $request){
        $roomId = $request-> study_room_id;
        $messages = StudyRoomService::getMessages($roomId);
        return response()->json($messages, 200);
    }
    public function getMembers(Request $request){
        $roomId = $request-> study_room_id;
        $members = StudyRoomService::getMembers($roomId);
        return response()->json($members, 200);
    }
    public function heartbeat(Request $request)
    {
        $validated = $request->validate([
            'study_room_id' => 'required|exists:study_rooms,id',
        ]);

        StudyRoomService::updateActivity($validated['study_room_id']);

        return response()->json(['status' => 'active'], 200);
    }
}
