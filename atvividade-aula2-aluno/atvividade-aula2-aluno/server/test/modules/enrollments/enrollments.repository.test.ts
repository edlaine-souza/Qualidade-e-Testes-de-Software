import { describe, test, expect, jest } from "@jest/globals";
import { PgEnrollmentRepository } from "../../../src/modules/enrollments/enrollments.repository";
import type { Database } from "../../../src/database/connection";

const normalize = (sql: string) => sql.replace(/\s+/g, " ").trim();

const makeDb = () => {
  const query = jest.fn<Database["query"]>();
  return { db: { query } as unknown as Database, query };
};

const enrolledAt = new Date("2026-01-01T00:00:00Z");

describe("PgEnrollmentRepository", () => {
  test("create insere studentRa e courseId com aliases camelCase", async () => {
    const { db, query } = makeDb();
    const row = { studentRa: 123, courseId: 7, enrolledAt };
    query.mockResolvedValueOnce({ rows: [row] });
    const repo = new PgEnrollmentRepository(db);

    const out = await repo.create(123, 7);

    expect(out).toBe(row);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    const n = normalize(sql);
    expect(n).toContain("INSERT INTO enrollments (student_ra, course_id)");
    expect(n).toContain("VALUES ($1, $2)");
    expect(n).toContain('RETURNING student_ra AS "studentRa"');
    expect(n).toContain('course_id AS "courseId"');
    expect(n).toContain('enrolled_at AS "enrolledAt"');
    expect(params).toEqual([123, 7]);
  });

  test("findAll retorna linhas com ORDER BY student_ra, course_id", async () => {
    const { db, query } = makeDb();
    const rows = [{ studentRa: 1, courseId: 2, enrolledAt }];
    query.mockResolvedValueOnce({ rows });
    const repo = new PgEnrollmentRepository(db);

    const out = await repo.findAll();

    expect(out).toBe(rows);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    const n = normalize(sql);
    expect(n).toContain('SELECT student_ra AS "studentRa"');
    expect(n).toContain('course_id AS "courseId"');
    expect(n).toContain('enrolled_at AS "enrolledAt"');
    expect(n).toContain("FROM enrollments ORDER BY student_ra, course_id");
    expect(params).toBeUndefined();
  });

  test("findAll com rows vazias devolve []", async () => {
    const { db, query } = makeDb();
    query.mockResolvedValueOnce({ rows: [] });
    const repo = new PgEnrollmentRepository(db);
    await expect(repo.findAll()).resolves.toEqual([]);
  });

  test("findOne(123, 7) filtra por student_ra e course_id", async () => {
    const { db, query } = makeDb();
    const row = { studentRa: 123, courseId: 7, enrolledAt };
    query.mockResolvedValueOnce({ rows: [row] });
    const repo = new PgEnrollmentRepository(db);

    const out = await repo.findOne(123, 7);

    expect(out).toBe(row);
    expect(query).toHaveBeenCalledTimes(1);
    const [sql, params] = query.mock.calls[0];
    const n = normalize(sql);
    expect(n).toContain("WHERE student_ra = $1 AND course_id = $2");
    expect(params).toEqual([123, 7]);
  });

  test("findOne sem linhas retorna undefined", async () => {
    const { db, query } = makeDb();
    query.mockResolvedValueOnce({ rows: [] });
    const repo = new PgEnrollmentRepository(db);
    await expect(repo.findOne(1, 1)).resolves.toBeUndefined();
  });

  test("create propaga erro do banco", async () => {
    const { db, query } = makeDb();
    const err = new Error("db fail");
    query.mockRejectedValueOnce(err);
    const repo = new PgEnrollmentRepository(db);
    await expect(repo.create(1, 1)).rejects.toBe(err);
  });

  test("findAll propaga erro do banco", async () => {
    const { db, query } = makeDb();
    const err = new Error("db fail");
    query.mockRejectedValueOnce(err);
    const repo = new PgEnrollmentRepository(db);
    await expect(repo.findAll()).rejects.toBe(err);
  });

  test("findOne propaga erro do banco", async () => {
    const { db, query } = makeDb();
    const err = new Error("db fail");
    query.mockRejectedValueOnce(err);
    const repo = new PgEnrollmentRepository(db);
    await expect(repo.findOne(1, 1)).rejects.toBe(err);
  });
});