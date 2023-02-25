import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ShowgamepanelComponent } from './showgamepanel.component';

describe('ShowgamepanelComponent', () => {
  let component: ShowgamepanelComponent;
  let fixture: ComponentFixture<ShowgamepanelComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ShowgamepanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShowgamepanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
