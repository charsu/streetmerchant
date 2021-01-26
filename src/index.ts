import { startAPIServer, stopAPIServer } from "./web";
import { Browser } from "puppeteer";
import { config } from "./config";
import { getSleepTime } from "./util";
import { logger } from "./logger";
import puppeteer from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import { storeList, getStores } from "./store/model";
import { tryLookupAndLoop } from "./store";

puppeteer.use(stealthPlugin());

let browser: Browser | undefined;

/**
 * Starts the bot.
 */
async function main() {
	const args: string[] = [];

	// required to access iframes
	args.push('--disable-web-security');
	args.push('--disable-features=IsolateOrigins,site-per-process');

	// Skip Chromium Linux Sandbox
	// https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#setting-up-chrome-linux-sandbox
	if (config.browser.isTrusted) {
		args.push("--no-sandbox");
		args.push("--disable-setuid-sandbox");
	}

	// https://github.com/puppeteer/puppeteer/blob/main/docs/troubleshooting.md#tips
	if (config.docker) {
		args.push("--disable-dev-shm-usage");
	}

	// Add the address of the proxy server if defined
	if (config.proxy.address) {
		args.push(
			`--proxy-server=${config.proxy.protocol}://${config.proxy.address}:${config.proxy.port}`
		);
	}

	await stop();

	browser = await puppeteer.launch({
		args,
		defaultViewport: {
			height: config.page.height,
			width: config.page.width,
		},
		executablePath: config.raspberrypi ? "chromium-browser" : "",
		headless: config.browser.isHeadless,
	});

	const activeStores = getStores();
	for (const store of storeList.values()) {
		logger.debug("store links", { meta: { links: store.links } });
		if (store.setupAction !== undefined) {
			store.setupAction(browser);
		}

		if (activeStores.has(store.name) && store.setupLogin) {
			await store.setupLogin(browser);
		}

		setTimeout(tryLookupAndLoop, getSleepTime(store), browser, store);
	}

	await startAPIServer();
}

async function stop() {
	await stopAPIServer();

	if (browser) {
		// Use temporary swap variable to avoid any race condition
		const browserTemporary = browser;
		browser = undefined;
		await browserTemporary.close();
	}
}

async function stopAndExit() {
	await stop();
	// eslint-disable-next-line unicorn/no-process-exit
	process.exit(0);
}

/**
 * Will continually run until user interferes.
 */
async function loopMain() {
	try {
		await main();
	} catch (error: unknown) {
		logger.error(
			"✖ something bad happened, resetting streetmerchant in 5 seconds",
			error
		);
		setTimeout(loopMain, 5000);
	}
}

void loopMain();

process.on("SIGINT", stopAndExit);
process.on("SIGQUIT", stopAndExit);
process.on("SIGTERM", stopAndExit);
