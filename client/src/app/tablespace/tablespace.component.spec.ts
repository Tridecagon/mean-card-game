import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TablespaceComponent } from './tablespace.component';

describe('TablespaceComponent', () => {
  let component: TablespaceComponent;
  let fixture: ComponentFixture<TablespaceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TablespaceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TablespaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
