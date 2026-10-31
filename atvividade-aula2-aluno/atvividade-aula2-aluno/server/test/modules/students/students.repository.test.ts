import { describe, test, expect, jest } from "@jest/globals";
import { PgStudentRepository } from "../../../src/modules/students/students.repository";
import type { Database } from "../../../src/database/connection";

const normalize = (sql: string) => sql.replace(/\s+/g, " ").trim();

const makeDb = () => {
  const query = jest.fn<Database["query"]>();
  return { db: { query } as unknown as Database, query };
};
describe("PgStudentRepository", () => {
  test("create insere e retorna linha", async () => {
    const { db, query } = makeDb();
    const row = { ra: 123, name: "Ana" };
    query.mockResolvedValueOnce({ rows: [row] });
    const repo = new PgStudentRepository(db);

    const out = await repo.create({ ra: 123, name: "Ana" });

    expect(out).toBe(row);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(normalize(sql)).toBe(
      normalize("INSERT INTO students (ra, name) VALUES ($1, $2) RETURNING ra, name"),
    );
    expect(params).toEqual([123, "Ana"]);
  });

  test("findAll retorna linhas com ORDER BY name e sem parâmetros", async () => {
    const { db, query } = makeDb();
    const rows = [{ ra: 1, name: "A" }];
    query.mockResolvedValueOnce({ rows });
    const repo = new PgStudentRepository(db);

    const out = await repo.findAll();

    expect(out).toBe(rows);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(normalize(sql)).toBe(
      normalize("SELECT ra, name FROM students ORDER BY name"),
    );
    expect(params).toBeUndefined();
  });

  test("findAll com rows vazias devolve []", async () => {
    const { db, query } = makeDb();
    query.mockResolvedValueOnce({ rows: [] });
    const repo = new PgStudentRepository(db);
    await expect(repo.findAll()).resolves.toEqual([]);
  });

  test("findOne(123) filtra por ra = $1", async () => {
    const { db, query } = makeDb();
    const row = { ra: 123, name: "Ana" };
    query.mockResolvedValueOnce({ rows: [row] });
    const repo = new PgStudentRepository(db);

    const out = await repo.findOne(123);

    expect(out).toBe(row);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(normalize(sql)).toBe(
      normalize("SELECT ra, name FROM students WHERE ra = $1"),
    );
    expect(params).toEqual([123]);
  });

  test("findOne sem linhas retorna undefined", async () => {
    const { db, query } = makeDb();
    query.mockResolvedValueOnce({ rows: [] });
    const repo = new PgStudentRepository(db);
    await expect(repo.findOne(1)).resolves.toBeUndefined();
  });

  test("create propaga erro do banco", async () => {
    const { db, query } = makeDb();
    const err = new Error("db fail");
    query.mockRejectedValueOnce(err);
    const repo = new PgStudentRepository(db);
    await expect(repo.create({ ra: 1, name: "A" })).rejects.toBe(err);
  });

  test("findAll propaga erro do banco", async () => {
    const { db, query } = makeDb();
    const err = new Error("db fail");
    query.mockRejectedValueOnce(err);
    const repo = new PgStudentRepository(db);
    await expect(repo.findAll()).rejects.toBe(err);
  });

  test("findOne propaga erro do banco", async () => {
    const { db, query } = makeDb();
    const err = new Error("db fail");
    query.mockRejectedValueOnce(err);
    const repo = new PgStudentRepository(db);
    await expect(repo.findOne(1)).rejects.toBe(err);
  });
});