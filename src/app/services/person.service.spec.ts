import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { PersonService } from './person.service';

describe('PersonService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports:[HttpClientModule]
  }));

  it('should be created', () => {
    const service: PersonService = TestBed.get(PersonService);
    expect(service).toBeTruthy();
  });
});
