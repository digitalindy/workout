// acronyms and proper nouns that should not be forced to title case
const MUSCLE_NAME_OVERRIDES: Record<string, string> = {
  lats: 'Lats',
  qls: 'QLs',
  ql: 'QL',
};

function normalizeMuscleName(raw: string): string {
  const lower = raw.toLowerCase().trim();
  if (MUSCLE_NAME_OVERRIDES[lower]) {
    return MUSCLE_NAME_OVERRIDES[lower];
  }
  // title-case each word, preserving hyphens and slashes as separators
  return lower
    .split(/(\s+|[-/])/)
    .map((part) => {
      if (/^\s+$/.test(part) || part === '-' || part === '/') {
        return part;
      }
      if (MUSCLE_NAME_OVERRIDES[part]) {
        return MUSCLE_NAME_OVERRIDES[part];
      }
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join('');
}

export function extractExerciseMuscleGroups(instructions: string): string[] {
  const match = instructions.match(/\*\*Muscle Groups?:\*\*\s*([^\n]+)/i);
  if (!match) {
    return [];
  }
  return match[1]
    .split(',')
    .map((s) => s.replace(/\([^)]*\)/g, '').trim())
    .filter(Boolean)
    .map(normalizeMuscleName);
}

export function extractExerciseEquipment(instructions: string): string | null {
  const match = instructions.match(/\*\*Equipment:\*\*\s*([^\n]+)/i);
  return match ? match[1].trim() : null;
}
