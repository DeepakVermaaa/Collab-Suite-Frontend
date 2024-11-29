import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProjectDetailResponse } from '../models/ProjectDetailResponse';
import { ProjectRole } from '../models/enums/enums';
import { AuthService } from 'src/app/services/auth.service';
import { ProjectService } from '../service/project.service';
import { ToastService } from 'src/app/shared/toast/service/toast.service';
import { ConfirmationService } from 'src/app/shared/confirmation-modal/confirmation-modal/service/confirmation.service';
import { of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs/operators';
import { UserSearchResult } from 'src/app/models/UserSearchResult';
import { UserService } from 'src/app/services/user.service';
import { LoaderService } from 'src/app/shared/loader/service/loader.service';
import { ChatService } from 'src/app/services/chat.service';

interface RoleDistribution {
  role: ProjectRole;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-project-team',
  templateUrl: './project-team.component.html'
})
export class ProjectTeamComponent implements OnInit {
  @Input() project!: ProjectDetailResponse;
  canManageTeam = false;
  roleDistribution: RoleDistribution[] = [];
  
  // Add Member Dialog Properties
  isAddMemberDialogOpen = false;
  memberForm: FormGroup;
  searchTerm = new Subject<string>();
  searchResults: UserSearchResult[] = [];
  isSearching = false;
  selectedUser: UserSearchResult | null = null;
  ProjectRole = ProjectRole;

  // Edit Member Dialog Properties
  isEditRoleDialogOpen = false;
  editRoleForm!: FormGroup;
  memberToEdit: any = null;

  // Properties related to Chat Room Creation
  isCreateChatRoomDialogOpen = false;
  chatRoomForm!: FormGroup;

  constructor(
    public authService: AuthService,
    private projectService: ProjectService,
    private userService: UserService,
    private toastService: ToastService,
    private loaderService: LoaderService,
    private chatService: ChatService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder
  ) {
    // Initialize member form
    this.memberForm = this.fb.group({
      userId: [null, Validators.required],
      role: [ProjectRole.Member, Validators.required]
    });

    this.editRoleForm = this.fb.group({
      role: [null, Validators.required]
    });

    // Initialize chat room form
    this.chatRoomForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });

    // Setup search with debounce
    this.searchTerm.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.length < 2) {
          return of([]);
        }
        this.isSearching = true;
        return this.userService.searchUsers(term, this.project.id).pipe(
          finalize(() => {
            this.isSearching = false;
          })
        );
      })
    ).subscribe({
      next: (results) => {
        this.searchResults = results;
      },
      error: (error) => {
        console.error('Search error:', error);
        this.toastService.showError('Error searching for users');
        this.searchResults = [];
      }
    });
  }

  ngOnInit() {
    this.checkPermissions();
    this.calculateRoleDistribution();
  }

  private checkPermissions() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.project) return;

    const userMember = this.project.members.find(m => m.userId === currentUser.id);
    this.canManageTeam = userMember?.role === ProjectRole.Admin || 
                         userMember?.role === ProjectRole.Manager;
  }

  private calculateRoleDistribution() {
    const distribution = this.project.members.reduce((acc, member) => {
      acc[member.role] = (acc[member.role] || 0) + 1;
      return acc;
    }, {} as Record<ProjectRole, number>);

    const totalMembers = this.project.members.length;

    this.roleDistribution = Object.entries(distribution).map(([role, count]) => ({
      role: Number(role) as ProjectRole,
      count,
      percentage: (count / totalMembers) * 100
    }));
  }

  async onAddMember() {
    if (!this.canManageTeam) {
      this.toastService.showError('You do not have permission to add members');
      return;
    }
    this.memberForm.reset({ role: ProjectRole.Member });
    this.selectedUser = null;
    this.searchResults = [];
    this.isAddMemberDialogOpen = true;
  }

  onSearchInput(event: any) {
    const term = event.target.value?.trim();
    this.searchTerm.next(term);
    
    if (!term) {
      this.searchResults = [];
      this.selectedUser = null;
    }
  }

  onUserSelect(user: UserSearchResult) {
    this.selectedUser = user;
    this.memberForm.patchValue({ userId: user.id });
    this.searchResults = [];
  }

  onSubmitMember() {
    this.loaderService.show();
    if (this.memberForm.invalid) return;
  
    const memberDto = this.memberForm.value;
  
    this.projectService.addProjectMember(this.project.id, memberDto).subscribe({
      next: (response) => {
        // Parse the userName into firstName and lastName
        const [firstName, lastName] = response.member.userName.split(' ');
        
        // Create a properly formatted ProjectMember object
        const newMember = {
          userId: response.member.userId,
          firstName,
          lastName,
          role: response.member.role,
          joinedAt: new Date(response.member.joinedAt),
          profilePicture: response.member.profilePicture ? 
          this.authService.getProfilePictureUrlForAnyUser(response.member.profilePicture) : 
          null
        };
  
        this.project.members.push(newMember);
        this.calculateRoleDistribution();
        this.toastService.showSuccess('Team member added successfully');
        this.loaderService.hide();
        this.closeAddMemberDialog();
      },
      error: (error) => {
        this.toastService.showError(error.error?.message || 'Failed to add team member');
        this.loaderService.hide();
      }
    });
  }

  closeAddMemberDialog() {
    this.isAddMemberDialogOpen = false;
    this.memberForm.reset();
    this.selectedUser = null;
    this.searchResults = [];
  }

  async onEditMemberRole(member: { userId: number; firstName: string; lastName: string; role: ProjectRole }) {
    if (!this.canManageTeam) {
      this.toastService.showError('You do not have permission to edit member roles');
      return;
    }
  
    this.memberToEdit = member;
    this.editRoleForm.patchValue({ role: member.role });
    this.isEditRoleDialogOpen = true;
  }
  
  // private getNextRole(currentRole: ProjectRole): ProjectRole {
  //   // Define role rotation (excluding Admin for safety)
  //   const roleRotation = [
  //     ProjectRole.Member,
  //     ProjectRole.Manager,
  //     ProjectRole.Viewer
  //   ];
  
  //   const currentIndex = roleRotation.indexOf(currentRole);
  //   if (currentIndex === -1) return ProjectRole.Member; // Default to Member if current role not found
    
  //   // Get next role in rotation
  //   const nextIndex = (currentIndex + 1) % roleRotation.length;
  //   return roleRotation[nextIndex];
  // }

  closeEditRoleDialog() {
    this.isEditRoleDialogOpen = false;
    this.editRoleForm.reset();
    this.memberToEdit = null;
  }
  
  onSubmitRoleEdit() {
    if (this.editRoleForm.invalid) return;
    
    const newRole = Number(this.editRoleForm.value.role);
    
    if (newRole === this.memberToEdit.role) {
      this.closeEditRoleDialog();
      return;
    }
  
    this.loaderService.show();
    this.projectService.updateMemberRole(this.project.id, this.memberToEdit.userId, newRole).subscribe({
      next: (response) => {
        const updatedMember = this.project.members.find(m => m.userId === this.memberToEdit.userId);
        if (updatedMember) {
          updatedMember.role = newRole;
        }
        this.calculateRoleDistribution();
        this.toastService.showSuccess('Member role updated successfully');
        this.loaderService.hide();
        this.closeEditRoleDialog();
      },
      error: (error) => {
        console.error('Error updating member role:', error);
        this.toastService.showError(error.error?.message || 'Failed to update member role');
        this.loaderService.hide();
      }
    });
  }

  async onRemoveMember(member: { userId: number; firstName: string; lastName: string }) {
    if (!this.canManageTeam) {
      this.toastService.showError('You do not have permission to remove members');
      return;
    }
  
    const confirmed = await this.confirmationService.confirm({
      title: 'Remove Team Member',
      message: `Are you sure you want to remove ${member.firstName} ${member.lastName} from the project?`,
      confirmButtonText: 'Remove',
      cancelButtonText: 'Cancel',
      type: 'danger'
    });
  
    if (confirmed) {
      this.loaderService.show();
      this.projectService.removeMember(this.project.id, member.userId).subscribe({
        next: () => {
          // Remove member from local array
          this.project.members = this.project.members.filter(m => m.userId !== member.userId);
          this.calculateRoleDistribution();
          this.loaderService.hide();
          this.toastService.showSuccess('Team member removed successfully');
        },
        error: (error: any) => {
          console.error('Error removing member:', error);
          this.toastService.showError(error.error?.message || 'Failed to remove team member');
          this.loaderService.hide();
        }
      });
    }
  }

  async onCreateChatRoom() {
    if (!this.canManageTeam) {
      this.toastService.showError('You do not have permission to create chat rooms');
      return;
    }
    this.chatRoomForm.reset();
    this.isCreateChatRoomDialogOpen = true;
  }

  onSubmitChatRoom() {
    if (this.chatRoomForm.invalid) return;

    const chatRoomName = this.chatRoomForm.get('name')?.value.trim();
    if (!chatRoomName) return;

    this.loaderService.show();
    this.chatService.createChatRoom(this.project.id, chatRoomName).subscribe({
      next: (chatRoom) => {
        if (!this.project.chatRooms) {
          this.project.chatRooms = [];
        }
        this.project.chatRooms.push(chatRoom);
        this.toastService.showSuccess('Chat room created successfully');
        this.loaderService.hide();
        this.closeCreateChatRoomDialog();
      },
      error: (error) => {
        console.error('Error creating chat room:', error);
        this.toastService.showError(error.error?.message || 'Failed to create chat room');
        this.loaderService.hide();
      }
    });
  }

  closeCreateChatRoomDialog() {
    this.isCreateChatRoomDialogOpen = false;
    this.chatRoomForm.reset();
  }
  
  onOpenChat(room: { id: number; name: string }) {
    // TODO: Implement chat navigation/modal logic
  }

  getRoleBadgeClass(role: ProjectRole): string {
    const classes: Record<ProjectRole, string> = {
      [ProjectRole.Admin]: 'bg-purple-100 text-purple-800',
      [ProjectRole.Manager]: 'bg-blue-100 text-blue-800',
      [ProjectRole.Member]: 'bg-green-100 text-green-800',
      [ProjectRole.Viewer]: 'bg-pink-100 text-pink-800'
    };
    return classes[role] || 'bg-gray-100 text-gray-800';
  }
  getRoleIcon(role: ProjectRole): string {
    const icons: Record<ProjectRole, string> = {
      [ProjectRole.Admin]: 'fa-crown',
      [ProjectRole.Manager]: 'fa-user-tie',
      [ProjectRole.Member]: 'fa-user',
      [ProjectRole.Viewer]: 'fa-eye'
    };
    return icons[role] || 'fa-user';
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getRoleName(role: ProjectRole): string {
    return ProjectRole[role];
  }
}