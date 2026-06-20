export function toApiConfidence(dbScore: number): number {
  if (dbScore > 1) {
    return Math.round(dbScore) / 100;
  }
  return dbScore;
}

export function toDbConfidence(apiScore: number): number {
  if (apiScore <= 1) {
    return Math.round(apiScore * 100);
  }
  return Math.round(apiScore);
}
