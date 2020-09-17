declare namespace FluxPoint {
	type Color = string; // there's no list of all supported texts
	type Icon = "cat" | "chika" | "dog" | "neko" | "nyancat" | "pepe" | "pikachu" | "sneko" | "shrek" | string;
	type Banner = "love" | "mountain" | "purplewave" | "rainbow" | "space" | "sunset" | "swamp" | "wave" | string;

	interface WelcomeFormat {
		username: string;
		avatar: string;
		background: string;
		members?: string;
		icon?: Icon;
		banner?: Banner;
		color_welcome?: Color;
		color_username?: Color;
		color_members?: Color;
	}

	interface ImageFormatSquare {
		type: "bitmap";
		x: number;
		y: number;
		width: number;
		height: number;
		color: Color;
		round?: number;
	}

	interface ImageFormatURL {
		type: "url";
		url: string;
		x: number;
		y: number;
		width?: number;
		height?: number;
		round?: number;
	}

	interface ImageFormatCircle {
		type: "circle";
		x: number;
		y: number;
		radius: number;
		color: Color;
	}

	interface ImageFormatTriangle {
		type: "triangle";
		x: number;
		y: number;
		color: Color;
		cut: "topleft" | "topright" | "bottomleft" | "bottomright";
	}

	type AnyImageFormat = ImageFormatSquare | ImageFormatURL | ImageFormatCircle | ImageFormatTriangle;

	interface TextFormat {
		text: string;
		type: number;
		color: Color;
		x: number;
		y: number;
		fot?: string;
		bold?: boolean;
		unicode?: boolean;
		outline?: number;
		outlinecolor?: Color;
	}
}

export = FluxPoint;
