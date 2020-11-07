declare namespace Vote {
	interface DBLVote {
		bot: string;
		user: string;
		type: "upvote" | "test";
		isWeekend: boolean;
		query?: string;
	}
	interface DBoatsVote {
		bot: {
			id: string;
			name: string;
		};
		user: {
			id: string;
			username: string;
			discriminator: string;
		};
	}
}
