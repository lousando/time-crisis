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
	"extends": "eslint:recommended",
	"rules": {
		"indent": [
			"error",
			"tab"
		],
		"linebreak-style": [
			"error",
			"unix"
		],
		"quotes": [
			"error",
			"double"
		],
		"semi": [
			"error",
			"always"
		],
		"strict": [
			"error",
			"safe"
		],
		"no-console": "warn"
	}
};