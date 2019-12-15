import ClientEvent from "../util/ClientEvent";
import { Logger } from "clustersv2";
import FurryBot from "@FurryBot";
import * as Eris from "eris";
import config from "../config";
import { db } from "../modules/Database";

export default new ClientEvent("userUpdate", (async function (this: FurryBot, user: Eris.User, oldUser: { username: string; discriminator: string; avatar?: string; }) {
	this.increment([
		"events.userUpdate"
	]);
}));
