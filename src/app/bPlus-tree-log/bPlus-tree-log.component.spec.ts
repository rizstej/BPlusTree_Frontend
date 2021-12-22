import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BPlusTreeLogComponent } from './bPlus-tree-log.component';

describe('BPlusTreeLogComponent', () => {
  let component: BPlusTreeLogComponent;
  let fixture: ComponentFixture<BPlusTreeLogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BPlusTreeLogComponent ]
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
