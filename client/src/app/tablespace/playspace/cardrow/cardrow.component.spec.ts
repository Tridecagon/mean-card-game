import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CardrowComponent } from './cardrow.component';

describe('CardrowComponent', () => {
  let component: CardrowComponent;
  let fixture: ComponentFixture<CardrowComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CardrowComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CardrowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
