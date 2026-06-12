import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Questionario } from './questionario';

describe('Questionario', () => {
  let component: Questionario;
  let fixture: ComponentFixture<Questionario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Questionario],
    }).compileComponents();

    fixture = TestBed.createComponent(Questionario);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
