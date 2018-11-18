import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectpanelComponent } from './selectpanel.component';

describe('SelectpanelComponent', () => {
  let component: SelectpanelComponent;
  let fixture: ComponentFixture<SelectpanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectpanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectpanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
