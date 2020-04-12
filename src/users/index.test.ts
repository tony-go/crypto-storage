import { createTestServer } from "../utils/testUtils";
import { createTestClient } from "apollo-server-testing";
import { gql } from "apollo-server";

describe("user module", () => {
  const db = {
    user: jest.fn(),
    users: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };
  const context = () => ({
    db,
  });
  const server = createTestServer(context);
  const { query } = createTestClient(server as any);

  it("users query should use db.users()", async () => {
    const initialCallCount = db.users.mock.calls.length;
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
    `,
    });
    expect(db.users.mock.calls.length).toEqual(initialCallCount + 1);
  });

  it("query user should call db.user()", async () => {
    const id = "2";
    const initialCallCount = db.user.mock.calls.length;
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
        id,
      },
    });
    expect(db.user).toHaveBeenCalledWith({ id });
    expect(db.user.mock.calls.length).toEqual(initialCallCount + 1);
  });
});
