import { verify } from "jsonwebtoken";

import getContext, { getUser } from "./context";
import { secretKey } from "./auth";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn()
}));

jest.mock("./generated/prisma-client", () => ({
  prisma: jest.fn()
}));

describe("context module", () => {
  describe("getUser", () => {
    it("should call verify", () => {
      const token = "token";
      getUser(token);
      expect(verify).toHaveBeenCalledWith(token, secretKey);
    });

    it("should return null when string is empty", () => {
      expect(getUser("")).toEqual(null);
    });
  });

  describe("getContext", () => {
    const contextArguments = { req: { headers: { authorization: null } } };
    it("should return an object with user and db", () => {
      const context = getContext(contextArguments);
      expect(context.db).toBeTruthy();
      expect(context.user).toBeFalsy();
    });
  });
});
