import { describe, expect, it } from 'vitest';
import { highlightCpp } from './highlightCpp';

function typeOf(code: string, text: string) {
  return highlightCpp(code).find((token) => token.text.includes(text))?.type;
}

describe('highlightCpp', () => {
  const code = '// motor\n#include <Servo.h>\nvoid Andar() {\n  analogWrite(5, 128);\n  digitalWrite(6, HIGH);\n  Serial.println("oi");\n}';

  it('classifica comentário, preprocessador, tipo, número, constante e string', () => {
    expect(typeOf(code, '// motor')).toBe('comment');
    expect(typeOf(code, '#include')).toBe('preprocessor');
    expect(typeOf(code, 'void')).toBe('type');
    expect(typeOf(code, '128')).toBe('number');
    expect(typeOf(code, 'HIGH')).toBe('constant');
    expect(typeOf(code, '"oi"')).toBe('string');
  });

  it('preserva o texto original ao juntar os tokens', () => {
    expect(highlightCpp(code).map((token) => token.text).join('')).toBe(code);
  });
});
