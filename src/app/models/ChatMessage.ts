export interface ChatMessage {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  projectGroupId: number;
  timestamp: Date;
}