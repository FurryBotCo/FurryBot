type DeepPartial<T> = {
	[P in keyof T]?: Partial<T[P]>;
}

type ArrayOneOrMore<T> = {
	0: T;
} & T[];

type BlacklistEntry = {
	created: number;
	type: "user" | "guild";
	blame: string;
	blameId: string;
	reason: string;
	id: string;
	noticeShown: boolean;
	expire?: number;
	userId?: string;
	guildId?: string;
} & ({
	type: "user";
	userId: string;
} | {
	type: "guild";
	guildId: string;
});

export { DeepPartial };
export { ArrayOneOrMore };
export { BlacklistEntry };