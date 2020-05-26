// This needs some complicated stuff that I'm not qualified to make,
// and can't easily find by googling, the issue is overloaded functions
// it only takes one overload which makes it wrong.

/*declare module "deasync" {
	type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;

	type OptionalSpread<T> =
		T extends undefined
		? []
		: [T];

	type OverloadedReturnType<T> =
		T extends { (...args: any[]): infer R; (...args: any[]): infer R; (...args: any[]): infer R; (...args: any[]): infer R } ? R :
		T extends { (...args: any[]): infer R; (...args: any[]): infer R; (...args: any[]): infer R } ? R :
		T extends { (...args: any[]): infer R; (...args: any[]): infer R } ? R :
		T extends (...args: any[]) => infer R ? R : any;

	type ReplaceReturnType<T extends (...a: any) => any, TNewReturn> = (...a: Parameters<T>) => TNewReturn;

	function deasync<F extends (...args: any[]) => any = (...args: any[]) => any>(func: F): ReplaceReturnType<F, ThenArg<OverloadedReturnType<F>>>;
	export = deasync;
}*/
