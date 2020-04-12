import merge from "lodash/fp/merge";

import { userResolvers } from "./users";
import { listResolvers } from "./lists";

export default merge(userResolvers, listResolvers);
