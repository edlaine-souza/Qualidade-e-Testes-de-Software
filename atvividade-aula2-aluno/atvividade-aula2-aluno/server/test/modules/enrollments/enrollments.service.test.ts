import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { EnrollmentsService } from "../../../src/modules/enrollments/enrollments.service";
import type { EnrollmentRepository } from "../../../src/modules/enrollments/enrollments.repository";


const enrolledAt = new Date("2026-01-01T00:00:00Z");

const makeRepo = () =>
  ({
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  }) as unknown as jest.Mocked<EnrollmentRepository>;

describe("EnrollmentsService", () => {
  let repository: jest.Mocked<EnrollmentRepository>;
  let service: EnrollmentsService;

  beforeEach(() => {
    repository = makeRepo();
    service = new EnrollmentsService(repository);
  });

  test("cria matrícula válida com argumentos separados", async () => {
    const created = { studentRa: 123, courseId: 1, enrolledAt };
    repository.create.mockResolvedValueOnce(created);
    const out = await service.create({ studentRa: 123, courseId: 1 });
    expect(out).toBe(created);
    expect(repository.create).toHaveBeenCalledWith(123, 1);
    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  test.each([
    { studentRa: 0, courseId: 1 },
    { studentRa: 123, courseId: 0 },
  ])("chave inválida %p resulta em 400 sem chamar create", async (input) => {
    await expect(service.create(input)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(repository.create).not.toHaveBeenCalled();
  });

  test("violação de FK resulta em 404", async () => {
    repository.create.mockRejectedValueOnce({ code: "23503" });
    await expect(
      service.create({ studentRa: 1, courseId: 1 }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test("violação de unicidade resulta em 409", async () => {
    repository.create.mockRejectedValueOnce({ code: "23505" });
    await expect(
      service.create({ studentRa: 1, courseId: 1 }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  test("findOne sem registro lança 404 e encaminha ids na ordem", async () => {
    repository.findOne.mockResolvedValueOnce(undefined);
    await expect(service.findOne(123, 1)).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(repository.findOne).toHaveBeenCalledWith(123, 1);
  });

  test("falha inesperada na criação propaga a mesma instância", async () => {
    const err = new Error("boom");
    repository.create.mockRejectedValueOnce(err);
    await expect(
      service.create({ studentRa: 1, courseId: 1 }),
    ).rejects.toBe(err);
  });

  test("findAll devolve lista e chama repositório uma vez sem argumentos", async () => {
    const list = [{ studentRa: 1, courseId: 2, enrolledAt }];
    repository.findAll.mockResolvedValueOnce(list);
    const out = await service.findAll();
    expect(out).toBe(list);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith();
  });

  test("findOne(123, 1) encontra e encaminha ambos os ids", async () => {
    const found = { studentRa: 123, courseId: 1, enrolledAt };
    repository.findOne.mockResolvedValueOnce(found);
    const out = await service.findOne(123, 1);
    expect(out).toBe(found);
    expect(repository.findOne).toHaveBeenCalledTimes(1);
    expect(repository.findOne).toHaveBeenCalledWith(123, 1);
  });
});