import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ChatMessage } from 'src/app/models/ChatMessage';
import { ChatRoom } from 'src/app/models/ChatRoom';

@Component({
  selector: 'app-team-chat',
  templateUrl: './team-chat.component.html',
  styleUrls: ['./team-chat.component.css']
})
export class TeamChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  chatRooms: ChatRoom[] | undefined = [];
  selectedRoom: ChatRoom | null = null;
  messages: ChatMessage[] = [];
  onlineUsers: string[] = [];
  currentUserId: number;
  messageForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();
  private shouldScrollToBottom = false;

  constructor(
    private chatService: ChatService,
    private fb: FormBuilder
  ) {
    const userString = localStorage.getItem('user') || '';
    const user = userString ? JSON.parse(userString) : null;
    this.currentUserId = user ? user.id : null;
    this.messageForm = this.fb.group({
      message: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  ngOnInit() {
    this.initializeChat();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }


  private async initializeChat() {
    try {
      this.isLoading = true;
      await this.chatService.startConnection();
      await this.loadChatRooms();
      this.subscribeToEvents();
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      this.error = 'Failed to connect to chat service. Please try refreshing the page.';
    } finally {
      this.isLoading = false;
    }
  }

  private async loadChatRooms() {
    try {
      this.chatRooms = await this.chatService.getChatRooms().toPromise();
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      this.error = 'Failed to load chat rooms';
      throw error;
    }
  }

  private subscribeToEvents() {
    this.chatService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe(messages => {
        this.messages = messages;
        this.shouldScrollToBottom = true;
      });

    this.chatService.onlineUsers$
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.onlineUsers = users;
      });
  }

  async selectRoom(room: ChatRoom) {
    if (this.selectedRoom?.id !== room.id) {
      try {
        this.isLoading = true;
        if (this.selectedRoom) {
          await this.chatService.leaveGroup(this.selectedRoom.id);
        }
        this.selectedRoom = room;
        await this.chatService.joinGroup(room.id);
        // Clear any previous errors when successfully joining a room
        this.error = null;
      } catch (error) {
        console.error('Error selecting room:', error);
        this.error = 'Failed to join chat room';
        this.selectedRoom = null;
      } finally {
        this.isLoading = false;
      }
    }
  }

  async sendMessage() {
    if (this.messageForm.invalid || !this.selectedRoom || this.isLoading) {
      return;
    }

    const content = this.messageForm.get('message')?.value?.trim();
    if (!content) {
      return;
    }

    try {
      this.isLoading = true;
      await this.chatService.sendMessage(this.selectedRoom.id, content);
      this.messageForm.reset();
      this.error = null;
    } catch (error) {
      console.error('Error sending message:', error);
      this.error = 'Failed to send message';
    } finally {
      this.isLoading = false;
    }
  }

  async deleteMessage(messageId: number) {
    try {
      this.isLoading = true;
      await this.chatService.deleteMessage(messageId).toPromise();
      this.messages = this.messages.filter(m => m.id !== messageId);
      this.error = null;
    } catch (error) {
      console.error('Error deleting message:', error);
      this.error = 'Failed to delete message';
    } finally {
      this.isLoading = false;
    }
  }

  private scrollToBottom(): void {
    try {
      const element = this.messagesContainer?.nativeElement;
      if (element) {
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  isOwnMessage(message: ChatMessage): boolean {
    return message.senderId?.toString() === this.currentUserId?.toString();
  }

  getFormattedDate(): string {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    });
  }

  ngOnDestroy() {
    if (this.selectedRoom) {
      this.chatService.leaveGroup(this.selectedRoom.id);
    }
    this.chatService.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }
}