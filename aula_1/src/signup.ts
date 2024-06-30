import crypto from "crypto";
import pgp from "pg-promise";
import { validateCpf } from "./validateCpf";

const ERRCODES = {
  ALREADY_EXISTS: -4,
  INVALID_NAME: -3,
  INVALID_EMAIL: -2,
  INVALID_CPF: -1,
  INVALID_CAR_PLATE: -5,
} as const;

type ErroCodeValues = (typeof ERRCODES)[keyof typeof ERRCODES];

type SignUpInput = {
  name: string;
  email: string;
  cpf: string;
  carPlate?: string;
  isDriver?: boolean;
  isPassenger?: boolean;
};

type SignUpResponse = { accountId: string };

export async function signup(
  input: SignUpInput
): Promise<SignUpResponse | ErroCodeValues | undefined> {
  const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
  try {
    const [accountFound] = await connection.query(
      "select * from cccat17.account where email = $1",
      [input.email]
    );

    if (accountFound) return ERRCODES.ALREADY_EXISTS;
    if (!input.name.match(/[a-zA-Z] [a-zA-Z]+/)) return ERRCODES.INVALID_NAME;
    if (!input.email.match(/^(.+)@(.+)$/)) return ERRCODES.INVALID_EMAIL;
    if (!validateCpf(input.cpf)) return ERRCODES.INVALID_CPF;
    if (input.isDriver === true && !input.carPlate?.match(/[A-Z]{3}[0-9]{4}/)) {
      return ERRCODES.INVALID_CAR_PLATE;
    }

    const id = crypto.randomUUID();

    await connection.query(
      "insert into cccat17.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)",
      [
        id,
        input.name,
        input.email,
        input.cpf,
        input.carPlate,
        !!input.isPassenger,
        !!input.isDriver,
      ]
    );

    return {
      accountId: id,
    };
  } catch (e) {
    console.error(e);
  } finally {
    await connection.$pool.end();
  }
}
