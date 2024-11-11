import { ChatMessage } from "./ChatMessage";

export interface MessageGroup {
  date: string;
  messages: ChatMessage[];
}