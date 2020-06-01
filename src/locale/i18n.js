// adapted from https://medium.com/@olinations/10-steps-to-convert-a-react-class-component-to-a-functional-component-with-hooks-ab198e0fa139

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Cookies from 'js-cookie';
const en = require('./en.json');
const de = require('./de.json');

const resources = {
	en: {
		translation: en
	},
	de: {
		translation: de
	}
};

// Determine which language to set at start: first check cookie, then preferred browser-language. Fallback: en
let language = 'en';
if (Cookies.get('language')) {
	language = Cookies.get('language');
} else {
	let browserLanguage = window.navigator.userLanguage || window.navigator.language;
	if (browserLanguage.startsWith('de')) {
		language = 'de';
	}
}
if (!(language == 'en' || language == 'de')) {
	console.error(
		'Language setting in cookie or preferred browser language are not English or German. ' +
			'Falling back to English. More languages are coming! You are welcome to help translating :)'
	);
}

i18n.use(initReactI18next).init({
	resources,
	lng: language,
	keySeparator: false,
	fallbackLng: 'en',
	interpolation: {
		escapeValue: false
	}
});

export default i18n;
