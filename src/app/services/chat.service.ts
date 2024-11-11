// services/chat.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { ChatMessage } from '../models/ChatMessage';
import { ChatRoom } from '../models/ChatRoom';
import { environment } from 'environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = environment.apiUrl;
  private hubConnection: HubConnection;
  private messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private onlineUsersSubject = new BehaviorSubject<string[]>([]);
  
  public messages$ = this.messagesSubject.asObservable();
  public onlineUsers$ = this.onlineUsersSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.apiUrl}/chatHub`, { 
        accessTokenFactory: () => token || '',
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();
  }

  public async startConnection(): Promise<void> {
    try {
      await this.hubConnection.start();
      console.log('SignalR Connected');
      this.registerSignalRHandlers();
    } catch (error) {
      console.error('SignalR Connection Error:', error);
      setTimeout(() => this.startConnection(), 5000);
    }
  }

  private registerSignalRHandlers(): void {
    this.hubConnection.on('ReceiveMessage', (message: ChatMessage) => {
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, message]);
    });

    this.hubConnection.on('UserJoined', (username: string) => {
      const currentUsers = this.onlineUsersSubject.value;
      if (!currentUsers.includes(username)) {
        this.onlineUsersSubject.next([...currentUsers, username]);
      }
    });

    this.hubConnection.on('UserLeft', (username: string) => {
      const currentUsers = this.onlineUsersSubject.value;
      this.onlineUsersSubject.next(currentUsers.filter(u => u !== username));
    });
  }

  public async joinGroup(projectGroupId: number): Promise<void> {
    try {
      await this.hubConnection.invoke('JoinGroup', projectGroupId);
      // Load message history after joining
      const history = await this.getMessageHistory(projectGroupId).toPromise();
      this.messagesSubject.next(history || []);
    } catch (error) {
      console.error('Error joining group:', error);
    }
  }

  public async leaveGroup(projectGroupId: number): Promise<void> {
    try {
      await this.hubConnection.invoke('LeaveGroup', projectGroupId);
      this.messagesSubject.next([]);
    } catch (error) {
      console.error('Error leaving group:', error);
    }
  }

  public async sendMessage(projectGroupId: number, content: string): Promise<void> {
    try {
      await this.hubConnection.invoke('SendMessage', projectGroupId, content);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  public getChatRooms(): Observable<ChatRoom[]> {
    return this.http.get<ChatRoom[]>(`${this.apiUrl}/api/Chat/rooms`);
  }

  public getMessageHistory(projectGroupId: number, limit?: number): Observable<ChatMessage[]> {
    let url = `${this.apiUrl}/api/Chat/${projectGroupId}/history`;
    if (limit) {
      url += `?limit=${limit}`;
    }
    return this.http.get<ChatMessage[]>(url);
  }

  public deleteMessage(messageId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/Chat/${messageId}`);
  }

  public disconnect(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  public isConnected(): boolean {
    return this.hubConnection?.state === 'Connected';
  }
}