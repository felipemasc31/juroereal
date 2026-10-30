import { describe, it, expect } from 'vitest';
import { totalParcelado, taxaMensalEquivalente, taxaAnualEquivalente, valorPresenteParcelas } from './financeiro';

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

describe('valorPresenteParcelas', () => {
    it('uma parcela', () => {
        expect(valorPresenteParcelas(101, 1, 0.01, false)).toBeCloseTo(100, 2);
    });

    it('sem rendimento', () => {
    expect(valorPresenteParcelas(200, 12, 0.01, false)).toBeCloseTo(2400, 2)
    });
    
    it('duas parcelas', () => {
    expect(valorPresenteParcelas(100, 2, 0.01, false)).toBeCloseTo(197.04, 2)
    });

    it('duas parcelas', () => {
    expect(valorPresenteParcelas(100, 2, 0.01, true)).toBeCloseTo(199.01, 2)
    });
});