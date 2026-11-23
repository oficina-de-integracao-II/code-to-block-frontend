export type TokenType =
  | 'comment'
  | 'string'
  | 'preprocessor'
  | 'keyword'
  | 'type'
  | 'constant'
  | 'number'
  | 'plain';

export type Token = { type: TokenType; text: string };

const KEYWORDS = new Set([
  'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break',
  'continue', 'return', 'const', 'static', 'struct', 'class', 'enum', 'true',
  'false', 'sizeof', 'new', 'delete', 'unsigned', 'signed',
]);

const TYPES = new Set([
  'void', 'int', 'long', 'short', 'char', 'float', 'double', 'bool', 'byte',
  'boolean', 'word', 'String', 'uint8_t', 'uint16_t', 'uint32_t', 'int8_t',
  'int16_t', 'int32_t',
]);

const CONSTANTS = new Set([
  'HIGH', 'LOW', 'INPUT', 'OUTPUT', 'INPUT_PULLUP', 'LED_BUILTIN', 'NULL',
]);

const TOKEN_PATTERN = new RegExp(
  [
    '(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)', // 1 comment
    '("(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])*\')', // 2 string
    '(^[ \\t]*#[^\\n]*)', // 3 preprocessor
    '(\\b\\d+(?:\\.\\d+)?(?:[uUlLfF]*)\\b|\\b0[xX][0-9a-fA-F]+\\b)', // 4 number
    '([A-Za-z_]\\w*)', // 5 identifier
  ].join('|'),
  'gm',
);

function push(tokens: Token[], type: TokenType, text: string) {
  if (!text) return;

  const last = tokens[tokens.length - 1];

  if (last && last.type === type) {
    last.text += text;
  } else {
    tokens.push({ type, text });
  }
}

export function highlightCpp(code: string): Token[] {
  const tokens: Token[] = [];
  let cursor = 0;

  for (const match of code.matchAll(TOKEN_PATTERN)) {
    const start = match.index;

    push(tokens, 'plain', code.slice(cursor, start));

    const [text, comment, string, preprocessor, number, identifier] = match;

    if (comment) push(tokens, 'comment', text);
    else if (string) push(tokens, 'string', text);
    else if (preprocessor) push(tokens, 'preprocessor', text);
    else if (number) push(tokens, 'number', text);
    else if (identifier && KEYWORDS.has(identifier)) push(tokens, 'keyword', text);
    else if (identifier && TYPES.has(identifier)) push(tokens, 'type', text);
    else if (identifier && CONSTANTS.has(identifier)) push(tokens, 'constant', text);
    else push(tokens, 'plain', text);

    cursor = start + text.length;
  }

  push(tokens, 'plain', code.slice(cursor));

  return tokens;
}
