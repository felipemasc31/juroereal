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
  precoAVista: number,
  primeiraNoAto: boolean,
): number {
  let saldo = precoAVista;

  if (primeiraNoAto) {
    for (let i = 1; i <= numeroParcelas; i++) {
      saldo = saldo - valorParcela;
      saldo = saldo * (1 + taxaMensal);
    }
  } else {
    for (let i = 1; i <= numeroParcelas; i++) {
      saldo = saldo + saldo * taxaMensal;
      saldo = saldo - valorParcela;
    }
  }
  return saldo;
}
