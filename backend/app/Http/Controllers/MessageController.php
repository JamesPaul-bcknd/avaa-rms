<?php

namespace App\Http\Controllers;

use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    public function conversations(): JsonResponse
    {
        $user = Auth::guard('api')->user();
        
        // Get unique conversation partners
        $conversations = Message::where('sender_id', $user->id)
            ->orWhere('receiver_id', $user->id)
            ->with(['sender:id,name,profile_image', 'receiver:id,name,profile_image'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->groupBy(function ($message) use ($user) {
                return $message->sender_id === $user->id 
                    ? 'user_' . $message->receiver_id 
                    : 'user_' . $message->sender_id;
            })
            ->map(function ($messages) use ($user) {
                $latestMessage = $messages->first();
                $otherUser = $latestMessage->sender_id === $user->id 
                    ? $latestMessage->receiver 
                    : $latestMessage->sender;
                
                $unreadCount = Message::where('sender_id', $otherUser->id)
                    ->where('receiver_id', $user->id)
                    ->whereNull('read_at')
                    ->count();

                return [
                    'user' => $otherUser,
                    'latest_message' => $latestMessage,
                    'unread_count' => $unreadCount,
                    'updated_at' => $latestMessage->created_at,
                ];
            })
            ->sortByDesc('updated_at')
            ->values();

        return response()->json([
            'success' => true,
            'data' => $conversations,
        ]);
    }

    public function conversation(Request $request, $userId): JsonResponse
    {
        $currentUser = Auth::guard('api')->user();
        $otherUser = User::findOrFail($userId);

        // Check if users can message each other (recruiter-applicant relationship)
        if (!$this->canMessage($currentUser, $otherUser)) {
            return response()->json([
                'success' => false,
                'error' => 'You cannot message this user',
            ], 403);
        }

        $messages = Message::between($currentUser->id, $otherUser->id)
            ->with(['sender:id,name,profile_image', 'receiver:id,name,profile_image'])
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark received messages as read
        Message::where('sender_id', $otherUser->id)
            ->where('receiver_id', $currentUser->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'data' => $messages,
        ]);
    }

    public function send(Request $request, $userId): JsonResponse
    {
        $currentUser = Auth::guard('api')->user();
        $receiver = User::findOrFail($userId);

        if (!$this->canMessage($currentUser, $receiver)) {
            return response()->json([
                'success' => false,
                'error' => 'You cannot message this user',
            ], 403);
        }

        $request->validate([
            'content' => 'required_without:file|string|max:1000',
            'file' => 'nullable|file|max:10240', // 10MB max
        ]);

        $messageData = [
            'sender_id' => $currentUser->id,
            'receiver_id' => $receiver->id,
            'content' => $request->content,
            'type' => 'text',
        ];

        // Handle file upload
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $isImage = str_starts_with($file->getMimeType(), 'image/');
            
            $path = $file->store('messages', 'public');
            
            $messageData['type'] = $isImage ? 'image' : 'file';
            $messageData['file_path'] = $path;
            $messageData['content'] = $file->getClientOriginalName();
        }

        $message = Message::create($messageData);
        $message->load(['sender:id,name,profile_image', 'receiver:id,name,profile_image']);

        return response()->json([
            'success' => true,
            'data' => $message,
        ]);
    }

    public function markAsRead($messageId): JsonResponse
    {
        $user = Auth::guard('api')->user();
        
        $message = Message::where('id', $messageId)
            ->where('receiver_id', $user->id)
            ->firstOrFail();

        $message->markAsRead();

        return response()->json([
            'success' => true,
            'data' => $message,
        ]);
    }

    public function deleteConversation($userId): JsonResponse
    {
        $currentUser = Auth::guard('api')->user();
        
        Message::between($currentUser->id, $userId)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Conversation deleted successfully',
        ]);
    }

    public function unreadCount(): JsonResponse
    {
        $user = Auth::guard('api')->user();
        
        $count = Message::where('receiver_id', $user->id)
            ->whereNull('read_at')
            ->count();

        return response()->json([
            'success' => true,
            'data' => ['unread_count' => $count],
        ]);
    }

    private function canMessage(User $sender, User $receiver): bool
    {
        // Admin can message anyone
        if ($sender->role === 'admin') {
            return true;
        }

        // For testing: Allow all recruiter-user and user-recruiter messaging
        if (($sender->role === 'recruiter' && $receiver->role === 'user') ||
            ($sender->role === 'user' && $receiver->role === 'recruiter')) {
            return true;
        }

        // Same role messaging not allowed (except admin)
        return false;
    }
}
