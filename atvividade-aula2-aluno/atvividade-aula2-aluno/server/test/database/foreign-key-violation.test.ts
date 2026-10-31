import { describe, test, expect } from "@jest/globals";
import { isForeignKeyViolation } from "../../src/database/foreign-key-violation";

describe("isForeignKeyViolation", () => {
  test('retorna true para { code: "23503" }', () => {
    expect(isForeignKeyViolation({ code: "23503" })).toBe(true);
  });

  test.each([null, undefined, "23505", 23503, {}, { code: "outro" }])(
    "retorna false para %p",
    (v) => {
      expect(isForeignKeyViolation(v)).toBe(false);
    },
  );
});