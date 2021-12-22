import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BPlusTreeComponent } from './bPlus-tree.component';

describe('BPlusTreeComponent', () => {
  let component: BPlusTreeComponent;
  let fixture: ComponentFixture<BPlusTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BPlusTreeComponent ]
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
