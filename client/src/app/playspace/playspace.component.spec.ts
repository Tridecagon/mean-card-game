import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayspaceComponent } from './playspace.component';

describe('PlayspaceComponent', () => {
  let component: PlayspaceComponent;
  let fixture: ComponentFixture<PlayspaceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlayspaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlayspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
