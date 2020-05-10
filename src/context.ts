import { verify } from "jsonwebtoken";

import { IUser } from "./users/types";
import { prisma, Prisma } from "./generated/prisma-client";
import { secretKey } from "./auth";

export interface IContext {
  db: Prisma;
  user?: string | null | IUser;
}

export function getUser(token: string): null | string | IUser {
  if (!token) {
    return null;
  }
  return verify(token, secretKey) as IUser;
}

export default ({ req }: any): IContext => {
  const token = req.headers.authorization || "";

  return {
    db: prisma,
    user: getUser(token)
  };
};
