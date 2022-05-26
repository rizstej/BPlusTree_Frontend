import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material';

import { BPlusTreeComponent } from './bPlus-tree.component';

import { DataService } from '../services/data.service';
import { PersonService } from '../services/person.service';
import { UserService } from '../services/user.service';

describe('BPlusTreeComponent', () => {
  let component: BPlusTreeComponent;
  let fixture: ComponentFixture<BPlusTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[
        HttpClientModule,
        FormsModule,
        MatFormFieldModule,
      ],
      declarations: [ BPlusTreeComponent ],
      providers: [
        DataService,
        PersonService,
        UserService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BPlusTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
