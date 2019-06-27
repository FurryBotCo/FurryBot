import FurryBot from "@src/main";
import ExtendedMessage from "@src/modules/extended/ExtendedMessage";
import { Message } from "eris";

class MessageCollector {
	collectors: {
		[str: string]: {
			resolve: Function,
			filter: Function
		}
	};
	constructor(bot: FurryBot) {
		this.collectors = {};

		bot.on("messageCreate", this.verify.bind(this));
	}

	async verify(msg: ExtendedMessage | Message) {
		const collector = this.collectors[`${msg.channel.id}-${msg.author.id}`];
		if (collector && collector.filter(msg)) {
			collector.resolve(msg);
		}
	}

	awaitMessage(channelId: string, userId: string, timeout: number, filter: Function = () => true): Promise<Message> {
		return new Promise(resolve => {
			if (this.collectors[`${channelId}-${userId}`]) {
				delete this.collectors[`${channelId}-${userId}`];
			}

			this.collectors[`${channelId}-${userId}`] = { resolve, filter };

			setTimeout(resolve.bind(null, false), timeout);
		});
	}
};

export default MessageCollector;