import Eris from "eris";
declare module "eris" {
	export interface Permission {
		has(permission: ErisPermissions): boolean;
	}

	interface User {
		/**
		 * combination of username#discriminator
		 *
		 * @type {string}
		 * @memberof User
		 */
		readonly tag: string;
	}

	interface Member {
		/**
		 * combination of username#discriminator
		 *
		 * @type {string}
		 * @memberof Member
		 */
		readonly tag: string;
	}

	interface Guild {
		/**
		 * The client's Member instance in the guild
		 *
		 * @type {Eris.Member}
		 * @memberof Guild
		 */
		readonly me: Member;
		/**
		 * The Member instance of the guild owner
		 *
		 * @type {Eris.Member}
		 * @memberof Guild
		 */
		readonly owner: Member;
		/**
		 * The client instance (should NOT be used, but we have to here)
		 *
		 * @type {Eris.Client}
		 * @memberof Guild
		 */
		_client: Client;
	}

	interface TextChannel {
		startTyping(rounds?: number): void;
		stopTyping(): void;
	}

	interface Client {
		typing: {
			[k: string]: NodeJS.Timeout;
		};
	}
}

declare global {
	interface Function {
		/**
		 * Calls the function, substituting the specified object for the this value of the function, and the specified array for the arguments of the function.
		 *
		 * @param thisArg The object to be used as the this object.
		 * @param argArray A set of arguments to be passed to the function.
		 */
		owo<F extends (...args: any) => any>(this: F, thisArg: ThisParameterType<F>, ...argArray: Parameters<F>): ReturnType<F>;
	}
}
