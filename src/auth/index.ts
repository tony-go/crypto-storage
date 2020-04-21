import { gql } from "apollo-server";
import { Parent } from "../types";
import { IContext } from "../context";
import { hash } from "bcrypt";
import { sign } from "jsonwebtoken";

export const authTypeDefs = gql`
  input SignInInput {
    email: String
    password: String
  }

  type SignInOutput {
    user: User
    token: String
  }

  extend type Mutation {
    signIn(input: SignInInput!): SignInOutput
  }
`;

interface ISignInInput {
  input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    genre: "MALE" | "FEMALE";
  };
}

export const secretKey = "salut les copains";

export const authResolvers = {
  Mutation: {
    signIn: async (
      parent: Parent,
      { input }: ISignInInput,
      { db }: IContext
    ) => {
      input.password = await hash(input.password, 10);
      const user = await db.createUser(input);

      return {
        token: sign(user, secretKey, { expiresIn: "30d" }),
        user
      };
    }
  }
};
