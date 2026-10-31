import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { StudentsService } from "../../../src/modules/students/students.service";
import type { StudentRepository } from "../../../src/modules/students/students.repository";
// ... resto igual

const makeRepo = () =>
  ({
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  }) as unknown as jest.Mocked<StudentRepository>;

describe("StudentsService", () => {
  let repository: jest.Mocked<StudentRepository>;
  let service: StudentsService;

  beforeEach(() => {
    repository = makeRepo();
    service = new StudentsService(repository);
  });

  test("cria estudante válido e encaminha os dados", async () => {
    const created = { ra: 123, name: "Ana" };
    repository.create.mockResolvedValueOnce(created);
    const out = await service.create({ ra: 123, name: "Ana" });
    expect(out).toBe(created);
    expect(repository.create).toHaveBeenCalledWith({ ra: 123, name: "Ana" });
    expect(repository.create).toHaveBeenCalledTimes(1);
  });

  test("RA inválido lança 400 e não chama create", async () => {
    await expect(
      service.create({ ra: 0, name: "Ana" }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(repository.create).not.toHaveBeenCalled();
  });

  test("RA duplicado resulta em 409", async () => {
    repository.create.mockRejectedValueOnce({ code: "23505" });
    await expect(
      service.create({ ra: 123, name: "Ana" }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  test("findOne sem registro lança 404", async () => {
    repository.findOne.mockResolvedValueOnce(undefined);
    await expect(service.findOne(123)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test("falha inesperada na criação propaga a mesma instância", async () => {
    const err = new Error("boom");
    repository.create.mockRejectedValueOnce(err);
    await expect(service.create({ ra: 1, name: "Ana" })).rejects.toBe(err);
  });

  test("findAll devolve lista e chama repositório uma vez sem argumentos", async () => {
    const list = [{ ra: 1, name: "A" }];
    repository.findAll.mockResolvedValueOnce(list);
    const out = await service.findAll();
    expect(out).toBe(list);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
    expect(repository.findAll).toHaveBeenCalledWith();
  });

  test("findOne(123) encontra e encaminha o RA", async () => {
    const found = { ra: 123, name: "Ana" };
    repository.findOne.mockResolvedValueOnce(found);
    const out = await service.findOne(123);
    expect(out).toBe(found);
    expect(repository.findOne).toHaveBeenCalledTimes(1);
    expect(repository.findOne).toHaveBeenCalledWith(123);
  });
});