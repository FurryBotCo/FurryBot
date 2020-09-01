import Eris from "eris";

Object.defineProperty(Eris.User.prototype, "tag", {
	get() { return `${this.username}#${this.discriminator}`; }
});

Object.defineProperty(Eris.Member.prototype, "tag", {
	get() { return `${this.username}#${this.discriminator}`; }
});
