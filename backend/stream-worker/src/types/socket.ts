export interface ChatMessage {
  sender: string;
  message: string;
  type: string;
  timestamp: string;
}

export interface ReceivedMessage {
  roomId: string; 
  message: string; 
  sender: string; 
  type: string
}

export interface RecivedCoordinateData {
  roomId: string;
  userId: string;
  latitude: number;
  longitude: number;
}


export interface SocketEvents {
  "subscribe": (roomId: string) => void;
  "send_message": (data: { roomId: string; message: string; sender: string; type: string }) => void;
  "chat_message": (message: ChatMessage) => void;
  "previous_messages": (messages: ChatMessage[]) => void;
}
