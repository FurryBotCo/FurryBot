import { Tedis } from "tedis";
import config = require("../config");

export default new Tedis(config.apis.redis);
