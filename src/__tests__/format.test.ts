import { eventDateParts, formatBRL, formatDistance, formatRating, isOpenAt, openingLabel } from '@/utils/format';

const at = (h: number, m = 0) => new Date(2026, 9, 23, h, m);

describe('format', () => {
  it('formata moeda em pt-BR com espaço comum', () => {
    expect(formatBRL(38)).toBe('R$ 38,00');
    expect(formatBRL(71.28)).toBe('R$ 71,28');
  });

  it('formata distância em metros abaixo de 1 km', () => {
    expect(formatDistance(0.65)).toBe('650 m');
    expect(formatDistance(1.2)).toBe('1,2 km');
  });

  it('formata nota com vírgula', () => {
    expect(formatRating(4.8)).toBe('4,8');
  });

  it('extrai dia da semana sem sofrer com fuso', () => {
    expect(eventDateParts('2026-10-24')).toEqual({ dow: 'SÁB', day: '24' });
  });
});

describe('isOpenAt', () => {
  const lateNight = { opens: '17:00', closes: '02:00' };

  it('considera horário que atravessa a meia-noite', () => {
    expect(isOpenAt(lateNight, at(23))).toBe(true);
    expect(isOpenAt(lateNight, at(1, 30))).toBe(true);
    expect(isOpenAt(lateNight, at(2))).toBe(false);
    expect(isOpenAt(lateNight, at(12))).toBe(false);
  });

  it('gera o rótulo correto', () => {
    expect(openingLabel(lateNight, at(20))).toEqual({ open: true, label: 'Aberto até 02h' });
    expect(openingLabel(lateNight, at(10))).toEqual({ open: false, label: 'Abre às 17h' });
  });
});
