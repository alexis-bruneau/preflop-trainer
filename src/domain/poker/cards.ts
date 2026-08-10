/**
 * cards.ts
 * Core card types, deck, hand classification, and card generation utilities.
 * All 1,326 two-card combinations map to 169 strategically distinct hand classes.
 */

// ─── Ranks & Suits ──────────────────────────────────────────────────────────

export const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
export type Rank = (typeof RANKS)[number];

export const SUITS = ['s', 'h', 'd', 'c'] as const;
export type Suit = (typeof SUITS)[number];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  s: '♠',
  h: '♥',
  d: '♦',
  c: '♣',
};

export const SUIT_COLORS: Record<Suit, 'black' | 'red'> = {
  s: 'black',
  h: 'red',
  d: 'red',
  c: 'black',
};

// ─── Card ────────────────────────────────────────────────────────────────────

export interface Card {
  rank: Rank;
  suit: Suit;
}

export function cardToString(card: Card): string {
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
}

export function cardToKey(card: Card): string {
  return `${card.rank}${card.suit}`;
}

// ─── Deck ────────────────────────────────────────────────────────────────────

export const DECK: Card[] = RANKS.flatMap((rank) =>
  SUITS.map((suit): Card => ({ rank, suit }))
);

// ─── Hand Class ──────────────────────────────────────────────────────────────

/**
 * A HandClass is a string like "AA", "AKs", or "AKo".
 * - Pairs: two-letter like "AA", "KK", ..., "22"
 * - Suited: three-letter ending in 's', e.g. "AKs"
 * - Offsuit: three-letter ending in 'o', e.g. "AKo"
 * The first rank is always the higher one.
 */
export type HandClass = string;

// ─── Rank Index ──────────────────────────────────────────────────────────────

export const RANK_INDEX: Record<Rank, number> = Object.fromEntries(
  RANKS.map((r, i) => [r, i])
) as Record<Rank, number>;

// Higher index = lower rank (A=0, 2=12)
export function rankValue(rank: Rank): number {
  return RANK_INDEX[rank];
}

export function higherRank(a: Rank, b: Rank): Rank {
  return rankValue(a) <= rankValue(b) ? a : b;
}

export function lowerRank(a: Rank, b: Rank): Rank {
  return rankValue(a) >= rankValue(b) ? a : b;
}

// ─── Hand Classification ─────────────────────────────────────────────────────

/**
 * Classify a two-card hand into one of the 169 strategic hand classes.
 * e.g. [As, Ks] → "AKs", [As, Kh] → "AKo", [Ah, As] → "AA"
 */
export function classifyHand(cards: [Card, Card]): HandClass {
  const [c1, c2] = cards;
  const high = rankValue(c1.rank) <= rankValue(c2.rank) ? c1.rank : c2.rank;
  const low = rankValue(c1.rank) <= rankValue(c2.rank) ? c2.rank : c1.rank;

  if (high === low) {
    // Pair
    return `${high}${low}`;
  }

  const suited = c1.suit === c2.suit;
  return `${high}${low}${suited ? 's' : 'o'}`;
}

// ─── Combo Generation ────────────────────────────────────────────────────────

/**
 * Generate a random valid two-card hand for a given hand class.
 * Randomly selects suits that match the class constraints.
 */
export function generateCardsForHandClass(handClass: HandClass): [Card, Card] {
  if (isPair(handClass)) {
    // e.g. "AA" → pick 2 of 4 suits
    const rank = handClass[0] as Rank;
    const shuffledSuits = [...SUITS].sort(() => Math.random() - 0.5);
    return [
      { rank, suit: shuffledSuits[0] },
      { rank, suit: shuffledSuits[1] },
    ];
  }

  const rank1 = handClass[0] as Rank;
  const rank2 = handClass[1] as Rank;

  if (isSuited(handClass)) {
    // e.g. "AKs" → same suit for both cards
    const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
    return [
      { rank: rank1, suit },
      { rank: rank2, suit },
    ];
  }

  // Offsuit: e.g. "AKo" → different suits
  const shuffledSuits = [...SUITS].sort(() => Math.random() - 0.5);
  const suit1 = shuffledSuits[0];
  // Pick a different suit for card 2
  const remainingSuits = SUITS.filter((s) => s !== suit1);
  const suit2 = remainingSuits[Math.floor(Math.random() * remainingSuits.length)];
  return [
    { rank: rank1, suit: suit1 },
    { rank: rank2, suit: suit2 },
  ];
}

// ─── Hand Class Predicates ───────────────────────────────────────────────────

export function isPair(handClass: HandClass): boolean {
  return handClass.length === 2;
}

export function isSuited(handClass: HandClass): boolean {
  return handClass.length === 3 && handClass[2] === 's';
}

export function isOffsuit(handClass: HandClass): boolean {
  return handClass.length === 3 && handClass[2] === 'o';
}

// ─── Combo Counts ────────────────────────────────────────────────────────────

/**
 * Number of two-card combinations in a 52-card deck for a given hand class.
 * Pair: C(4,2) = 6
 * Suited: 4 (one per suit)
 * Offsuit: 4×3 = 12
 */
export function getComboCount(handClass: HandClass): number {
  if (isPair(handClass)) return 6;
  if (isSuited(handClass)) return 4;
  return 12;
}

// ─── Random Deal ─────────────────────────────────────────────────────────────

/**
 * Deal 2 random cards from a shuffled 52-card deck.
 * Used for Realistic Deal mode — naturally respects combo frequencies.
 */
export function dealRandomHand(): [Card, Card] {
  const shuffled = [...DECK].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}
