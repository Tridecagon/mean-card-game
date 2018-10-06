import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BidcardComponent } from './bidcard.component';

describe('BidcardComponent', () => {
  let component: BidcardComponent;
  let fixture: ComponentFixture<BidcardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BidcardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BidcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
