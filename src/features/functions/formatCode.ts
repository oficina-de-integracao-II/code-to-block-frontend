/** Remove linhas em branco das pontas e a indentação comum do código. */
export function dedent(code: string) {
  const lines = code.replace(/^\n+|\s+$/g, '').split('\n');
  const indents = lines
    .filter((line) => line.trim())
    .map((line) => line.length - line.trimStart().length);
  const min = indents.length ? Math.min(...indents) : 0;

  return lines.map((line) => line.slice(min)).join('\n');
}
