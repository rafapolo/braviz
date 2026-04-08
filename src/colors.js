// Mapeamento de tipo (numérico) → nome da categoria + cor [R, G, B, A]
export const TIPOS = {
  1: { nome: 'Residência',                      cor: [255, 159,  28, 220], count: 7_709_779 },
  2: { nome: 'Uso coletivo',                    cor: [100, 160, 255, 200], count:     5_684 },
  3: { nome: 'Agropecuária',                    cor: [ 52, 199,  89, 220], count:    47_634 },
  4: { nome: 'Educação',                        cor: [ 66, 133, 244, 220], count:    16_499 },
  5: { nome: 'Saúde',                           cor: [255,  82,  82, 220], count:    15_402 },
  6: { nome: 'Comercial',                       cor: [  0, 188, 212, 220], count:   835_701 },
  7: { nome: 'Sem classificação',               cor: [140, 140, 140, 160], count:   276_279 },
  8: { nome: 'Religioso',                       cor: [175, 122, 197, 220], count:    55_222 },
};

export function getColor(tipo) {
  const entry = TIPOS[tipo] ?? TIPOS[Number(tipo)];
  return entry?.cor ?? [150, 150, 150, 140];
}

export function getLegendData() {
  return Object.entries(TIPOS).map(([id, { nome, cor, count }]) => ({ id, nome, cor, count }));
}
