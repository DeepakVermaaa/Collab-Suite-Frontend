import { TestBed } from '@angular/core/testing';

import { DocumentManagementService } from './document-management.service';

describe('DocumentManagementService', () => {
  let service: DocumentManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DocumentManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
