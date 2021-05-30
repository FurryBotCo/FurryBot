import FurryBot from "../main";
import db from "../db";
import { ClientEvent, ExtendedMessage } from "core";
import Eris, { Member } from "eris";
import { APIApplicationCommandInteractionDataOption, ApplicationCommandOptionType, GatewayInteractionCreateDispatchData, InteractionType } from "discord-api-types/v8";
import { InteractionResponseType } from "slash-commands";
// import util from "util";

function formatArg(arg: APIApplicationCommandInteractionDataOption): string {
	if ("options" in arg) return `${arg.name} ${arg.options.map(formatArg).join(" ")}`;
	switch (arg.type) {
		case ApplicationCommandOptionType.USER: return `<@!${String(arg.value)}>`;
		case ApplicationCommandOptionType.CHANNEL: return `<#${String(arg.value)}>`;
		case ApplicationCommandOptionType.ROLE: return `<@&${String(arg.value)}>`;
		default: return String(arg.value);
	}
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default new ClientEvent<FurryBot>("rawWS", async function({ op, d, s, t }) {
	if (op === 0) {
		this.trackNoResponse(
			this.sh.joinParts("stats", "events", t!)
		);
		switch (t) {
			case "MESSAGE_CREATE": {
				const msg = new ExtendedMessage(d as Eris.BaseData, this);
				this.client.emit("messageCreate", msg, false, false, undefined);
				break;
			}

			case "INTERACTION_CREATE": {
				const v = d as GatewayInteractionCreateDispatchData;
				switch (v.type) {
					case InteractionType.Ping: {
						break;
					}

					case InteractionType.ApplicationCommand: {
						await this.h.createInteractionResponse(v.id, v.token, InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE);
						const gid = this.client.channelGuildMap[v.channel_id];
						if (!gid) return;
						const guild = await this.getGuild(gid);
						if (!guild) return;
						const channel = guild.channels.get(v.channel_id);
						if (!channel) return;
						const withMember = (v as unknown as Record<"member", Member>);
						const member = guild.members.get(withMember.member.user.id);
						if (!member) return;
						this.client.users.update(member.user, withMember.member.user);
						guild.members.update(member, withMember.member);
						const g = await db.getGuild(guild.id);
						let opts: Record<string, string | number | bigint | boolean> = {};
						let args: Array<typeof opts[keyof typeof opts]> = [];
						if (v.data.options) {
							opts = v.data.options.map(o => !("value" in o) ? undefined : ({ [o.name]: o.value })).filter(Boolean).reduce((a,b) => ({ ...a,...b }), {})!;
							args = v.data.options.map(formatArg);
							// for args customization
							switch (v.data.name) {
								case "bugreport": case "suggest": args = args.join(" | ").split(" "); break;
								case "ban": case "mute": if (opts.time) args = `${args.join(" ").replace(new RegExp(String(opts.time)), "")} | ${String(opts.time)}`.split(" ").filter(Boolean); break;
								case "makeinv": {
									args = [
										Object.keys(v.data.resolved!.channels!)[0]
									];
									if (opts.temp === "true" || opts.temp === true) args.push("-t");
									if (opts.max_age) args.push(`--maxAge=${String(opts.max_age!)}`);
									if (opts.max_uses) args.push(`--maxUses=${String(opts.max_uses!)}`);
									break;
								}
								case "brain": case "crab": args = [args.join(", ")]; break;
						// case "prefix": {}
							}
						}
						const content = `${g.prefix[0]}${v.data.name} ${args.join(" ")}`.trim();
						// console.log(util.inspect(d, { depth: null, colors: true }));
						console.log("Interaction Recieved");
						console.log(`Interaction[${v.data.name}:options]`, opts);
						console.log(`Interaction[${v.data.name}:arguments]`, args);
						console.log(`Interaction[${v.data.name}:content]`, content);

						const m = new ExtendedMessage({
							// eslint-disable-next-line @typescript-eslint/ban-ts-comment
							// @ts-ignore
							id: null,
							type: 0,
							timestamp: new Date().toISOString(),
							channel_id: channel.id,
							guild_id: guild.id,
							flags: 0,
							author: {
								id: member.id,
								avatar: member.avatar,
								username: member.username,
								discriminator: member.discriminator,
								public_flags: member.user.publicFlags,
								bot: member.user.bot,
								system: member.user.system
							},
							content,
							mention_everyone: false,
							mentions: (v.data.resolved && v.data.resolved.users) ? Object.values(v.data.resolved.users).map(u => {
								const vl = this.client.users.get(u.id);
								if (vl) this.client.users.update(vl, u);
								return vl;
							}).filter(Boolean) : [],
							mention_roles: (v.data.resolved && v.data.resolved.roles) ? Object.values(v.data.resolved.roles).map(r => {
								const vl = guild.roles.get(r.id);
								if (vl) guild.roles.update(vl, r);
								return vl;
							}).filter(Boolean) : [],
							pinned: false
						}, this);

						this.client.emit("messageCreate", m, false, true, {
							id: v.id,
							token: v.token
						});
						break;
					}
				}
			}
		}
	}
});
