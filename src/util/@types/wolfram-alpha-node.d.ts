declare module "wolfram-alpha-node" {
	interface Pod {
		title: string;
		scanner: string;
		id: string;
		position: number;
		error: boolean;
		subpods: any[]; // @TODO
		expressiontypes: any; // @TODO
	}

	interface FullResponse {
		success: boolean;
		error: boolean;
		numpods: number;
		datatypes: string;
		timedout: string;
		timedoutpods: string;
		timing: number;
		parsetiming: number;
		paresetimedout: number;
		recalculate: string;
		id: string;
		host: string;
		server: string;
		related: string;
		version: string;
		pods: Pod[];
		sources: {
			url: string;
			text: string;
		};
	}

	class WolframAlphaAPI {
		appid: string;
		constructor(appid: string);
		/* returns a string */
		getShort(input: string): Promise<string>;

		// there's more but I don't care about them
	}

	function initializeClass(appid: string): WolframAlphaAPI;
	export default initializeClass;
}
