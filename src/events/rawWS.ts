import FurryBot from "../main";
import { ClientEvent, ExtendedMessage } from "core";
import Eris from "eris";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default new ClientEvent<FurryBot>("rawWS", async function({ op, d, s, t }) {
	if (op === 0) {
		this.trackNoResponse(
			this.sh.joinParts("stats", "events", t!)
		);
		switch (t) {
			case "MESSAGE_CREATE": {
				const msg = new ExtendedMessage(d as Eris.BaseData, this);
				this.bot.emit("messageCreate", msg, false, false, undefined);
			}
		}
	}
});
