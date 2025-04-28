import { contries as countries } from "./countries.js";

/**
 * Gets the default locale for a given country code
 * @param {string} countryCode - The two-letter country code (ISO 3166-1 alpha-2)
 * @returns {string} The default locale for the country, falls back to 'en-US'
 */
const getDefaultLocaleByCountry = (countryCode) => {
	const defaultLocale = "en-US";
	const country = countries.find((item) => item.alpha2 === countryCode);
	return country ? country.default_locale : defaultLocale;
};

/**
 * Formats a monetary value according to the current Shopify store settings
 * @param {number} value - The monetary value in cents
 * @returns {string} The formatted monetary value
 */
const format = (value) => {
	const defaultCurrency = "USD";
	const defaultCountry = "US";
	const defaultLocale = "en-US";

	const currency =
		window.Shopify &&
		window.Shopify.currency &&
		window.Shopify.currency.active
			? window.Shopify.currency.active
			: defaultCurrency;
	const country =
		window.Shopify && window.Shopify.country
			? window.Shopify.country
			: defaultCountry;
	const locale =
		window.Shopify && window.Shopify.country
			? getDefaultLocaleByCountry(country)
			: defaultLocale;

	let formattedValue = value;

	try {
		const formatter = new Intl.NumberFormat(locale, {
			style: "currency",
			currency: currency,
		});
		formattedValue = formatter.format(value / 100.0);
	} catch (error) {
		console.error(`Error formatting monetary value: ${error.message}`);
	}

	return formattedValue;
};

const component = {
	/**
	 * Initializes the money formatting module
	 */
	init: () => {
		window.theme = window.theme || {};
		window.theme.money = component;
		component.money_format =
			typeof Shopify !== "undefined" && Shopify.money_format
				? Shopify.money_format
				: "${{amount}}";
		component.initMoneyFormat();
	},

	/**
	 * Initializes the money format functionality
	 */
	initMoneyFormat: () => {
		component.format = format;
	},
};

export default component;