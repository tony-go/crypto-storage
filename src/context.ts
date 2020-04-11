import { prisma, Prisma } from "./generated/prisma-client";

export interface IContext {
  db: Prisma;
  user?: object;
}

export default (): IContext => ({
  db: prisma,
});
