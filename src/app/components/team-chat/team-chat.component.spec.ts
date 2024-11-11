import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamChatComponent } from './team-chat.component';

describe('TeamChatComponent', () => {
  let component: TeamChatComponent;
  let fixture: ComponentFixture<TeamChatComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TeamChatComponent]
    });
    fixture = TestBed.createComponent(TeamChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
