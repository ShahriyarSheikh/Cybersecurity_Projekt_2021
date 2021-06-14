import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WalletmanagmentComponent } from './walletmanagment.component';

describe('WalletmanagmentComponent', () => {
  let component: WalletmanagmentComponent;
  let fixture: ComponentFixture<WalletmanagmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WalletmanagmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WalletmanagmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
