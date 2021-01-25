import { Store } from "./store";
import { Print, logger } from "../../logger";
import { Browser, Page } from "puppeteer";
import { envOrString } from "../../config";
import { AnyARecord } from "dns";

const login = async (browser: Browser, page: Page) => {
	logger.info("[argos] login started");

	// username
	await page.type(
		'input[name="emailAddress"]',
		envOrString(process.env.ARGOS_USERNAME)
	);
	await page.$eval('input[name="emailAddress"]', (e: any) => e.blur());

	// password
	await page.type(
		'input[name="currentPassword"]',
		envOrString(process.env.ARGOS_PASSWORD)
	);
	await page.$eval('input[name="currentPassword"]', (e: any) => e.blur());

	await page.waitForTimeout(100);
	// submit
	await page.click('button[data-bdd-test-id="yourEmailSubmitButton"]');

	await page.waitForNavigation({ waitUntil: "load" });

	logger.info("[argos] login successful");
};

export const Argos: Store = {
	backoffStatusCodes: [403, 429, 503],
	backoffAction: async (page, statuscode) => {
		if (statuscode == 403) {
			//clear all cookies
			const client = await page.target().createCDPSession();
			await client.send("Network.clearBrowserCookies");
			logger.info("[argos]: cookies cleared (unauthorised reponse)");
		}
		return -1;
	},
	// setupLogin: async (brwsr) => {
	// 	const page = await brwsr.newPage();

	// 	await page.goto(
	// 		"https://www.argos.co.uk/account/login?clickOrigin=header:home:account",
	// 		{ waitUntil: "load" }
	// 	);

	// 	await login(brwsr, page);
	// },
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
