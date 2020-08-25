module.exports = {
	"env": {
		"es6": true,
		"node": true,
		"jest": true
	},
	"parserOptions": {
		"ecmaVersion": 8,
		"sourceType": "module",
		"ecmaFeatures": {
			"impliedStrict": true
		}
	},
	"plugins": [
		"prettier"
	],
	"extends": [
		"eslint:recommended",
		"prettier"
	],
	"rules": {
		"strict": [
			"error",
			"safe"
		],
		"no-console": "warn"
	}
};