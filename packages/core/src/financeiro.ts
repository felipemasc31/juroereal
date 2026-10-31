export function totalParcelado(valorParcela: number, numeroParcelas: number): number {
  return valorParcela * numeroParcelas;
}

export function taxaMensalEquivalente(taxaAnual: number): number {
  return (1 + taxaAnual) ** (1 / 12) - 1;
}

export function taxaAnualEquivalente(taxaMensal: number): number {
  return (1 + taxaMensal) ** 12 - 1;
}

export function saldoFinalParcelando(
  valorParcela: number,
  numeroParcelas: number,
  taxaMensal: number,
  primeiraNoAto: boolean,
  precoAVista: number,
): number {
  let valorHoje = precoAVista;

  for (let i = 1; i <= numeroParcelas; i++) {
    valorHoje = valorHoje + valorHoje * taxaMensal;
    valorHoje = valorHoje - valorParcela;
  }
  return valorHoje;
}
