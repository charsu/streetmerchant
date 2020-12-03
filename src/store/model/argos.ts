import {Store} from './store';

export const Argos: Store = {
    backoffStatusCodes: [403, 429, 503],
	labels: {
		inStock: {
			container: '.add-to-trolley-main',
			text: ['to Trolley']
		},
		outOfStock: {
			container: '.promo-text,product-detail__email-me-container',
			text: ['currently unavailable', 'Out of stock']
		}
	},
	links: [
		{
			brand: 'test:brand',
			model: 'test:model',
			series: 'test:series',
			url: 'https://www.argos.co.uk/product/1406029'
		},
		{
			brand: 'sony',
			model: 'ps5 console',
			series: 'sonyps5c',
			url: 'https://www.argos.co.uk/product/6795199'
		},
		{
			brand: 'sony',
			model: 'ps5 console',
			series: 'sonyps5c',
			url: 'https://www.argos.co.uk/product/8349000'
		},
		{
			brand: 'sony',
			model: 'ps5 console',
			series: 'sonyps5c',
			url: 'https://www.argos.co.uk/product/8349024'
		}
	],
	name: 'argos'
};
