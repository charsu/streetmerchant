import {Store} from './store';

export const Asda: Store = {
    backoffStatusCodes: [403, 429, 503],
	labels: {
		inStock: {
			container: '.buying-block',
			text: ['ADD TO BAG']
		},
		outOfStock: {
			container: '.buying-block',
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
			url: 'https://direct.asda.com/george/toys-character/gaming/gaming-consoles/playstation5-console/050887006,default,pd.html'
		}
	],
	name: 'asda'
};
