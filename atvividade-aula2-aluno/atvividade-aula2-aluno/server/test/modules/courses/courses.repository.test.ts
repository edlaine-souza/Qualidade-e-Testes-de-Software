import { describe, test, expect, jest } from "@jest/globals";
import { PgCourseRepository } from "../../../src/modules/courses/courses.repository";
import type { Database } from "../../../src/database/connection";

const normalize = (sql: string) => sql.replace(/\s+/g, " ").trim();

const makeDb = () => {
  const query = jest.fn<Database["query"]>();
  return { db: { query } as unknown as Database, query };
};

describe("PgCourseRepository", () => {
  test("create insere e retorna linha", async () => {
    const { db, query } = makeDb();
    const row = { id: 1, name: "Algoritmos" };
    query.mockResolvedValueOnce({ rows: [row] });
    const repo = new PgCourseRepository(db);

    const out = await repo.create({ name: "Algoritmos" });

    expect(out).toBe(row);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(normalize(sql)).toBe(
      normalize("INSERT INTO courses (name) VALUES ($1) RETURNING id, name"),
    );
    expect(params).toEqual(["Algoritmos"]);
  });

  test("findAll retorna linhas e envia SELECT com ORDER BY id", async () => {
    const { db, query } = makeDb();
    const rows = [
      { id: 1, name: "A" },
      { id: 2, name: "B" },
    ];
    query.mockResolvedValueOnce({ rows });
    const repo = new PgCourseRepository(db);

    const out = await repo.findAll();

    expect(out).toBe(rows);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(normalize(sql)).toBe(
      normalize("SELECT id, name FROM courses ORDER BY id"),
    );
    expect(params).toBeUndefined();
  });

  test("findAll com rows vazias devolve []", async () => {
    const { db, query } = makeDb();
    query.mockResolvedValueOnce({ rows: [] });
    const repo = new PgCourseRepository(db);
    await expect(repo.findAll()).resolves.toEqual([]);
  });

  test("findOne(7) retorna primeira linha e filtra por id = $1", async () => {
    const { db, query } = makeDb();
    const row = { id: 7, name: "X" };
    query.mockResolvedValueOnce({ rows: [row] });
    const repo = new PgCourseRepository(db);

    const out = await repo.findOne(7);

    expect(out).toBe(row);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    expect(normalize(sql)).toBe(
      normalize("SELECT id, name FROM courses WHERE id = $1"),
    );
    expect(params).toEqual([7]);
  });

  test("findOne sem linhas retorna undefined", async () => {
    const { db, query } = makeDb();
    query.mockResolvedValueOnce({ rows: [] });
    const repo = new PgCourseRepository(db);
    await expect(repo.findOne(7)).resolves.toBeUndefined();
  });

  test("create propaga erro do banco", async () => {
    const { db, query } = makeDb();
    const err = new Error("db fail");
    query.mockRejectedValueOnce(err);
    const repo = new PgCourseRepository(db);
    await expect(repo.create({ name: "A" })).rejects.toBe(err);
  });

  test("findAll propaga erro do banco", async () => {
    const { db, query } = makeDb();
    const err = new Error("db fail");
    query.mockRejectedValueOnce(err);
    const repo = new PgCourseRepository(db);
    await expect(repo.findAll()).rejects.toBe(err);
  });

  test("findOne propaga erro do banco", async () => {
    const { db, query } = makeDb();
    const err = new Error("db fail");
    query.mockRejectedValueOnce(err);
    const repo = new PgCourseRepository(db);
    await expect(repo.findOne(1)).rejects.toBe(err);
  });
});