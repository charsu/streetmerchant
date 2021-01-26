import { Link, Store } from "./store";
import { Browser, Page } from "puppeteer";
import { parseCard } from "./helpers/card";
import { envOrString } from "../../config";
import { Print, logger } from "../../logger";
import { getRandomUserAgent } from "../../util";

const buyNow = async (browser: Browser, page: Page, buyUrl?: string) => {
	logger.info("[amazon-uk]auto-buying amazon-uk: started");

	if (buyUrl == null) {
		// click the buy now
		await page.click("#buy-now-button");
		await page.waitForNavigation({ waitUntil: "networkidle0" });
	} else {
		//try to access the add to cart url
		logger.info("auto-buying amazon-uk: accessing add to cart url");
		await page.goto(buyUrl, { waitUntil: "domcontentloaded" });

		// push continue
		logger.info("auto-buying amazon-uk: confirm add to basket");
		await page.click('input[name="add"]');
		await page.waitForNavigation({ waitUntil: "domcontentloaded" });

		// push checkout
		logger.info("auto-buying amazon-uk: proceed to checkout");
		await page.click('input[name="proceedToRetailCheckout"]');
		await page.waitForNavigation({ waitUntil: "domcontentloaded" });
	}

	var url = page.url();
	if (url.includes("signin")) {
		await login(browser, page);
	}

	// click buy
	logger.info("auto-buying amazon-uk: submit order");
	await page.click("#submitOrderButtonId");
	await page.waitForNavigation({ waitUntil: "networkidle0" });

	logger.info("[amazon-uk] auto-buying successful");

	return "";
};

const login = async (browser: Browser, page: Page) => {
	logger.info("[amazon-uk] login amazon-uk: started");

	// username
	await page.type("#ap_email ", envOrString(process.env.AMAZONUK_USERNAME));
	await page.click("#continue");

	await page.waitForNavigation({ waitUntil: "domcontentloaded" });

	// password
	await page.type("#ap_password ", envOrString(process.env.AMAZONUK_PASSWORD));
	await page.click('input[name="rememberMe"]');
	await page.click("#signInSubmit");

	await page.waitForNavigation({ waitUntil: "domcontentloaded" });

	logger.info("[amazon-uk] login successful");
};

export const AmazonUk: Store = {
	backoffStatusCodes: [403, 429, 503],
	labels: {
		captcha: {
			container: "body",
			text: ["enter the characters you see below"],
		},
		inStock: {
			container: "#availability",
			text: ["in stock"],
		},
		maxPrice: {
			container: 'span[class*="priceBlockBuyingPriceString"]',
		},
		outOfStock: [
			{
				container: "#availability",
				text: ["out of stock", "unavailable"],
			},
			{
				container: "#backInStock",
				text: ["unavailable"],
			},
		],
	},
	setupLogin: async (brwsr) => {
		const page = await brwsr.newPage();
		await page.setUserAgent(getRandomUserAgent());

		await page.goto("https://www.amazon.co.uk/", {
			waitUntil: "domcontentloaded",
		});
		// await page.click("#nav-link-accountList").then(async () => {
		// 	await page.waitForNavigation({ waitUntil: "domcontentloaded" });
		// 	await login(brwsr, page);
		// });
		page.click("#nav-link-accountList");

		await page.waitForNavigation({ waitUntil: "domcontentloaded" });
		await login(brwsr, page);
	},
	links: [
		{
			brand: "test:brand",
			cartUrl:
				"https://www.amazon.co.uk/gp/aws/cart/add.html?ASIN.1=B085G58KWT&Quantity.1=1",
			buyAction: buyNow,
			model: "test:model",
			series: "test:series",
			url:
				"https://www.amazon.co.uk/all-new-echo-4th-generation-with-premium-sound-smart-home-hub-and-alexa-charcoal/dp/B085G58KWT",
		},
		{
			brand: "sony",
			cartUrl:
				"https://www.amazon.co.uk/gp/aws/cart/add.html?ASIN.1=B08H95Y452&Quantity.1=1",
			buyAction: buyNow,
			model: "ps5 console",
			series: "sonyps5c",
			url: "https://www.amazon.co.uk/dp/B08H95Y452",
		},
		{
			brand: "sony",
			cartUrl:
				"https://www.amazon.co.uk/gp/aws/cart/add.html?ASIN.1=B08H97NYGP&Quantity.1=1",
			model: "ps5 digital",
			series: "sonyps5de",
			url: "https://www.amazon.co.uk/dp/B08H97NYGP",
		},
		{
			brand: "microsoft",
			cartUrl:
				"https://www.amazon.co.uk/gp/aws/cart/add.html?ASIN.1=B08H93GKNJ&Quantity.1=1",
			model: "xbox series x",
			series: "xboxsx",
			url: "https://www.amazon.co.uk/dp/B08H93GKNJ",
		},
		{
			brand: "microsoft",
			cartUrl:
				"https://www.amazon.co.uk/gp/aws/cart/add.html?ASIN.1=B08GD9MNZB&Quantity.1=1",
			model: "xbox series s",
			series: "xboxss",
			url: "https://www.amazon.co.uk/dp/B08GD9MNZB",
		},
	],
	// linksBuilder: {
	// 	builder: (docElement, series) => {
	// 		const productElements = docElement.find(
	// 			'.s-result-list .s-result-item[data-asin]'
	// 		);
	// 		const links: Link[] = [];
	// 		for (let i = 0; i < productElements.length; i++) {
	// 			const productElement = productElements.eq(i);
	// 			const asin = productElement.attr()['data-asin'];

	// 			if (!asin) {
	// 				continue;
	// 			}

	// 			const url = `https://www.amazon.co.uk/dp/${asin}/`;
	// 			const titleElement = productElement
	// 				.find('.sg-col-inner h2 a.a-text-normal[href] span')
	// 				.first();
	// 			const title = titleElement.text().trim();

	// 			if (!title || !new RegExp(`RTX.*${series}`, 'i').exec(title)) {
	// 				continue;
	// 			}

	// 			const card = parseCard(title);

	// 			if (card) {
	// 				links.push({
	// 					brand: card.brand as any,
	// 					cartUrl: `https://www.amazon.co.uk/gp/aws/cart/add.html?ASIN.1=${asin}&Quantity.1=1`,
	// 					model: card.model,
	// 					series,
	// 					url
	// 				});
	// 			} else {
	// 				logger.error(`Failed to parse card: ${title}`, {url});
	// 			}
	// 		}

	// 		return links;
	// 	},
	// 	ttl: 300000,
	// 	urls: [
	// 		{
	// 			series: '3080',
	// 			url: [
	// 				'https://www.amazon.co.uk/s?k=%2B%22RTX+3080%22+-2080+-GTX&i=computers&rh=n%3A430500031%2Cp_n_availability%3A419162031&s=relevancerank&dc&qid=1601675291',
	// 				'https://www.amazon.co.uk/s?k=%2B%22RTX+3080%22+-2080+-GTX&i=computers&rh=n%3A430500031%2Cp_n_availability%3A419162031&s=relevancerank&dc&qid=1601675594&page=2'
	// 			]
	// 		},
	// 		{
	// 			series: '3090',
	// 			url: [
	// 				'https://www.amazon.co.uk/s?k=%2B%22RTX+3090%22+-3080+-GTX&i=computers&rh=n%3A430500031%2Cp_n_availability%3A419162031&s=relevancerank&dc&qid=1601675291',
	// 				'https://www.amazon.co.uk/s?k=%2B%22RTX+3090%22+-3080+-GTX&i=computers&rh=n%3A430500031%2Cp_n_availability%3A419162031&s=relevancerank&dc&qid=1601675594&page=2'
	// 			]
	// 		}
	// 	]
	// },
	name: "amazon-uk",
};
