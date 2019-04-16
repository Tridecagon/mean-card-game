import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultpanelComponent } from './resultpanel.component';

describe('ResultpanelComponent', () => {
  let component: ResultpanelComponent;
  let fixture: ComponentFixture<ResultpanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResultpanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResultpanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
