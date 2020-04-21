import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";
import { hash } from "bcrypt";
import { sign } from "jsonwebtoken";

import { createTestServer } from "../utils/testUtils";

jest.mock("bcrypt", () => ({
  hash: jest.fn(() => Promise.resolve("xxxxx"))
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "token")
}));

describe("Auth module", () => {
  const db = {
    createUser: jest.fn((args) => Promise.resolve({ ...args}))
  };
  const context = () => ({
    db
  });
  const server = createTestServer(context);
  const { mutate } = createTestClient(server as any);

  describe("Mutation", () => {
    it("signIn mutation should call db.createUser, hash, sign", async () => {
      const res = await mutate({
        mutation: gql`
          mutation SignIn($input: SignInInput!) {
            signIn(input: $input) {
              token
              user {
                email
                password
              }
            }
          }
        `,
        variables: {
          input: {
            email: "toto@gmail.com",
            password: "password"
          }
        }
      });

      expect(hash).toHaveBeenCalled();
      expect(db.createUser).toHaveBeenCalled();
      expect(sign).toHaveBeenCalled();
      expect(res?.data?.signIn?.token).toBeTruthy();
      expect(res?.data?.signIn?.user).toBeTruthy();
    });
  });
});
