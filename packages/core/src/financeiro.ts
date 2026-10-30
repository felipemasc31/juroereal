export function totalParcelado(valorParcela: number, numeroParcelas: number): number {
    return valorParcela * numeroParcelas;
}

export function taxaMensalEquivalente(taxaAnual: number) {
    return taxaAnual / 12;
}

export function taxaAnualEquivalente(taxaMensal: number){
    return taxaMensal * 12
}