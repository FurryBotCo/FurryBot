/// <reference path="./@types/MonkeyPatch.d.ts" />
import Eris from "eris";
import Utility from "./Functions/Utility";

Object.defineProperty(Eris.User.prototype, "tag", {
	get(this: Eris.User) { return `${this.username}#${this.discriminator}`; }
});

Object.defineProperty(Eris.Member.prototype, "tag", {
	get(this: Eris.Member) { return `${this.username}#${this.discriminator}`; }
});

Object.defineProperty(Eris.Guild.prototype, "me", {
	get(this: Eris.Guild) { return this.members.get(this._client.user.id); }
});

Object.defineProperty(Eris.Guild.prototype, "owner", {
	get(this: Eris.Guild) { return this.members.get(this.ownerID); }
});

Object.defineProperty(Function.prototype, "owo", {
	get(this: Function["prototype"]) {
		return Utility.callFunction.bind(Utility, this);
	}
});
