/**
 * Posição no texto, na mesma convenção do Monaco: linha e coluna começam em 1
 * e a coluna é contada em unidades UTF-16 (um tab vale 1).
 */
export type Position = {
  line: number;
  column: number;
};

/**
 * `start` aponta para o primeiro caractere do trecho e `end` para a posição
 * logo após o último (fim exclusivo, como nos ranges do Monaco).
 */
export type SourceRange = {
  start: Position;
  end: Position;
};

export type TokenType =
  | 'identifier'
  | 'leftParen'
  | 'rightParen'
  | 'semicolon'
  | 'unclosedComment'
  | 'unknown';

export type Token = SourceRange & {
  type: TokenType;
  value: string;
};

/** Chamada `Nome();`. O intervalo vai do início do nome até depois do `;`. */
export type FunctionCallNode = SourceRange & {
  type: 'FunctionCall';
  name: string;
};

export type DiagnosticCode =
  | 'unknownFunction'
  | 'missingParens'
  | 'unclosedParen'
  | 'missingSemicolon'
  | 'unclosedComment'
  | 'unexpectedToken';

/** Erro encontrado no código. `start` é a posição citada na mensagem. */
export type Diagnostic = SourceRange & {
  code: DiagnosticCode;
  message: string;
  /** Nome do catálogo mais parecido, quando `code` é `unknownFunction`. */
  suggestion?: string;
};

/** Chamadas válidas, na ordem do texto, e os erros encontrados. */
export type ValidationResult = {
  calls: FunctionCallNode[];
  errors: Diagnostic[];
};
