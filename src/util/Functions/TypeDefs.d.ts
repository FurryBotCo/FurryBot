declare namespace TypeDefs.Internal {
	interface ProcessMemory {
		total: number;
		used: number;
		rss: number;
		external: number;
	}

	interface SystemMemory {
		total: number;
		used: number;
		free: number;
	}
}

declare namespace TypeDefs.Request {
	interface APIResponse {
		success: boolean;
		response?: {
			image: string;
			filetype: string;
			name: string;
		};
		error?: {
			code: number;
			description: string;
		}
	}
}

declare namespace TypeDefs.Strings {

}

declare namespace TypeDefs.Time {
	interface MsResponse {
		ms: number;
		s: number;
		m: number;
		h: number;
		d: number;
		w: number;
		mn: number;
		y: number;
	}
}

declare namespace TypeDefs.Utility {
	interface ShortURL {
		success: boolean;
		code: string;
		url: string;
		link: string;
		linkNumber: number;
		createdTimestamp: number;
		created: string;
		length: number;
		new: boolean;
	}

	interface CompareMemberWithRoleResult {
		/**
		 * if true, the bot is higher than the role
		 */
		higher: boolean;
		/**
		 * if true, the bot is lower than the role
		 */
		lower: boolean;
		/**
		 * if true, the bot is the same as the role
		 */
		same: boolean;
	}

	interface CompareMembersResult {
		/**
		 * stuff about the first member
		 */
		member1: {
			/**
			 * if true, first is higher than second
			 */
			higher: boolean;
			/**
			 * if true, second is higher than first
			 */
			lower: boolean;
			/**
			 * if true, first and second are equal
			 */
			same: boolean;
		};
		/**
		 * stuff about the second member
		 */
		member2: {
			/**
			 * if true, second is higher than first
			 */
			higher: boolean;
			/**
			 * if true, first is higher than second
			 */
			lower: boolean;
			/**
			 * if true, first and second are equal
			 */
			same: boolean;
		};
	}
}

export = TypeDefs;
