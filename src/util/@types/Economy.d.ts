import config from "../../config";

declare global {
	namespace Economy {
		interface EcoUser {
			bal: number;
			inv: Inventory;
			history: Economy.HistoryEntry.Any[];
		}

		interface Inventory {
			items: {
				id: Economy.Items.Any;
				amount: number;
			}[];
		}
	}

	namespace Economy.HistoryEntry {
		type Any = ShareEntry | BegEntry | ClaimEntry;

		interface ShareEntry {
			type: "share";
			amount: number;
			time: string;
			beforeBalance: {
				from: number;
				to: number;
			};
			afterBalance: {
				from: number;
				to: number;
			};
		}

		interface BegEntry {
			type: "beg";
			amount: number;
			time: string;
			beforeBalance: number;
			afterBalance: number;
		}

		interface ClaimEntry {
			type: "claim";
			subType: "hourly" | "daily" | "weekly";
			amount: number;
			time: string;
			beforeBalance: number;
			afterBalance: number;
		}
	}

	namespace Economy.Items {
		type Any = (keyof (typeof config)["eco"]["items"]);

		// I planned on defining these here, but the JSON makes more sense in the long run
		// src/config/other/items.json
	}

}
