import * as Eris from "eris";

class ExtendedTextChannel extends Eris.TextChannel {
	furpile: {
		active: boolean,
		inPile: string[],
		timeout: NodeJS.Timeout,
		member: Eris.Member | Eris.User | null
	};
	conga: {
		active: boolean,
		inConga: string[],
		timeout: NodeJS.Timeout,
		member: Eris.Member | Eris.User | null
	};
	awoo: {
		active: boolean,
		inAwoo: string[],
		timeout: NodeJS.Timeout
	};
	// typescript seems to think this doesn't exist, though it is documented,
	// https://abal.moe/Eris/docs/TextChannel#function-deleteMessages
	deleteMessages: (messages: string[]) => Promise<void>;
	constructor(data, guild, messageLimit) {
		super(data, guild, messageLimit);
	}
}

export default ExtendedTextChannel;
