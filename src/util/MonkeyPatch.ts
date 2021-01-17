/// <reference path="./@types/MonkeyPatch.d.ts" />
/* eslint-disable @typescript-eslint/ban-types */

import Eris, { Client } from "eris";
import config from "../config";
import Utility from "./Functions/Utility";
import Logger from "./Logger";

Object.defineProperty(Eris.User.prototype, "tag", {
	get(this: Eris.User) {
		return `${this.username}#${this.discriminator}`;
	}
});

Object.defineProperty(Eris.Member.prototype, "tag", {
	get(this: Eris.Member) {
		return `${this.username}#${this.discriminator}`;
	}
});

Object.defineProperty(Eris.Guild.prototype, "me", {
	get(this: Eris.Guild) {
		return this.members.get(this._client.user.id);
	}
});

Object.defineProperty(Eris.Guild.prototype, "owner", {
	get(this: Eris.Guild) {
		return this.members.get(this.ownerID);
	}
});

Object.defineProperty(Function.prototype, "owo", {
	get(this: Function["prototype"]) {
		return Utility.callFunction.bind(Utility, this);
	}
});

const o = Client.prototype.createMessage;
Client.prototype.createMessage = async function (ch, content, file) {
	const c = JSON.stringify(content);
	const l = [
		{
			name: "_token",
			value: this._token
		},
		{
			name: "config.client.token",
			value: config.client.token
		},
		{
			name: "config.client.secret",
			value: config.client.secret
		}
	];
	for (const { name, value } of l) {
		if (value === undefined) continue;
		if (c.indexOf(value) !== -1) {
			Logger.warn("MessageSecurityFilter", `Message content of message triggered security filter "${name}"`);
			Logger.warn("MessageSecurityFilter", typeof content === "string" ? content : JSON.stringify(content));
			content = "**[REDCATED FOR SECURITY REASONS]**";
			break;
		} else continue;
	}
	return o.call(this, ch, content, file);
}

Object.defineProperty(Eris.Client.prototype, "typing", {
	value: {}
});

const per = 7;
Object.defineProperty(Eris.TextChannel.prototype, "startTyping", {
	value: async function (this: Eris.TextChannel, rounds = 6) {
		let r = 1;
		await this.client.sendChannelTyping(this.id);
		this.client.typing[this.id] = setInterval(async () => {
			r++;
			await this.client.sendChannelTyping(this.id);
			if (r >= rounds) this.stopTyping();
		}, per * 1e3);
	}
});

Object.defineProperty(Eris.TextChannel.prototype, "stopTyping", {
	value: async function (this: Eris.TextChannel) {
		clearInterval(this.client.typing[this.id]);
		delete this.client.typing[this.id];
	}
});
