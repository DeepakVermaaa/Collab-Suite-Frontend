import { TestBed } from '@angular/core/testing';

import { PasswordStrengthServiceService } from './password-strength-service.service';

describe('PasswordStrengthServiceService', () => {
  let service: PasswordStrengthServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PasswordStrengthServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
