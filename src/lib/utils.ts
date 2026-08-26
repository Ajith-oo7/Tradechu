export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    Common: "bg-slate-500/20 text-slate-300",
    Uncommon: "bg-green-500/20 text-green-300",
    Rare: "bg-blue-500/20 text-blue-300",
    Holo: "bg-purple-500/20 text-purple-300",
    "Ultra Rare": "bg-amber-500/20 text-amber-300",
    "Secret Rare": "bg-pikachu/20 text-pikachu",
    Promo: "bg-pokeball/20 text-red-300",
    Vintage: "bg-orange-500/20 text-orange-300",
  };
  return colors[rarity] ?? "bg-slate-500/20 text-slate-300";
}

export function getMatchScoreColor(score: number): string {
  if (score >= 90) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (score >= 75) return "bg-pikachu/20 text-pikachu border-pikachu/30";
  return "bg-orange-500/20 text-orange-400 border-orange-500/30";
}
