<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ChatMessage;
use App\Events\MessageSentEvent;
use App\Models\User;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $users = User::where('id', '!=', auth()->id())->get();
        return Inertia::render('Dashboard', ['users' => $users]);   
    }

    public function chat($id)
    {
        $user= User::find($id);  
        $sender_id = auth()->id();
        $receiver_id = $id;  
        $message = ChatMessage::where(function ($query) use ($sender_id, $receiver_id) {
            $query->where('sender_id', $sender_id)
                  ->where('receiver_id', $receiver_id); 
            
        })->orWhere(function ($query) use ($sender_id, $receiver_id) {
            $query->where('sender_id', $receiver_id)
                  ->where('receiver_id', $sender_id);
        })
        ->with('sender:id,name', 'receiver:id,name')
        ->get();
         
       
       
        return Inertia::render('Chat' , [
            'user' => $user,
            'msg' => $message, 
        ]);   
    }   
    public function store(Request $request)
    {
        // Validate the incoming request data
        $validatedData = $request->validate([
            'message' => 'required|string',
            'sender_id' => 'required|integer',
            'receiver_id' => 'required|integer',
        ]);
    
        // Save the message to the database and store it in a variable
        $message = ChatMessage::create($validatedData);
    
        // Broadcast the message
        broadcast(new MessageSentEvent($message))->toOthers();
    
        return back()->with('success', 'Message sent!');
    }
    
}
