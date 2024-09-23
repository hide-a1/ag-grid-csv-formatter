import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplaceColumnValueDialogComponent } from './replace-column-value-dialog.component';

describe('ReplaceColumnValueDialogComponent', () => {
  let component: ReplaceColumnValueDialogComponent;
  let fixture: ComponentFixture<ReplaceColumnValueDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReplaceColumnValueDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReplaceColumnValueDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
