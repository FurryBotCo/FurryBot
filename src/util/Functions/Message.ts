import FurryBot from "../../main";

export default class Message {
	private constructor() {
		throw new TypeError("This class may not be instantiated, use static methods.");
	}
	static parseDashedArgs<V extends { [k: string]: string; } = { [k: string]: string; }>(originalArgs: string[], originalUnparsedArgs?: string[]): {
		[k in "parsed" | "unparsed"]: {
			keyValue: V;
			value: (V extends { [k: string]: string; } ? keyof V : string[])[];
			args: string[];
		}
	} {
		function d(args: string[]) {
			const keyValue = {};
			const value = [];
			const rm = [];


			args.map(a => a.startsWith("--") ? (() => {
				const b = a.split("=");
				if (!b[1]) (value.push(b[0].slice(2)), rm.push(a));
				else (keyValue[b[0].slice(2)] = b[1], rm.push(a));
			})() : a.startsWith("-") ? (value.push(a.slice(1)), rm.push(a)) : null);

			rm.map(r => args.splice(args.indexOf(r)));

			return {
				keyValue,
				value,
				args
			};
		}

		return {
			parsed: d([...originalArgs]),
			unparsed: d(originalUnparsedArgs && originalUnparsedArgs.length > 0 ? [...originalUnparsedArgs] : [...originalArgs])
		} as any;
	}

	static parseArgs(content: string, prefix: string) {
		try {
			return content.slice(prefix.length).trim().match(/[^\s"]+|"[^"]+"/g).map(s => s.replace(/\"/g, "")).slice(1); // eslint-disable-line no-useless-escape
		} catch (e) {
			try {
				return content.slice(prefix.length).trim().split(/\s/).slice(1);
			} catch (e) {
				return [];
			}
		}
	}

	static parseCmd(content: string, prefix: string, client: FurryBot) {
		try {
			if (!content || !prefix || !content.toLowerCase().startsWith(prefix.toLowerCase())) return null;
			const t = content.slice(prefix.length).trim().match(/[^\s"]+|"[^"]+"/g).map(s => s.replace(/\"/g, ""))[0].toLowerCase();
			const c = client.cmd.getCommand(t);
			return c || null;
		} catch (e) {
			client.log("error", `Error parsing command:`, "Message Parse");
			client.log("error", e, "Message Parse");
			return null;
		}
	}
}
