declare module "botlist" {
	import { EventEmitter } from "tsee";
	export class Client extends EventEmitter<{
		beforePost: () => void;
		afterPost: (successfull: number, failed: number) => void;
		error: (error: Error) => void;
		start: (unknown: boolean) => void;
		end: (unknown: boolean) => void;
	}> {
		constructor(id: string, options: {
			tokens: {
				[k: string]: string;
			};
			interval?: number;
			verbose?: boolean;
		});

		start(callback?: (err?: Error) => void): void;
		update(serverCount: number, shards: {
			id: number;
			count: number;
		}[]): void;
		stop(callback?: (err?: Error) => void): void;
	}
}
