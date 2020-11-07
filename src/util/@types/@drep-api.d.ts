declare module "@drep/api";
// I cannot figure out their js so I'll just stop trying
/*
declare module "@drep/api" {
	class DRepClient {
		endpoints: {
			[k: string]: any;
		};
		private token: string;
		readonly api: APIRouter;
		constructor(token: string);
		private init(): void;
	}

	abstract class Endpoint {
		client: DRepClient;
		constructor(client: DRepClient);
		abstract run(...args: any[]): any;
		_run(...args: any[]): Promise<any>;
		abstract serialize(...args: any[]): any;
	}


	type Proxy = any;
	function buildRouter(token: string): Proxy;
	type APIRouter = typeof buildRouter;

	interface Util {
		methods: ("get" | "post" | "delete" | "patch" | "put")[];
		reflectors: ("toString" | "toJSON" | "valueOf" | "inspect" | "constructor" | symbol)[];
		noop: () => void;
	}

	class Ban {
		moderator: string | null;
		reason: string | null;
		date: Date | null;
		constructor(data: Partial<Ban>);
	}

	class Reputation {
		upvotes: number;
		downvotes: number;
		rank: string;
		xp: number;
		staff: boolean;
		reputation: number;
		constructor(data: Partial<Reputation>);
	}

	class VoteResponse {
		status: number;
		success: boolean;
		message: string | Error;
		constructor(data: {
			code: string | number;
			message?: string;
			error?: Error;
		});
	}

	class Warn {
		moderator: string | null;
		reason: string | null;
		date: Date | null;
		constructor(data: Partial<Warn>);
	}

	class Infraction extends Endpoint {
		run(id: string): Promise<any>;
		serialize(data: any): Promise<Warn | Ban | null>;
	}

	interface Rep extends Endpoint {
		run(id: string): Promise<any>;
		serialize(data: any): Promise<Reputation>;
	}

	interface Vote extends Endpoint {
		run(action: string, voter: string, votee: string): Promise<any>;
		serialize(data: any): Promise<Reputation>;
	}

	export {
		Ban,
		Reputation,
		VoteResponse,
		Warn,
		DRepClient
	};
}

*/
