export function totalParcelado(valorParcela: number, numeroParcelas: number): number {
  return valorParcela * numeroParcelas;
}

export function taxaMensalEquivalente(taxaAnual: number): number {
  return (1 + taxaAnual) ** (1 / 12) - 1;
}

export function taxaAnualEquivalente(taxaMensal: number): number {
  return (1 + taxaMensal) ** 12 - 1;
}

export function valorPresenteParcelas(valorParcela: number, numeroParcelas: number, taxaMensal: number, primeiraNoAto: boolean): number {
    return valorParcela / (1 + taxaMensal)**1;
}