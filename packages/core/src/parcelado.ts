export function aliquotaIR(numeroParcelas: number): number {
  let aliquota = 0;
  if (numeroParcelas * 30 <= 180) {
    aliquota = 0.225;
  } else if (numeroParcelas * 30 <= 360) {
    aliquota = 0.2;
  } else if (numeroParcelas * 30 <= 720) {
    aliquota = 0.175;
  } else {
    aliquota = 0.15;
  }
  return aliquota;
}
