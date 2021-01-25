import { Store } from "./store";

export const Argos: Store = {
	backoffStatusCodes: [429, 503],
	labels: {
		inStock: [
			{
				container: ".add-to-trolley-main",
				text: ["to Trolley"],
			},
			// {
				
			// 	container:"button[data-test='component-button']:not([disabled])",
			// 	text:["Pay now and collect","Continue with delivery"]
			// },
		],
		outOfStock: {
			container: ".promo-text,product-detail__email-me-container",
			text: ["currently unavailable", "Out of stock"],
		},
	},
	links: [
		{
			brand: "test:brand",
			model: "test:model",
			series: "test:series",
			url: "https://www.argos.co.uk/product/1406029",
		},
		{
			brand: "sony",
			model: "ps5 console",
			series: "sonyps5c",
			url: "https://www.argos.co.uk/product/6795199",
		},
		{
			brand: "sony",
			model: "ps5 console",
			series: "sonyps5c",
			url: "https://www.argos.co.uk/product/8349000",
		},
		{
			brand: "sony",
			model: "ps5 console",
			series: "sonyps5c",
			url: "https://www.argos.co.uk/product/8349024",
		},
		// {
		// 	brand: "sony",
		// 	model: "ps5 console",
		// 	series: "sonyps5c",
		// 	url:
		// 		"https://www.argos.co.uk/basket?clickOrigin=header:myaccount:trolley",
		// },
	],
	name: "argos",
};
