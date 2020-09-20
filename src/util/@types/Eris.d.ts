import Eris, { Client } from "eris";

declare module "eris" {
	export interface Permission {
		has(permission: ErisPermissions): boolean;
	}

	interface User {
		/**
		 * combination of Username#discriminator
		 * @type {string}
		 * @memberof User
		 */
		readonly tag: string;
	}

	interface Member {
		/**
		 * combination of Username#discriminator
		 * @type {string}
		 * @memberof User
		 */
		readonly tag: string;
	}

	interface Guild {
		/**
		 * The client's Member instance in the guild
		 * @type {Member}
		 * @memberof Guild
		 */
		readonly me: Member;
		/**
		 * The client instance (should NOT be used, but we have to here)
		 * @type {Client}
		 * @memberof Guild
		 */
		_client: Client;
	}
}
