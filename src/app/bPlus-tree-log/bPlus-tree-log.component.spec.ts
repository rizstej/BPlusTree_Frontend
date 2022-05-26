import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

import { BPlusTreeLogComponent } from './bPlus-tree-log.component';

import { DataService } from '../services/data.service';
import { PersonService } from '../services/person.service';
import { UserService } from '../services/user.service';

describe('BPlusTreeLogComponent', () => {
  let component: BPlusTreeLogComponent;
  let fixture: ComponentFixture<BPlusTreeLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[HttpClientModule],
      declarations: [ BPlusTreeLogComponent ],
      providers: [
        DataService,
        PersonService,
        UserService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BPlusTreeLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
