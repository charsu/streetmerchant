import { Store } from "./store";
import { Print, logger } from "../../logger";
import { Browser, Page } from "puppeteer";
import { envOrString } from "../../config";
import { getRandomUserAgent } from "../../util";

const openBasketAndBuy = async (
	browser: Browser,
	page: Page,
	buyUrl?: string
) => {

	logger.info("[argos] opening basket and login ...");

	await page.goto(
		"https://www.argos.co.uk/account/login?clickOrigin=header:trolley:account",
		{ waitUntil: "load" }
	);

	// if consent present
	const consentvisible = await page.evaluate(() => {
		return document.querySelector("#consent_prompt_submit") != null;
	});

	if (consentvisible) {
		await page.click("#consent_prompt_submit");
		// await page.waitForNavigation({ waitUntil: "load" });
	}

	await login(browser, page);
	return await buyNow(browser, page, buyUrl);
};

const buyNow = async (browser: Browser, page: Page, buyUrl?: string) => {
	logger.info("[argos] buy started");

	// go to basket
	await page.goto("https://www.argos.co.uk/basket", { waitUntil: "load" });

	// gather the info and print
	const basket = await page.evaluate(() => {
		const store = document.querySelector('div[data-e2e="collection-store"]')
			?.textContent;
		const home = document.querySelector('div[data-e2e="delivery-postcode"]')
			?.textContent;

		const items = Array.from(
			document.querySelectorAll('li[data-e2e="basket-productcard"]')
		);
		return items.map((item) => {
			const productName = item.querySelector('a[data-e2e="product-name"]')
				?.textContent;
			const productSku = item.querySelector('span[data-e2e="product-sku"]')
				?.textContent;

			const productQuantity = item.querySelector(
				'select[data-e2e="product-quantity"]'
			)?.textContent;

			const pickupStatus = item.querySelector(
				'div[data-e2e="collection-product-leadtime"]'
			)?.textContent;
			const deliveryStatus = item.querySelector(
				'div[data-e2e="delivery-product-leadtime"]'
			)?.textContent;

			const product = `[${productSku}] ${productName} x ${productQuantity}`;
			const pickup = `${store} : ${pickupStatus}`;
			const delivery = `${home} : ${deliveryStatus}`;

			return { product, pickup, delivery };
		});
	});
	logger.info("[argos] basket contents :");
	basket.forEach((item) => {
		logger.info(`[argos] ${item.product}`);
		logger.info(`[argos] ${item.pickup}`);
		logger.info(`[argos] ${item.delivery}`);
		logger.info(`[argos] ----------------------`);
	});

	// check what buttons are avaialable
	const btnAvailable = await page.evaluate(() => {
		const collect =
			document.querySelector(
				'button[data-e2e="continue-with-collection-button"]:not(disabled)'
			) != null;
		const deliver =
			document.querySelector(
				'button[data-e2e="continue-with-delivery-button"]:not(disabled)'
			) != null;
		return { collect, deliver };
	});

	logger.info(
		`[argos] collect = ${btnAvailable.collect} , deliver = ${btnAvailable.deliver} `
	);
	// favor deliver
	if (btnAvailable.deliver) {
		logger.info("[argos] chosing delivery");
		// press deliver now
		page.click('button[data-e2e="continue-with-delivery-button"]');
		await page.waitForNavigation({ waitUntil: "domcontentloaded" });

		await bookTime(page);
		await payNow(page);
	} else if (btnAvailable.collect) {
		logger.info("[argos] chosing collect");
		// press collect now
		page.click('button[data-e2e="continue-with-collection-button"]');
		await page.waitForNavigation({ waitUntil: "load" });

		await payNow(page);
	}

	await page.waitForTimeout(5 * 1000);

	return "";
};

const bookTime = async (page: Page) => {
	const slot = await page.evaluate(() => {
		const dates = Array.from(
			document.querySelectorAll("#smallitemsright tr th div.slotDateLabel")
		).map((s) => s.textContent);

		const slots = Array.from(
			document.querySelectorAll<HTMLElement>(
				"#smallitemsright td.blockContent:not(.noSlot)"
			)
		);

		slots.sort((a, b) =>
			(a.getAttribute("name") || "") > (b.getAttribute("name") || "") ? 1 : -1
		);

		const [firstSlot] = slots;
		if (firstSlot) {
			firstSlot.click();
		}

		const time = firstSlot?.querySelector("li")?.getAttribute("title");
		return { dates, time, firstSlot };
	});

	if (!slot.firstSlot) {
		logger.info("[argos] could not find any valid slots");
	}

	const value = Number(slot.firstSlot.nodeValue || "1");
	const date = slot.dates[value - 1];
	logger.info(`[argos] booked ${slot.dates[value - 1]} : ${slot.time}`);

	page.click("#contextualSubmitContinueEcomm");
	await page.waitForNavigation({ waitUntil: "load" });
};

const payNow = async (page: Page) => {
	page.click("#continue-to-payment-details");
	await page.waitForNavigation({ waitUntil: "load" });

	const [payFrame] = page.frames();

	if (!payFrame) {
		logger.info(`[argos] pay frame could not be found : failure`);
		return;
	}

	// fill card details ?!?
	await payFrame.type(
		"#securityCode",
		envOrString(process.env.CARD_SECURITYCODE)
	);

	payFrame.click("#payNowButton");
	page.waitForNavigation({ waitUntil: "networkidle0" });
	logger.info(`[argos] order submited succesfully`);
};

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
	await page.waitForTimeout(100);

	await page.$eval('input[name="currentPassword"]', (e: any) => e.blur());

	await page.waitForTimeout(100);
	// submit
	page.click('button[data-bdd-test-id="yourEmailSubmitButton"]');

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
	// 	await page.setUserAgent(getRandomUserAgent());

	// 	await page.goto(
	// 		"https://www.argos.co.uk/account/login?clickOrigin=header:home:account",
	// 		{ waitUntil: "load" }
	// 	);

	// 	// if consent present
	// 	const consentvisible = await page.evaluate(() => {
	// 		return document.querySelector("#consent_prompt_submit") != null;
	// 	});

	// 	if (consentvisible) {
	// 		await page.click("#consent_prompt_submit");
	// 		// await page.waitForNavigation({ waitUntil: "load" });
	// 	}

	// 	await login(brwsr, page);
	// },
	labels: {
		inStock: [
			{
				container: ".add-to-trolley-main",
				text: ["to Trolley"],
			},
			{
				container: "button[data-test='component-button']:not([disabled])",
				text: ["Pay now and collect", "Continue with delivery"],
			},
		],
		outOfStock: [
			{
				container: ".promo-text,product-detail__email-me-container",
				text: ["currently unavailable", "Out of stock"],
			},
		],
	},

	links: [
		{
			brand: "test:brand",
			model: "test:model",
			series: "test:series",
			url: "https://www.argos.co.uk/product/1406029",
			buyAction: openBasketAndBuy,
		},
		{
			brand: "sony",
			model: "ps5 console",
			series: "sonyps5c",
			url: "https://www.argos.co.uk/product/8349000",
			buyAction: openBasketAndBuy,
		},
		{
			brand: "sony",
			model: "ps5 console",
			series: "sonyps5c",
			url:
				"https://www.argos.co.uk/basket?clickOrigin=header:myaccount:trolley",
			buyAction: openBasketAndBuy,
		},
	],
	name: "argos",
};
