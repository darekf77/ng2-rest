/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SocketsComponent } from './sockets.component';

describe('SocketsComponent', () => {
  let component: SocketsComponent;
  let fixture: ComponentFixture<SocketsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SocketsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SocketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
