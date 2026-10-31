import { describe, test, expect } from "@jest/globals";
import { isUniqueViolation } from "../../src/database/unique-violation";


describe("isUniqueViolation", () => {
  test('retorna true para { code: "23505" }', () => {
    expect(isUniqueViolation({ code: "23505" })).toBe(true);
  });

  test.each([null, undefined, "23505", 23503, {}, { code: "outro" }])(
    "retorna false para %p",
    (v) => {
      expect(isUniqueViolation(v)).toBe(false);
    },
  );
});