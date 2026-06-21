export function parseBooksFromDetails(details?: string): number | undefined {
  if (!details) return undefined;
  const match = details.match(/\d+/);
  if (!match) return undefined;
  const count = parseInt(match[0], 10);
  return count > 0 ? count : undefined;
}

export function sponsorshipProgressPct(booksFunded: number, booksNeeded: number) {
  if (!booksNeeded) return 0;
  return Math.min(100, Math.round((booksFunded / booksNeeded) * 100));
}
