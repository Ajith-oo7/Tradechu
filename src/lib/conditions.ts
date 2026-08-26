import type { CardCondition } from "@/types";

export const CARD_CONDITIONS: { value: CardCondition; label: string }[] = [
  { value: "NM", label: "Near Mint" },
  { value: "LP", label: "Lightly Played" },
  { value: "MP", label: "Moderately Played" },
  { value: "HP", label: "Heavily Played" },
  { value: "DMG", label: "Damaged" },
  { value: "Sealed", label: "Sealed" },
];

export function conditionLabel(c?: CardCondition): string {
  if (!c) return "";
  return CARD_CONDITIONS.find((x) => x.value === c)?.label ?? c;
}
