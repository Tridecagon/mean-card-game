import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TurnpanelComponent } from './turnpanel.component';

describe('TurnpanelComponent', () => {
  let component: TurnpanelComponent;
  let fixture: ComponentFixture<TurnpanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TurnpanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TurnpanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
