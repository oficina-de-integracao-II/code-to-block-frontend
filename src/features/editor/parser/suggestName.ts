/**
 * Quantas letras trocadas, sobrando ou faltando ainda valem uma sugestão:
 * uma a cada três letras do nome (mínimo uma). Assim `Andarr` sugere
 * `Andar`, mas `Vire` não vira `Pare`.
 */
const maxDistance = (name: string) => Math.max(1, Math.floor(name.length / 3));

/** Distância de edição (Levenshtein) entre dois textos. */
function editDistance(a: string, b: string) {
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);

  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + cost,
      );
    }

    previous = current;
  }

  return previous[b.length];
}

/**
 * Nome do catálogo mais parecido com `name`, ignorando maiúsculas e
 * minúsculas. Retorna `undefined` quando nenhum é parecido o suficiente.
 * Em caso de empate, vale o que vem primeiro no catálogo.
 */
export function suggestName(name: string, knownNames: readonly string[]) {
  const target = name.toLowerCase();
  let best: string | undefined;
  let bestDistance = Infinity;

  for (const candidate of knownNames) {
    const distance = editDistance(target, candidate.toLowerCase());

    if (distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  // Exige que sobre algo do nome original: "x" não deve virar "Pare".
  const isClose =
    bestDistance <= maxDistance(name) && bestDistance < name.length;

  return isClose ? best : undefined;
}
