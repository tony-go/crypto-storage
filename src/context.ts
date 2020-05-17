import { verify } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

import { IUser } from "./users/types";
import { secretKey } from "./auth";

export interface IContext {
  db: PrismaClient;
  user: null | IUser;
}

export function getUser(token: string): null | IUser {
  if (!token) {
    return null;
  }
  return verify(token, secretKey) as IUser;
}

const db = new PrismaClient();

export default ({ req }: any): IContext => {
  const token = req.headers.authorization || "";

  return {
    db,
    user: getUser(token),
  };
};
