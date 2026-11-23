/** mulberry32: tiny, fast, deterministic PRNG. */
export function createRng(seed: number) {
  let state = seed >>> 0;
  const next = (): number => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number): number => min + Math.floor(next() * (max - min + 1)),
    pick: <T>(items: readonly T[]): T => {
      const item = items[Math.floor(next() * items.length)];
      if (item === undefined) throw new Error("pick() from empty list");
      return item;
    },
    weighted: <T>(items: readonly { value: T; weight: number }[]): T => {
      const total = items.reduce((sum, i) => sum + i.weight, 0);
      let roll = next() * total;
      for (const item of items) {
        roll -= item.weight;
        if (roll < 0) return item.value;
      }
      const last = items[items.length - 1];
      if (!last) throw new Error("weighted() from empty list");
      return last.value;
    },
  };
}

export type Rng = ReturnType<typeof createRng>;
