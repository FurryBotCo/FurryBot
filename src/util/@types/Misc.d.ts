type DeepPartial<T> = {
	[P in keyof T]?: Partial<T[P]>;
}

type ArrayOneOrMore<T> = {
	0: T;
} & T[];