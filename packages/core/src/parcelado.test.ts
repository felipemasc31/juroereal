import { describe, it, expect } from 'vitest';
import { aliquotaIR } from './parcelado';

describe('aliquotaIR', () => {
  it('parcelando em 6 meses', () => {
    expect(aliquotaIR(6)).toBeCloseTo(0.225, 3);
  });
  it('parcelando em 7 meses', () => {
    expect(aliquotaIR(7)).toBeCloseTo(0.2, 3);
  });
  it('parcelando em 12 meses', () => {
    expect(aliquotaIR(12)).toBeCloseTo(0.2, 3);
  });
  it('parcelando em 13 meses', () => {
    expect(aliquotaIR(13)).toBeCloseTo(0.175, 3);
  });
  it('parcelando em 24 meses', () => {
    expect(aliquotaIR(24)).toBeCloseTo(0.175, 3);
  });
  it('parcelando em 25 meses', () => {
    expect(aliquotaIR(25)).toBeCloseTo(0.15, 3);
  });
});
