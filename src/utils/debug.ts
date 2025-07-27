export const dbg = (stage: string, payload?: unknown) =>
  console.log(`[ShuffleSurvivor] ${stage}`, payload ?? '');
