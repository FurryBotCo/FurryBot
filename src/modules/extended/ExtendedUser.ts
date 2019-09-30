import * as Eris from "eris";

class ExtendedUser extends Eris.User {
	tag: string;
	// dmChannel: Eris.PrivateChannel;
	constructor(data, client) {
		super(data, client);
	}
}

export default ExtendedUser;
