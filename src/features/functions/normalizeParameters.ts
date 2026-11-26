import type { FunctionParameter } from './functionsApi';

function toText(value: unknown) {
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}

function optionalText(value: unknown) {
  return value == null || value === '' ? undefined : toText(value);
}

function fromArrayItem(item: unknown, index: number): FunctionParameter {
  if (item && typeof item === 'object' && 'nome' in item) {
    const { nome, tipo, descricao } = item as Record<string, unknown>;

    return {
      nome: toText(nome),
      tipo: optionalText(tipo),
      descricao: optionalText(descricao),
    };
  }

  return { nome: item == null ? `param${index + 1}` : toText(item) };
}

/** Converte o JSON livre de `parametros` em uma lista exibível. */
export function normalizeParameters(raw: unknown): FunctionParameter[] {
  if (raw == null || raw === '') return [];

  if (Array.isArray(raw)) return raw.map(fromArrayItem);

  if (typeof raw === 'object') {
    return Object.entries(raw).map(([nome, valor]) => ({
      nome,
      descricao: toText(valor),
    }));
  }

  return [{ nome: String(raw) }];
}
