const queryMock = jest.fn();

jest.mock("crypto", () => ({ randomUUID: () => 1 }));
jest.mock("pg-promise", () =>
  jest.fn().mockImplementation(() => () => ({
    $pool: { end: jest.fn() },
    query: () => queryMock(),
  }))
);

import { signup } from "../src/signup";

describe("Sign up test", () => {
  it("should return -4 when user already exists", () => {
    queryMock.mockResolvedValueOnce([{ email: "a@b.com" }]);

    const result = signup({ name: "", email: "", cpf: "" });

    expect(result).resolves.toBe(-4);
  });

  it("should return -3 when input name is invalid", () => {
    queryMock.mockResolvedValueOnce([null]);

    const result = signup({ name: "", email: "", cpf: "" });

    expect(result).resolves.toBe(-3);
  });

  it("should return -2 when input email is invalid", () => {
    queryMock.mockResolvedValueOnce([null]);

    const result = signup({ name: "John do", email: "", cpf: "" });

    expect(result).resolves.toBe(-2);
  });

  it("should return -1 when input CPF is invalid", () => {
    queryMock.mockResolvedValueOnce([null]);

    const result = signup({
      name: "john do",
      email: "john@do.com",
      cpf: "00000000000",
    });

    expect(result).resolves.toBe(-1);
  });

  it("should return -5 when is driver but has invalid car platt", () => {
    queryMock.mockResolvedValueOnce([null]);

    const result = signup({
      name: "john do",
      email: "john@do.com",
      cpf: "12201646074",
      isDriver: true,
      carPlate: "0000",
    });

    expect(result).resolves.toBe(-5);
  });

  it("should return user when input is valid (driver case)", () => {
    queryMock.mockResolvedValueOnce([null]);

    const input = {
      isDriver: true,
      name: "john do",
      email: "john@do.com",
      cpf: "12201646074",
      carPlate: "ABC1234",
    };
    const result = signup(input);

    expect(result).resolves.toEqual({ accountId: 1 });
  });

  it("should return user when input is valid (passenger case)", () => {
    queryMock.mockResolvedValueOnce([null]);

    const input = {
      isPassenger: true,
      name: "john do",
      email: "john@do.com",
      cpf: "12201646074",
    };

    const result = signup(input);

    expect(result).resolves.toEqual({ accountId: 1 });
  });
});
