import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalificationComponent } from './calification.component';

describe('CalificationComponent', () => {
  let component: CalificationComponent;
  let fixture: ComponentFixture<CalificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
