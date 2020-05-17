import getContext, { getUser } from "./context";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(() => ({
    firstName: "tony"
  })),
}));

jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(function() {}),
}));

describe("context module", () => {
  describe("getUser", () => {
    it("should call verify", () => {
      const token = "token";
      const res = getUser(token);
      
      expect(res?.firstName).toBeTruthy()
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
