import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IpfsbackupComponent } from './ipfsbackup.component';

describe('IpfsbackupComponent', () => {
  let component: IpfsbackupComponent;
  let fixture: ComponentFixture<IpfsbackupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IpfsbackupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IpfsbackupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
