import { describe, test, expect } from "@jest/globals";
import { HttpError } from "../src/errors";
import {
  positiveInteger,
  parseId,
  validateName,
  validateBody,
} from "../src/validation";

const expect400 = (fn: () => unknown) => {
  expect(fn).toThrow(HttpError);
  expect(fn).toThrow(expect.objectContaining({ statusCode: 400 }));
};

describe("positiveInteger", () => {
  test.each([1, 2147483647])("aceita %p (limite permitido)", (v) => {
    expect(positiveInteger(v, "RA")).toBe(v);
  });

  test.each([0, -1, 1.5, NaN, Infinity, 2147483648, "123", null, undefined])(
    "rejeita %p com 400",
    (v) => {
      expect400(() => positiveInteger(v, "RA"));
    },
  );
});

describe("parseId", () => {
  test.each([
    ["1", 1],
    ["2147483647", 2147483647],
  ])("converte %p em %p", (input, expected) => {
    expect(parseId(input, "RA")).toBe(expected);
  });

  test.each(["1abc", "1.2", "1e2", "", "-1", "0", "2147483648", 123])(
    "rejeita %p com 400",
    (v) => {
      expect400(() => parseId(v, "RA"));
    },
  );
});

describe("validateName", () => {
  const longName = "a".repeat(100);

  test.each(["Ana", longName])("aceita %p", (v) => {
    expect(validateName(v)).toBe(v);
  });

  test.each(["", "ab", "   ", " a ", "a".repeat(101), 123, null, undefined])(
    "rejeita %p com 400",
    (v) => {
      expect400(() => validateName(v));
    },
  );
});

describe("validateBody", () => {
  test("retorna a mesma referência de objeto congelado", () => {
    const input = Object.freeze({ name: "Ana" });
    const out = validateBody(input);
    expect(out).toBe(input);
    expect(Object.isFrozen(out)).toBe(true);
  });

  test.each([null, undefined, [], "Ana", 12])("rejeita %p com 400", (v) => {
    expect400(() => validateBody(v));
  });

  test("aceita campos extras e retorna a mesma referência", () => {
    const input = { name: "Ana", extra: true };
    const out = validateBody(input);
    expect(out).toBe(input);
    expect(out).toEqual({ name: "Ana", extra: true });
  });
});