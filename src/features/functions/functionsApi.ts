import { api } from '../../services/api';

export type BlocklyArg = Record<string, unknown>;

export type BlocklyBlockDefinition = {
  type: string;
  message0: string;
  args0?: BlocklyArg[];
  [key: string]: unknown;
};

export type FunctionSummary = {
  id: number;
  nome: string;
  descricao: string;
  codigoArduino: string;
  blocoDefinicao: BlocklyBlockDefinition;
};

export function listFunctions() {
  return api.get<FunctionSummary[]>('/functions');
}
