/**
 * Motor do budd AI (local, determinístico). Extrai intenções do texto,
 * pontua os bares e monta uma resposta com cards e ações.
 *
 * Por que local e não um LLM direto no app: chave de API embutida no
 * bundle é chave vazada. A integração real deve passar por um backend
 * (ver README → Melhorias futuras). A interface `reply()` já é a fronteira
 * que esse backend substituiria.
 */
import type { Bar, Vibe } from '@/types/domain';

import { normalize } from '../discovery/filtering';

export interface Intent {
  vibes: Vibe[];
  maxDistanceKm?: number;
  maxPrice?: number;
  groupSize?: number;
}

export interface Suggestion {
  bar: Bar;
  match: number;
}

export interface AssistantReply {
  text: string;
  suggestions: Suggestion[];
  followUps: string[];
}

const VIBE_KEYWORDS: { vibe: Vibe; words: string[] }[] = [
  { vibe: 'quiet', words: ['tranquilo', 'calmo', 'conversar', 'sossegado', 'intimista'] },
  { vibe: 'cocktail', words: ['drink', 'coquetel', 'autoral', 'gin', 'mezcal', 'caipirinha'] },
  { vibe: 'vegan', words: ['vegano', 'vegana', 'vegetariano', 'plant'] },
  { vibe: 'balada', words: ['dancar', 'balada', 'dj', 'festa', 'house'] },
  { vibe: 'jazz', words: ['jazz'] },
  { vibe: 'samba', words: ['samba', 'pagode', 'roda'] },
  { vibe: 'wine', words: ['vinho', 'taca', 'natural'] },
  { vibe: 'craft', words: ['cerveja', 'chopp', 'ipa', 'artesanal'] },
  { vibe: 'boteco', words: ['boteco', 'buteco', 'petisco'] },
  { vibe: 'rooftop', words: ['rooftop', 'vista', 'terraco', 'cobertura'] },
  { vibe: 'outdoor', words: ['ar livre', 'quintal', 'externa', 'aberto'] },
  { vibe: 'pet', words: ['pet', 'cachorro', 'cao'] },
  { vibe: 'live', words: ['ao vivo', 'show', 'banda', 'musica'] },
];

const NUMBER_WORDS: Record<string, number> = { dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6, oito: 8, dez: 10 };

export function parseIntent(message: string): Intent {
  const text = normalize(message);
  const vibes = VIBE_KEYWORDS.filter(({ words }) => words.some((w) => text.includes(w))).map(({ vibe }) => vibe);

  const intent: Intent = { vibes };
  if (/(a pe|perto|caminhando|andando|do lado)/.test(text)) intent.maxDistanceKm = 1.5;
  if (/(barato|economic|em conta|sem gastar|pouco)/.test(text)) intent.maxPrice = 2;

  const group = text.match(/(?:pra|para|somos)\s+(\d+|\w+)\s+pessoas?/);
  if (group) {
    const n = Number(group[1]) || NUMBER_WORDS[group[1]];
    if (n) intent.groupSize = n;
  }
  return intent;
}

export function rankBars(list: Bar[], intent: Intent): Suggestion[] {
  const scored = list
    .filter((b) => (intent.maxDistanceKm ? b.distanceKm <= intent.maxDistanceKm : true))
    .filter((b) => (intent.maxPrice ? b.priceLevel <= intent.maxPrice : true))
    .map((bar) => {
      const hits = intent.vibes.filter((v) => bar.vibes.includes(v)).length;
      const coverage = intent.vibes.length ? hits / intent.vibes.length : 0.6;
      const score = coverage * 0.75 + (bar.rating / 5) * 0.2 + Math.max(0, 1 - bar.distanceKm / 5) * 0.05;
      return { bar, score, hits };
    })
    .filter((s) => intent.vibes.length === 0 || s.hits > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map(({ bar, score }) => ({ bar, match: Math.min(99, Math.round(55 + score * 45)) }));
}

const VIBE_LABEL: Partial<Record<Vibe, string>> = {
  quiet: 'tranquilo',
  cocktail: 'drink autoral',
  vegan: 'opção vegana',
  balada: 'pista pra dançar',
  jazz: 'jazz',
  samba: 'samba',
  wine: 'vinho',
  craft: 'cerveja boa',
  rooftop: 'vista',
  outdoor: 'ar livre',
  pet: 'pet friendly',
  live: 'música ao vivo',
};

function describe(intent: Intent): string {
  const parts = intent.vibes.map((v) => VIBE_LABEL[v]).filter(Boolean) as string[];
  if (intent.maxDistanceKm) parts.push('a pé');
  if (intent.maxPrice) parts.push('em conta');
  return parts.join(', ');
}

export function reply(message: string, list: Bar[]): AssistantReply {
  const intent = parseIntent(message);
  const hasSignal = intent.vibes.length > 0 || intent.maxDistanceKm || intent.maxPrice;

  if (!hasSignal) {
    return {
      text: 'Me conta o clima que você quer: tranquilo ou animado? Drink, cerveja ou vinho? Perto ou topa andar?',
      suggestions: [],
      followUps: ['Bar tranquilo com drink autoral', 'Onde dançar hoje?', 'Algo barato perto de mim'],
    };
  }

  const suggestions = rankBars(list, intent);
  if (suggestions.length === 0) {
    return {
      text: `Não achei nada com ${describe(intent)} agora. Quer que eu amplie a distância ou relaxe algum critério?`,
      suggestions: [],
      followUps: ['Pode ser mais longe', 'Qualquer preço', 'Me surpreenda'],
    };
  }

  const group = intent.groupSize ? ` Já vi mesa pra ${intent.groupSize}.` : '';
  const n = suggestions.length;
  return {
    text: `Achei ${n === 1 ? '1 lugar' : `${n} lugares`} com ${describe(intent)} que combinam com você.${group}`,
    suggestions,
    followUps: ['E depois, onde dançar?', 'Algo mais barato', 'Tem opção vegana?'],
  };
}
