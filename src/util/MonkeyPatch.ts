/// <reference path="./@types/MonkeyPatch.d.ts" />
/* eslint-disable @typescript-eslint/ban-types */

import Eris, { Client } from "eris";
import FurryBot from "../main";
import Utility from "./Functions/Utility";

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

const o = (Client.prototype as any)._formatAllowedMentions;
(Client.prototype as any)._formatAllowedMentions = function (allowed) {
	const v = o.call(this, allowed);
	if (allowed && allowed.replied_user) v.replied_user = true;
	return v;
};
