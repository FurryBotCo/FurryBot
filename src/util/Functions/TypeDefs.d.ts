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
}

export = TypeDefs;
