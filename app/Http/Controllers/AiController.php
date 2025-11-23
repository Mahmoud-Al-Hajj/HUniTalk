<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use  App\Services\AiService;

class AiController extends Controller{
    public function ask(Request $request){
        $response = AiService::ask($request);
        return response()->json(['response' => $response], 200);
    }

}
