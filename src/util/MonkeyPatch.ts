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
