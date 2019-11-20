import { TestBed } from '@angular/core/testing';

import { LstmService } from './lstm.service';

describe('LstmService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LstmService = TestBed.get(LstmService);
    expect(service).toBeTruthy();
  });
});
