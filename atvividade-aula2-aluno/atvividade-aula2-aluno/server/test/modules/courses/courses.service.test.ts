import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import { CoursesService } from "../../../src/modules/courses/courses.service";
import type { CourseRepository } from "../../../src/modules/courses/courses.repository";

const makeRepo = () =>
  ({
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  }) as unknown as jest.Mocked<CourseRepository>;

describe("CoursesService", () => {
  let repository: jest.Mocked<CourseRepository>;
  let service: CoursesService;

  beforeEach(() => {
    repository = makeRepo();
    service = new CoursesService(repository);
  });

  test("cria curso válido e chama repository.create uma vez", async () => {
    const created = { id: 7, name: "Qualidade" };
    repository.create.mockResolvedValueOnce(created);
    const out = await service.create({ name: "Qualidade" });
    expect(out).toBe(created);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith({ name: "Qualidade" });
  });

  test.each([null, {}, { name: "A" }])(
    "rejeita criação inválida com 400 (%p)",
    async (input) => {
      await expect(service.create(input)).rejects.toMatchObject({
        statusCode: 400,
      });
      expect(repository.create).not.toHaveBeenCalled();
    },
  );

  test("nome duplicado resulta em 409", async () => {
    repository.create.mockRejectedValueOnce({ code: "23505" });
    await expect(service.create({ name: "Qualidade" })).rejects.toMatchObject({
      statusCode: 409,
    });
  });

  test("findAll delega ao repositório (stub + mock)", async () => {
    const list = [{ id: 1, name: "A" }];
    repository.findAll.mockResolvedValueOnce(list);
    const out = await service.findAll();
    expect(out).toBe(list);
    expect(repository.findAll).toHaveBeenCalledTimes(1);
  });

  test("findOne(123) encontra registro e encaminha o id", async () => {
    const found = { id: 123, name: "X" };
    repository.findOne.mockResolvedValueOnce(found);
    const out = await service.findOne(123);
    expect(out).toBe(found);
    expect(repository.findOne).toHaveBeenCalledWith(123);
  });

  test("findOne(123) sem registro lança 404", async () => {
    repository.findOne.mockResolvedValueOnce(undefined);
    await expect(service.findOne(123)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  test("findOne(0) lança 400 e não consulta repositório", async () => {
    await expect(service.findOne(0)).rejects.toMatchObject({
      statusCode: 400,
    });
    expect(repository.findOne).not.toHaveBeenCalled();
  });

  test("create propaga a mesma instância de erro inesperado", async () => {
    const err = new Error("boom");
    repository.create.mockRejectedValueOnce(err);
    await expect(service.create({ name: "Qualidade" })).rejects.toBe(err);
  });

  test("findAll propaga a mesma instância de erro inesperado", async () => {
    const err = new Error("boom");
    repository.findAll.mockRejectedValueOnce(err);
    await expect(service.findAll()).rejects.toBe(err);
  });

  test("findOne propaga a mesma instância de erro inesperado", async () => {
    const err = new Error("boom");
    repository.findOne.mockRejectedValueOnce(err);
    await expect(service.findOne(1)).rejects.toBe(err);
  });

  test("spy observa findOne de um objeto existente", async () => {
    const stub = makeRepo();
    stub.findOne.mockResolvedValueOnce({ id: 1, name: "Spy" });
    const spy = jest.spyOn(stub, "findOne");
    const svc = new CoursesService(stub);
    const out = await svc.findOne(1);
    expect(out).toEqual({ id: 1, name: "Spy" });
    expect(spy).toHaveBeenCalledWith(1);
  });

  test("campos extras são removidos antes de enviar ao repositório", async () => {
    repository.create.mockResolvedValueOnce({ id: 1, name: "Qualidade" });
    await service.create({ name: "Qualidade", extra: true });
    expect(repository.create).toHaveBeenCalledWith({ name: "Qualidade" });
  });
});