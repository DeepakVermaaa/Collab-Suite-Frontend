import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMilestoneModalComponent } from './create-milestone-modal.component';

describe('CreateMilestoneModalComponent', () => {
  let component: CreateMilestoneModalComponent;
  let fixture: ComponentFixture<CreateMilestoneModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateMilestoneModalComponent]
    });
    fixture = TestBed.createComponent(CreateMilestoneModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
