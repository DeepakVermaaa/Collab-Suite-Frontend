import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskProjectDetailComponent } from './task-project-detail.component';

describe('TaskProjectDetailComponent', () => {
  let component: TaskProjectDetailComponent;
  let fixture: ComponentFixture<TaskProjectDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaskProjectDetailComponent]
    });
    fixture = TestBed.createComponent(TaskProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
