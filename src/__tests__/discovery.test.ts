import { bars } from '@/data/bars';
import { parseIntent, rankBars, reply } from '@/features/assistant/engine';
import { applyFilters, countAdvanced, DEFAULT_FILTERS, searchBars } from '@/features/discovery/filtering';

const night = new Date(2026, 9, 23, 21, 0);
const ctx = { barsWithPromo: new Set(['boteco-lume']), preferred: ['jazz' as const] };

describe('applyFilters', () => {
  it('"Para você" ordena por afinidade com as preferências', () => {
    const result = applyFilters(bars, DEFAULT_FILTERS, night, ctx);
    expect(result[0].vibes).toContain('jazz');
  });

  it('filtra rooftop e happy hour', () => {
    expect(applyFilters(bars, { ...DEFAULT_FILTERS, quick: 'rooftop' }, night, ctx).map((b) => b.id)).toEqual(['casa-verde']);
    expect(applyFilters(bars, { ...DEFAULT_FILTERS, quick: 'happy' }, night, ctx).map((b) => b.id)).toEqual(['boteco-lume']);
  });

  it('respeita distância e preço', () => {
    const result = applyFilters(bars, { ...DEFAULT_FILTERS, maxDistanceKm: 1, priceLevels: [1] }, night, ctx);
    expect(result.map((b) => b.id)).toEqual(['boteco-lume']);
  });

  it('conta filtros avançados ativos', () => {
    expect(countAdvanced(DEFAULT_FILTERS)).toBe(0);
    expect(countAdvanced({ ...DEFAULT_FILTERS, openNow: true, vibes: ['bar'] })).toBe(2);
  });
});

describe('searchBars', () => {
  it('ignora acentos e caixa', () => {
    expect(searchBars(bars, 'porao').map((b) => b.id)).toEqual(['porao-33']);
    expect(searchBars(bars, 'COQUETELARIA').length).toBeGreaterThan(0);
  });
});

describe('assistant engine', () => {
  it('entende o pedido do exemplo do design', () => {
    const intent = parseIntent('Quero um bar tranquilo pra 4 pessoas, com drink autoral e que dê pra ir a pé.');
    expect(intent.vibes).toEqual(expect.arrayContaining(['quiet', 'cocktail']));
    expect(intent.maxDistanceKm).toBe(1.5);
    expect(intent.groupSize).toBe(4);
  });

  it('só sugere bares que atendem a pelo menos uma vibe', () => {
    const ranked = rankBars(bars, { vibes: ['rooftop'] });
    expect(ranked[0].bar.id).toBe('casa-verde');
    expect(ranked.every((s) => s.match <= 99)).toBe(true);
  });

  it('pede mais contexto quando a mensagem é vaga', () => {
    const r = reply('oi', bars);
    expect(r.suggestions).toHaveLength(0);
    expect(r.followUps.length).toBeGreaterThan(0);
  });
});
