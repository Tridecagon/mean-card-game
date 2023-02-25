import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShowgamecompactComponent } from './showgamecompact.component';

describe('ShowgamecompactComponent', () => {
  let component: ShowgamecompactComponent;
  let fixture: ComponentFixture<ShowgamecompactComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowgamecompactComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowgamecompactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
