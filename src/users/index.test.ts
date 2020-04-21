import { createTestServer } from "../utils/testUtils";
import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";
import { hash } from "bcrypt";

jest.mock("bcrypt", () => ({
  hash: jest.fn(value => value)
}));

describe("user module", () => {
  const db = {
    user: jest.fn(),
    users: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn()
  };
  const context = () => ({
    db
  });
  const server = createTestServer(context);
  const { query, mutate } = createTestClient(server as any);
  const id = "2";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("queries", () => {
    it("users query should use db.users()", async () => {
      await query({
        query: `
        {
          users {
            id
            lastName
            firstName
            genre
          }
        }
      `
      });
      expect(db.users).toHaveBeenCalled();
    });

    it("query user should call db.user()", async () => {
      await query({
        query: gql`
          query User($id: String!) {
            user(id: $id) {
              id
              lastName
            }
          }
        `,
        variables: {
          id
        }
      });
      expect(db.user).toHaveBeenCalledWith({ id });
    });
  });

  describe("mutations", () => {
    const user: any = {
      firstName: "bakate",
      lastName: "yoyo",
      password: "lol",
      email: "bakate@lo.fr",
      genre: "MALE"
    };

    it("addUser mutation should call db.createUser()", async () => {
      await mutate({
        mutation: gql`
          mutation AddUser($user: UserInput!) {
            addUser(user: $user) {
              id
            }
          }
        `,
        variables: { user }
      });

      expect(hash).toHaveBeenCalledWith(user.password, 10);
      expect(db.createUser).toHaveBeenCalledWith(user);
    });

    it("updateUser should call db.updateUser() and hash", async () => {
      await mutate({
        mutation: gql`
          mutation updateUser($user: UpdateUserInput!) {
            updateUser(user: $user) {
              id
            }
          }
        `,
        variables: {
          user: {
            ...user,
            id
          }
        }
      });

      expect(db.updateUser).toHaveBeenCalledWith({ where: { id }, data: user });
      expect(hash).toHaveBeenCalledWith(user.password, 10);
    });

    it("update user mutation should not call hash if password if not in payload", async () => {
      const partialUser = {
        firstName: "toto"
      };
      await mutate({
        mutation: gql`
          mutation UpdateUser($user: UpdateUserInput!) {
            updateUser(user: $user) {
              id
            }
          }
        `,
        variables: {
          user: {
            ...partialUser,
            id
          }
        }
      });

      expect(db.updateUser).toHaveBeenCalledWith({
        where: { id },
        data: partialUser
      });
      expect(hash).not.toHaveBeenCalled();
    });

    it("delete user mutation should call db.deleteUser()", async () => {
      await mutate({
        mutation: gql`
          mutation DeleteUser($id: String!) {
            deleteUser(id: $id) {
              id
            }
          }
        `,
        variables: { id }
      });

      expect(db.deleteUser).toHaveBeenCalledWith({ id });
    });
  });
});
