import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";

import { createTestServer } from "../utils/testUtils";

jest.mock("bcrypt", () => ({
  hash: jest.fn(() => Promise.resolve("xxxxx")),
  compare: jest.fn(() => Promise.resolve(true))
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "token")
}));

describe("Auth module", () => {
  let db = {
    createUser: jest.fn((args) => Promise.resolve({ ...args})),
    user: jest.fn((args) => Promise.resolve({ ...args}))
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

      expect(bcrypt.hash).toHaveBeenCalled();
      expect(db.createUser).toHaveBeenCalled();
      expect(sign).toHaveBeenCalled();
      expect(res?.data?.signIn?.token).toBeTruthy();
      expect(res?.data?.signIn?.user).toBeTruthy();
    });

    it('signUp mutation should call db.user(), compare, sign', async () => {
      const res = await mutate({
        mutation: gql`
          mutation SignUp($input: SignUpInput!) {
            signUp(input: $input) {
              token
              user {
                email
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
      })

      expect(db.user).toHaveBeenCalled()
      expect(bcrypt.compare).toHaveBeenCalled()
      expect(sign).toHaveBeenCalled()
      expect(res?.data?.signUp?.token).toBeTruthy();
      expect(res?.data?.signUp?.user).toBeTruthy();
    })
    
    it('should signUp mutation result contains an error when user doesn\'t exist', async () => {
      db.user.mockImplementationOnce(() => Promise.resolve(undefined))

       const res = await mutate({
          mutation: gql`
            mutation SignUp($input: SignUpInput!) {
              signUp(input: $input) {
                token
                user {
                  email
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
        })

        expect(res?.errors?.length).toBeTruthy()
        expect(res?.data?.signUp).toBeFalsy()
    })

    it('should signUp mutation result contains an error when password is not valid', async () => {
      jest.spyOn(bcrypt, 'compare')
        .mockImplementationOnce(() => Promise.resolve(false))

      const res = await mutate({
        mutation: gql`
          mutation SignUp($input: SignUpInput!) {
            signUp(input: $input) {
              token
              user {
                email
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
      })

      expect(res?.errors?.length).toBeTruthy()
      expect(res?.data?.signUp).toBeFalsy()
    })
  });
});
