import FurryBot from "../main";
import db from "../db";
import { ClientEvent, ExtendedMessage } from "core";
import Eris from "eris";
import { GatewayInteractionCreateDispatchData } from "discord-api-types/v8";
import { InteractionResponseType } from "slash-extras";
import util from "util";

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
				break;
			}

			case "INTERACTION_CREATE": {
				const v = d as GatewayInteractionCreateDispatchData;
				await this.h.createInteractionResponse(v.id, v.token, InteractionResponseType.ACK_WITH_SOURCE);
				const c = await this.bot.getRESTChannel(v.channel_id) as Eris.AnyGuildChannel;
				if (!c) return;
				const g = await db.getGuild(c.guild.id);
				let opts: Record<string, string | number | bigint | boolean> = {};
				let args: Array<typeof opts[keyof typeof opts]> = [];
				if (v.data.options) {
					opts = v.data.options.map(o => !("value" in o) ? undefined : ({ [o.name]: o.value })).filter(Boolean).reduce((a,b) => ({ ...a,...b }), {})!;
					args = Object.values(opts).filter((k) => k === false || Boolean(v));
					// for args customization
					switch (v.data.name) {
						case "bugreport": case "suggest": args = args.join(" | ").split(" "); break;
						case "ban": case "mute": if (opts.time) args = `${args.join(" ").replace(new RegExp(String(opts.time)), "")} | ${String(opts.time)}`.split(" ").filter(Boolean); break;
					}
				}
				const content = `${g.prefix[0]}${v.data.name} ${args.join(" ")}`.trim();
				// console.log(util.inspect(d, { depth: null, colors: true }));
				console.log("Interaction Recieved");
				console.log(`Interaction[${v.data.name}:options]`, opts);
				console.log(`Interaction[${v.data.name}:arguments]`, args);
				console.log(`Interaction[${v.data.name}:content]`, content);
				await this.h.editOriginalInteractionResponse(v.token, {
					content: "Done."
				});
			}
		}
	}
});
