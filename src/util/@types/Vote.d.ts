declare namespace Vote {
	interface DBLVote {
		user: string;
		type: "upvote" | "test";
		weekend: boolean;
		query: string;
		time: number;
	}
}
