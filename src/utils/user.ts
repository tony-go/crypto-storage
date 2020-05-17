import { AuthenticationError, ForbiddenError } from 'apollo-server'

import { IContext } from '../context';

export const checkUserValidity = (context: IContext): void => {
  const { user } = context 
  if (!user) {
    throw new AuthenticationError(
      "You should are not authenticated"
    );
  }

  if (user?.role !== "ADMIN") {
    throw new ForbiddenError(
      "You should be log as an Admin to execute this query"
    );
  }
};
