declare namespace Economy {
	interface EcoUser {
		bal: number;
		inv: Inventory;
		history: Economy.HistoryEntry.Any[];
	}

	interface Inventory {
		items: Economy.Items.Any[];
	}
}

declare namespace Economy.HistoryEntry {
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

declare namespace Economy.Items {
	type Any = [];
}
