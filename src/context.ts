import { prisma, Prisma } from "./generated/prisma-client";
import { verify } from "jsonwebtoken";
import { secretKey } from "./auth";

export interface IContext {
  db: Prisma;
  user?: string | null | object;
}

function getUser(token: string): string | null | object {
  if (!token) {
    return verify(token, secretKey);
  }
  return null;
}

export default ({ req }: any): IContext => {
  const token = req.headers.authorization || "";

  return {
    db: prisma,
    user: getUser(token)
  };
};
