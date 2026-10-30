import { describe, it, expect } from 'vitest';
import { totalParcelado, taxaMensalEquivalente, taxaAnualEquivalente } from './financeiro';

describe('totalParcelado', () => {
  it('multiplica o valor da parcela pelo número de parcelas', () => {
    expect(totalParcelado(200, 12)).toBe(2400);
  });
});

describe('taxaMensalEquivalente', () => {
  it('converte 13,75% ao ano para a taxa mensal composta', () => {
    expect(taxaMensalEquivalente(0.1375)).toBeCloseTo(0.010794, 4);
  });
});

describe('taxaAnualEquivalente', () => {
  it('converte 1% ao mês para a taxa anual composta', () => {
    expect(taxaAnualEquivalente(0.01)).toBeCloseTo(0.126825, 4);
  });

  it('desfaz a conversão para mensal', () => {
    const mensal = taxaMensalEquivalente(0.1375);
    expect(taxaAnualEquivalente(mensal)).toBeCloseTo(0.1375, 4);
  });
});
