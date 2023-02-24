import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PlayspaceComponent } from './playspace.component';

describe('PlayspaceComponent', () => {
  let component: PlayspaceComponent;
  let fixture: ComponentFixture<PlayspaceComponent>;

  beforeEach(waitForAsync(() => {
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
