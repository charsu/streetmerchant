import { Store } from "./store";

export const JohnLewis: Store = {
	backoffStatusCodes: [403, 429],
	successStatusCodes: [503],
	labels: {
		inStock: {
			container: ".add-to-basket-summary-and-cta",
			text: ["Add to your basket"],
		},
		outOfStock: {
			container: ".cq-bf-middle p,product-detail__email-me-container",
			text: ["We are now out of stock.", "Out of stock"],
		},
	},
	links: [
		// out of stock test
		{
			brand: "test:brand",
			model: "test:model",
			series: "test:series",
			url:
				"https://www.johnlewis.com/turtle-beach-recon-70-gaming-headset-for-ps4-ps4-pro-ps5/p5195582",
		},
		// in stock test
		{
			brand: "test:brand",
			model: "test:model",
			series: "test:series",
			url:
				"https://www.johnlewis.com/sony-ps4-dualshock-4-wireless-controller-black/p3051409",
		},
		// first link
		{
			brand: "sony",
			model: "ps5 console",
			series: "sonyps5c",
			url:
				"https://www.johnlewis.com/sony-playstation-5-console-with-dualsense-controller/white/p5115192",
		},
	],
	name: "johnlewis",
};
