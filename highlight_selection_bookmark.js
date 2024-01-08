javascript: (() => {/* eslint-disable-line no-unused-labels */
	const g_version = "1.4.0";
	const g_debug = 0;
	const g_message = "highlight_selection";

	/**
	 * MutationObserverから起動した回数を示す変数。
	 * MutationObserverから起動したら+1する。
	 * 手動ハイライトしたら0にリセットする。
	 */
	let g_count_mutation_start = 0;

	/**
	 * MutationObserverから起動する最大回数。
	 */
	const g_max_count_mutation_start = 10;



	/**
	 * Copyright (c) 2013 Blake Embrey (hello@blakeembrey.com)
	 * Released under the MIT license
	 * https://github.com/plurals/pluralize/blob/master/LICENSE
	 * Pluralize v8.0.0
	 */
	const pluralize = (() => {
		/* Rule storage - pluralize and singularize need to be run sequentially,
		while other rules can be optimized using an object for instant lookups. */
		const pluralRules = [];
		const singularRules = [];
		const uncountables = {};
		const irregularPlurals = {};
		const irregularSingles = {};

		/**
		 * Sanitize a pluralization rule to a usable regular expression.
		 *
		 * @param  {(RegExp|string)} rule
		 * @return {RegExp}
		 */
		function sanitizeRule(rule) {
			if (typeof rule === 'string') {
				return new RegExp(`^${rule}$`, 'iu');
			}

			return rule;
		}

		/**
		 * Pass in a word token to produce a function that can replicate the case on
		 * another word.
		 *
		 * @param  {string}   word
		 * @param  {string}   token
		 * @return {Function}
		 */
		function restoreCase(word, token) {
			/* Tokens are an exact match. */
			if (word === token) { return token; }

			/* Lower cased words. E.g. "hello". */
			if (word === word.toLowerCase()) { return token.toLowerCase(); }

			/* Upper cased words. E.g. "WHISKY". */
			if (word === word.toUpperCase()) { return token.toUpperCase(); }

			/* Title cased words. E.g. "Title". */
			if (word[0] === word[0].toUpperCase()) {
				return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
			}

			/* Lower cased words. E.g. "test". */
			return token.toLowerCase();
		}

		/**
		 * Interpolate a regexp string.
		 *
		 * @param  {string} str
		 * @param  {Array}  args
		 * @return {string}
		 */
		function interpolate(str, args) {
			return str.replace(/\$(\d{1,2})/gu, function (match, index) {
				return args[index] || '';
			});
		}

		/**
		 * Replace a word using a rule.
		 *
		 * @param  {string} word
		 * @param  {Array}  rule
		 * @return {string}
		 */
		function replace(word, rule) {
			return word.replace(rule[0], function (match, index) {
				/* eslint-disable-next-line prefer-rest-params */
				const result = interpolate(rule[1], arguments);

				if (match === '') {
					return restoreCase(word[index - 1], result);
				}

				return restoreCase(match, result);
			});
		}

		/**
		 * Sanitize a word by passing in the word and sanitization rules.
		 *
		 * @param  {string}   token
		 * @param  {string}   word
		 * @param  {Array}    rules
		 * @return {string}
		 */
		function sanitizeWord(token, word, rules) {
			/* Empty string or doesn't need fixing. */
			if (!token.length || Object.prototype.hasOwnProperty.call(uncountables, token)) {
				return word;
			}

			let len = rules.length;

			/* Iterate over the sanitization rules and use the first one to match. */
			while (len--) {
				const rule = rules[len];

				if (rule[0].test(word)) { return replace(word, rule); }
			}

			return word;
		}

		/**
		 * Replace a word with the updated word.
		 *
		 * @param  {Object}   replaceMap
		 * @param  {Object}   keepMap
		 * @param  {Array}    rules
		 * @return {Function}
		 */
		function replaceWord(replaceMap, keepMap, rules) {
			return function (word) {
				/* Get the correct token and case restoration functions. */
				const token = word.toLowerCase();

				/* Check against the keep object map. */
				if (Object.prototype.hasOwnProperty.call(keepMap, token)) {
					return restoreCase(word, token);
				}

				/* Check against the replacement map for a direct word replacement. */
				if (Object.prototype.hasOwnProperty.call(replaceMap, token)) {
					return restoreCase(word, replaceMap[token]);
				}

				/* Run all the rules against the word. */
				return sanitizeWord(token, word, rules);
			};
		}

		/**
		 * Check if a word is part of the map.
		 */
		function checkWord(replaceMap, keepMap, rules) {
			return function (word) {
				const token = word.toLowerCase();

				if (Object.prototype.hasOwnProperty.call(keepMap, token)) { return true; }
				if (Object.prototype.hasOwnProperty.call(replaceMap, token)) { return false; }

				return sanitizeWord(token, token, rules) === token;
			};
		}

		/**
		 * Pluralize or singularize a word based on the passed in count.
		 *
		 * @param  {string}  word      The word to pluralize
		 * @param  {number}  count     How many of the word exist
		 * @param  {boolean} inclusive Whether to prefix with the number (e.g. 3 ducks)
		 * @return {string}
		 */
		function pluralize_in(word, count, inclusive) {
			const pluralized = count === 1
				? pluralize_in.singular(word)
				: pluralize_in.plural(word);

			return (inclusive ? `${count} ` : '') + pluralized;
		}

		/**
		 * Pluralize a word.
		 *
		 * @type {Function}
		 */
		pluralize_in.plural = replaceWord(
			irregularSingles, irregularPlurals, pluralRules
		);

		/**
		 * Check if a word is plural.
		 *
		 * @type {Function}
		 */
		pluralize_in.isPlural = checkWord(
			irregularSingles, irregularPlurals, pluralRules
		);

		/**
		 * Singularize a word.
		 *
		 * @type {Function}
		 */
		pluralize_in.singular = replaceWord(
			irregularPlurals, irregularSingles, singularRules
		);

		/**
		 * Check if a word is singular.
		 *
		 * @type {Function}
		 */
		pluralize_in.isSingular = checkWord(
			irregularPlurals, irregularSingles, singularRules
		);

		/**
		 * Add a pluralization rule to the collection.
		 *
		 * @param {(string|RegExp)} rule
		 * @param {string}          replacement
		 */
		pluralize_in.addPluralRule = function (rule, replacement) {
			pluralRules.push([sanitizeRule(rule), replacement]);
		};

		/**
		 * Add a singularization rule to the collection.
		 *
		 * @param {(string|RegExp)} rule
		 * @param {string}          replacement
		 */
		pluralize_in.addSingularRule = function (rule, replacement) {
			singularRules.push([sanitizeRule(rule), replacement]);
		};

		/**
		 * Add an uncountable word rule.
		 *
		 * @param {(string|RegExp)} word
		 */
		pluralize_in.addUncountableRule = function (word) {
			if (typeof word === 'string') {
				uncountables[word.toLowerCase()] = true;
				return;
			}

			/* Set singular and plural references for the word. */
			pluralize_in.addPluralRule(word, '$0');
			pluralize_in.addSingularRule(word, '$0');
		};

		/**
		 * Add an irregular word definition.
		 *
		 * @param {string} single
		 * @param {string} plural
		 */
		pluralize_in.addIrregularRule = function (single, plural) {
			plural = plural.toLowerCase();
			single = single.toLowerCase();

			irregularSingles[single] = plural;
			irregularPlurals[plural] = single;
		};

		/**
		 * Irregular rules.
		 */
		[
			/* Pronouns. */
			/* ['I', 'we'],
			['me', 'us'],
			['he', 'they'],
			['she', 'they'], */
			['them', 'them'],
			['myself', 'ourselves'],
			['yourself', 'yourselves'],
			['itself', 'themselves'],
			['herself', 'themselves'],
			['himself', 'themselves'],
			['themself', 'themselves'],
			['is', 'are'],
			['was', 'were'],
			['has', 'have'],
			['this', 'these'],
			['that', 'those'],
			/* Words ending in with a consonant and `o`. */
			['echo', 'echoes'],
			['dingo', 'dingoes'],
			['volcano', 'volcanoes'],
			['tornado', 'tornadoes'],
			['torpedo', 'torpedoes'],
			/* Ends with `us`. */
			['genus', 'genera'],
			['viscus', 'viscera'],
			/* Ends with `ma`. */
			['stigma', 'stigmata'],
			['stoma', 'stomata'],
			['dogma', 'dogmata'],
			['lemma', 'lemmata'],
			['schema', 'schemata'],
			['anathema', 'anathemata'],
			/* Other irregular rules. */
			['ox', 'oxen'],
			['axe', 'axes'],
			['die', 'dice'],
			['yes', 'yeses'],
			['foot', 'feet'],
			['eave', 'eaves'],
			['goose', 'geese'],
			['tooth', 'teeth'],
			['quiz', 'quizzes'],
			['human', 'humans'],
			['proof', 'proofs'],
			['carve', 'carves'],
			['valve', 'valves'],
			['looey', 'looies'],
			['thief', 'thieves'],
			['groove', 'grooves'],
			['pickaxe', 'pickaxes'],
			['passerby', 'passersby']
		].forEach(function (rule) {
			return pluralize_in.addIrregularRule(rule[0], rule[1]);
		});

		/**
		 * Pluralization rules.
		 */
		[
			[/s?$/iu, 's'],
			/* eslint-disable-next-line no-control-regex */
			[/[^\u0000-\u007F]$/iu, '$0'],
			[/([^aeiou]ese)$/iu, '$1'],
			[/(ax|test)is$/iu, '$1es'],
			[/(alias|[^aou]us|t[lm]as|gas|ris)$/iu, '$1es'],
			[/(e[mn]u)s?$/iu, '$1s'],
			[/([^l]ias|[aeiou]las|[ejzr]as|[iu]am)$/iu, '$1'],
			[/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/iu, '$1i'],
			[/(alumn|alg|vertebr)(?:a|ae)$/iu, '$1ae'],
			[/(seraph|cherub)(?:im)?$/iu, '$1im'],
			[/(her|at|gr)o$/iu, '$1oes'],
			[/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|automat|quor)(?:a|um)$/iu, '$1a'],
			[/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)(?:a|on)$/iu, '$1a'],
			[/sis$/iu, 'ses'],
			[/(?:(kni|wi|li)fe|(ar|l|ea|eo|oa|hoo)f)$/iu, '$1$2ves'],
			[/([^aeiouy]|qu)y$/iu, '$1ies'],
			[/([^ch][ieo][ln])ey$/iu, '$1ies'],
			[/(x|ch|ss|sh|zz)$/iu, '$1es'],
			[/(matr|cod|mur|sil|vert|ind|append)(?:ix|ex)$/iu, '$1ices'],
			[/\b((?:tit)?m|l)(?:ice|ouse)$/iu, '$1ice'],
			[/(pe)(?:rson|ople)$/iu, '$1ople'],
			[/(child)(?:ren)?$/iu, '$1ren'],
			[/eaux$/iu, '$0'],
			[/m[ae]n$/iu, 'men'],
			['thou', 'you']
		].forEach(function (rule) {
			return pluralize_in.addPluralRule(rule[0], rule[1]);
		});

		/**
		 * Singularization rules.
		 */
		[
			/* [/s$/iu, ''], */
			[/(ss)$/iu, '$1'],
			[/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/iu, '$1fe'],
			[/(ar|(?:wo|[ae])l|[eo][ao])ves$/iu, '$1f'],
			[/ies$/iu, 'y'],
			[/\b([pl]|zomb|(?:neck|cross)?t|coll|faer|food|gen|goon|group|lass|talk|goal|cut)ies$/iu, '$1ie'],
			[/\b(mon|smil)ies$/iu, '$1ey'],
			[/\b((?:tit)?m|l)ice$/iu, '$1ouse'],
			[/(seraph|cherub)im$/iu, '$1'],
			[/(x|ch|ss|sh|zz|tto|go|cho|alias|[^aou]us|t[lm]as|gas|(?:her|at|gr)o|[aeiou]ris)(?:es)?$/iu, '$1'],
			[/(analy|diagno|parenthe|progno|synop|the|empha|cri|ne)(?:sis|ses)$/iu, '$1sis'],
			[/(movie|twelve|abuse|e[mn]u)s$/iu, '$1'],
			[/(test)(?:is|es)$/iu, '$1is'],
			[/(alumn|syllab|vir|radi|nucle|fung|cact|stimul|termin|bacill|foc|uter|loc|strat)(?:us|i)$/iu, '$1us'],
			[/(agend|addend|millenni|dat|extrem|bacteri|desiderat|strat|candelabr|errat|ov|symposi|curricul|quor)a$/iu, '$1um'],
			[/(apheli|hyperbat|periheli|asyndet|noumen|phenomen|criteri|organ|prolegomen|hedr|automat)a$/iu, '$1on'],
			[/(alumn|alg|vertebr)ae$/iu, '$1a'],
			[/(cod|mur|sil|vert|ind)ices$/iu, '$1ex'],
			[/(matr|append)ices$/iu, '$1ix'],
			[/(pe)(rson|ople)$/iu, '$1rson'],
			[/(child)ren$/iu, '$1'],
			[/(eau)x?$/iu, '$1'],
			[/men$/iu, 'man']
		].forEach(function (rule) {
			return pluralize_in.addSingularRule(rule[0], rule[1]);
		});

		/**
		 * Uncountable rules.
		 */
		[
			/* added */
			'as',
			/* Singular words with no plurals. */
			'adulthood',
			'advice',
			'agenda',
			'aid',
			'aircraft',
			'alcohol',
			'ammo',
			'analytics',
			'anime',
			'athletics',
			'audio',
			'bison',
			'blood',
			'bream',
			'buffalo',
			'butter',
			'carp',
			'cash',
			'chassis',
			'chess',
			'clothing',
			'cod',
			'commerce',
			'cooperation',
			'corps',
			'debris',
			'diabetes',
			'digestion',
			'elk',
			'energy',
			'equipment',
			'excretion',
			'expertise',
			'firmware',
			'flounder',
			'fun',
			'gallows',
			'garbage',
			'graffiti',
			'hardware',
			'headquarters',
			'health',
			'herpes',
			'highjinks',
			'homework',
			'housework',
			'information',
			'jeans',
			'justice',
			'kudos',
			'labour',
			'literature',
			'machinery',
			'mackerel',
			'mail',
			'media',
			'mews',
			'moose',
			'music',
			'mud',
			'manga',
			'news',
			'only',
			'personnel',
			'pike',
			'plankton',
			'pliers',
			'police',
			'pollution',
			'premises',
			'rain',
			'research',
			'rice',
			'salmon',
			'scissors',
			'series',
			'sewage',
			'shambles',
			'shrimp',
			'software',
			'species',
			'staff',
			'swine',
			'tennis',
			'traffic',
			'transportation',
			'trout',
			'tuna',
			'wealth',
			'welfare',
			'whiting',
			'wildebeest',
			'wildlife',
			'you',
			/pok[eé]mon$/iu,
			/* Regexes. */
			/[^aeiou]ese$/iu, /* "chinese", "japanese" */
			/deer$/iu, /* "deer", "reindeer" */
			/fish$/iu, /* "fish", "blowfish", "angelfish" */
			/measles$/iu,
			/o[iu]s$/iu, /* "carnivorous" */
			/pox$/iu, /* "chickpox", "smallpox" */
			/sheep$/iu
		].forEach(pluralize_in.addUncountableRule);

		return pluralize_in;
	})();



	/**
	 * 要素が可視ならtrueを返し、非表示ならfalseを返す。
	 * @param {HTMLElement|null} elem
	 * @returns {boolean}
	 */
	const is_visible = (elem) => {
		if (!elem) {
			return false;
		}
		const bcr = elem.getBoundingClientRect();
		if (bcr.height === 0 || bcr.width === 0) {
			return false;
		}
		return true;
	};

	/**
	 * console.logを取り戻す。
	 */
	const recover_console_log = () => {
		let e_iframe = document.querySelector("iframe");

		if (!e_iframe) {
			e_iframe = document.createElement("iframe");
			if (!e_iframe) {
				return;
			}
			e_iframe.style.display = 'none';
			document.body.append(e_iframe);
		}

		try {
			console.log = e_iframe.contentWindow?.console.log;
		} catch (error) {
			/* cross-origin frame */
			if (g_debug) {
				console.log(`${error.name}: ${error.message}`);
			}

			e_iframe = document.createElement("iframe");
			e_iframe.style.display = 'none';
			document.body.append(e_iframe);

			try {
				console.log = e_iframe.contentWindow?.console.log;
			} catch (error2) {
				/* cross-origin frame(sandbox) */
				if (g_debug) {
					console.log(`nested: ${error2.name}: ${error2.message}`);
				}
			}

		}

	};

	/**
	 * 正規表現で使えうようにメタ文字をエスケープした文字列を返す。
	 * @param {string} s_regexp
	 * @returns {string}
	 */
	const escape_regexp = (s_regexp) => s_regexp.replace(/[()[\]{}*+.$^\\|?]/gu, '\\$&');

	/**
	 * ターゲットノードを置換用ノードの配列と置換する。
	 * @param {Node} N_target
	 * @param {Node[]|NodeList} N_replaced_items
	 */
	const replace_node_with = (N_target, N_replaced_items) => {
		const N_origin = N_target.previousSibling;
		const e_parent = N_target.parentElement;

		N_target.remove();

		/* target_nodeが最初の子ノードかで分岐する。 */
		if (N_origin) {
			N_origin.after(...N_replaced_items);
		} else {
			e_parent?.prepend(...N_replaced_items);
		}
	};

	/**
	 * Pluralizeを使って単数形に変換する。
	 */
	const singular = (s_text) => s_text.replaceAll(/[a-zA-Z]+/gu, (a) => pluralize.singular(a));

	/**
	 * 全角から半角へ変換する。
	 * [Ａ-Ｚａ-ｚ０-９]から[！-～]へ変更して、より多くの全角文字を含めた。
	 * @param {string} s_text
	 */
	const zenkaku2hankaku = (s_text) => s_text.replace(/[！-～]/gu, (a) => String.fromCharCode(a.charCodeAt(0) - 0xFEE0));

	/**
	 * カタカナをひらがなへ変換する。
	 * ゐ,ヰ→い
	 * ゑ,ヱ→え
	 * @param {string} s_text
	 */
	const katakana2hiragana = (s_text) => s_text.replace(/[ァ-ン]/gu, (a) => String.fromCharCode(a.charCodeAt(0) - 0x60)).replaceAll('ゐ', 'い').
		replaceAll('ゑ', 'え');

	const kanjinumber2number_table = {
		'一': 1,
		'二': 2,
		'三': 3,
		'四': 4,
		'五': 5,
		'六': 6,
		'七': 7,
		'八': 8,
		'九': 9
	};

	/**
	 * 漢数字を半角数値に変換する。
	 * @param {string} s_text
	 * @returns {string}
	 */
	const kanjinumber2number = (s_text) => s_text.replace(/[一二三四五六七八九]/gu, (a) => kanjinumber2number_table[a]);

	/**
	 * 引数の文字列を単数形にして、空白文字を除いて、全角を半角にして、カタカナをひらがなにして、漢数字を半角数値にして、小文字に変換する。
	 * （注）空白を除いた後に単数形にできない。
	 * @param {string|null} s_text
	 * @returns {string}
	 */
	const remove_white_spaces_hankaku = (s_text) => kanjinumber2number(katakana2hiragana(zenkaku2hankaku(singular(s_text).replaceAll(/\s+/gu, '')))).toLowerCase();

	/**
	 * textContentに空白文字(\s)が存在することと、単数形・複数形の文字数差を考慮した位置を返す。
	 * @param {number} n_position
	 * @param {string} textContent_arg
	 * @param {{f_include_end_spaces?: boolean}} param2 f_include_end_spacesがtrueなら範囲の後の空白文字を含む。
	 * @returns {number}
	 */
	const get_adjusted_position = (n_position, textContent_arg, { f_include_end_spaces = false } = {}) => {
		const a_convert_items = textContent_arg.split(/([^a-zA-Z]+)/u).map((a) => [a.length, singular(a).length]);

		const textContent = singular(textContent_arg);

		let n_spaces = textContent.substring(0, n_position).match(/\s/gu)?.length ?? 0;

		let n_cursor = n_position;
		let s_cursor;
		while (n_spaces) {
			s_cursor = textContent[n_cursor];

			if (!/^\s$/u.test(s_cursor)) {
				n_spaces -= 1;
			}

			n_cursor += 1;
		}

		if (f_include_end_spaces) {
			s_cursor = textContent[n_cursor];
			for (; /^\s$/u.test(s_cursor);) {
				n_cursor += 1;
				s_cursor = textContent[n_cursor];
			}
		}

		let n_cursor_org = n_cursor;
		let n_sum = 0;
		for (let index = 0; index < a_convert_items.length; index++) {
			const a_convert_item = a_convert_items[index];
			n_sum += a_convert_item[1];

			if (n_sum > n_cursor) {
				break;
			}

			n_cursor_org += a_convert_item[0] - a_convert_item[1];
		}

		return n_cursor_org;
	};

	/**
	 * スタイルシートを追加する。
	 */
	const add_style_sheet = () => {
		const e_style = document.querySelector('#highlight_selection_style');
		if (e_style) {
			return;
		}

		document.head.insertAdjacentHTML('beforeend', `
<style id="highlight_selection_style">
.highlight_selection:not(#a) {
	position: relative;
	padding: 2px 0;
	font-style: normal;
	line-height: inherit;
	background: revert;
	text-shadow: initial;
	font-size: inherit;
}

.highlight_selection[data-s_count_highlights="1"] {
	opacity: 0.8;
    outline: 4px dashed pink!important;
}

/* .highlight_selection[data-s_count_highlights="1"]のopacityがStacking contextを作ってz-indexに影響するため。 */
.highlight_selection:hover {
	z-index: 1000000000;
}

.highlight_selection:hover:before {
    position: absolute;
	top: 100%;
    left: 50%;
    transform: translate(-50%);
    color: white;
    font-size: .8rem;
    background-color: #645b5b;
    padding: .3rem .6rem;
    border-radius: 3px;
    margin-top: 3px;
	z-index: 1000000000;
	content: attr(data-s_count_highlights);
    letter-spacing: 0;
    text-indent: 0;
    line-height: initial;
	width: max-content;
}

.highlight_selection_close:not(#a) {
	position: absolute;
	left: -5px;
	top: -5px;
	background-color: white;
	color: black;
	border: 1px solid;
	user-select: none;
	line-height: 0;
	text-indent: 0;
	padding: 0;
    margin: 0;
    width: auto;
}

.highlight_selection_close:hover:not(#a) {
	color: white;
	background-color: hotpink;
	cursor: pointer;
}

.highlight_selection_close_svg:not(#a) {
	width: 10px;
	height: 10px;
	fill: currentColor;
	max-width: unset;
	margin: 0;
	padding: 0;
}

.highlight_selection_0 {
	color: yellow !important;
	background-color: red !important;
}

.highlight_selection_1 {
	color: #ffff91 !important;
	background-color: #2091eb !important;
}

.highlight_selection_2 {
	color: #b3fcff !important;
	background-color: #085230 !important;
}

.highlight_selection_3 {
	color: blue !important;
	background-color: orange !important;
}

.highlight_selection_4 {
	color: #eee113 !important;
	background-color: #6c0570 !important;
}

.highlight_selection_5 {
	color: #fdcfe7 !important;
	background-color: #006899 !important;
}

.highlight_selection_6 {
	color: lightpink !important;
	background-color: blue !important;
}

.highlight_selection_7 {
	color: #c2ffd9 !important;
	background-color: #e00079 !important;
}

.highlight_selection_8 {
	color: #e1ff92 !important;
	background-color: #1bbb04 !important;
}

.highlight_selection_9 {
	color: #10a235 !important;
	background-color: #e9df27 !important;
}

.highlight_selection_10 {
	color: #f4d83f !important;
	background-color: #904f40 !important;
}

.highlight_selection_11 {
	color: #cefff6 !important;
	background-color: #1a4db6 !important;
}

.highlight_selection_12 {
	color: #321a93 !important;
	background-color: #f78be0 !important;
}

.highlight_selection_13 {
	color: #dfffad !important;
	background-color: #8338ec !important;
}

.highlight_selection_14 {
	color: #e4ffde !important;
	background-color: #cf5a3e !important;
}

.highlight_selection_15 {
	color: #f2e038 !important;
	background-color: #0086a4 !important;
}

.highlight_selection_16 {
	color: #e8fff8 !important;
	background-color: #f75454 !important;
}

.highlight_selection_17 {
	color: #69370b !important;
	background-color: #f4dc02 !important;
}

.highlight_selection_18 {
	color: #ddf1ff !important;
	background-color: #87322a !important;
}

.highlight_selection_19 {
	color: #f3f3ff !important;
	background-color: #5b8db5 !important;
}

.highlight_selection_20 {
	color: #4c02f9 !important;
	background-color: #8ffca0 !important;
}

.highlight_selection_21 {
	color: cyan !important;
	background-color: red !important;
}

.highlight_selection_22 {
	color: #f0ffed !important;
	background-color: #744e67 !important;
}

.highlight_selection_23 {
	color: #ffeeee !important;
	background-color: #18b7cf !important;
}

.highlight_selection_24 {
	color: #03ac6b !important;
	background-color: #f7f5e1 !important;
}

.highlight_selection_25 {
	color: #e5f7ff !important;
	background-color: #f29f18 !important;
}

.highlight_selection_26 {
	color: #3789f1 !important;
	background-color: #f7f701 !important;
}

.highlight_selection_27 {
	color: #fff2d6 !important;
	background-color: #ed5b9d !important;
}

.highlight_selection_28 {
	color: #7f82c5 !important;
	background-color: #e2e3f7 !important;
}

.highlight_selection_29 {
	color: #007a65 !important;
	background-color: #f7bf61 !important;
}

.highlight_selection_30 {
	color: #ed0597 !important;
	background-color: #d0f5f7 !important;
}

.highlight_selection_31 {
	color: #2884b3 !important;
	background-color: #f7c8ca !important;
}

.highlight_selection_32 {
	color: #000091 !important;
	background-color: #f3dfe9 !important;
}

.highlight_selection_33 {
	color: #73fa79 !important;
	background-color: black !important;
}

.highlight_selection_34 {
	color: #fffb00 !important;
	background-color: #8881f0 !important;
}

.highlight_selection_35 {
	color: #f7b0b0 !important;
	background-color: #053530 !important;
}
</style>`);
	};

	/**
	 * 再利用するためにsvgを追加する
	 */
	const add_svg_template = () => {
		const e_svg_template = document.querySelector('#highlight_selection_svg_template');
		if (e_svg_template) {
			return;
		}

		document.body.insertAdjacentHTML('afterbegin',
			`<svg xmlns="http://www.w3.org/2000/svg" style="display:none;" id="highlight_selection_svg_template">
<symbol viewBox="0 0 32 32" id="highlight_selection_close_xlink">
<path d="m32 4-4-4-12 12L4 0 0 4l12 12L0 28l4 4 12-12 12 12 4-4-12-12z"/>
</symbol>
</svg>`);
	};

	/**
	 * 深さ優先探索をして可視テキストを返す
	 * @param {HTMLElement|Node} e_arg
	 * @param {string[]} s_texts
	 * @param {Range} r_selection
	 * @returns
	 */
	const get_visible_text_dfs = (e_arg, s_texts, r_selection) => {

		switch (e_arg.nodeType) {
			case Node.ELEMENT_NODE: {
				if (['SCRIPT', 'STYLE'].includes(e_arg.nodeName.toLocaleUpperCase())) {
					return;
				}

				const e_childNodes = e_arg.childNodes;
				for (let index = 0; index < e_childNodes.length; index++) {
					const e_childNode = e_childNodes[index];
					get_visible_text_dfs(e_childNode, s_texts, r_selection);
				}

				break;
			}

			case Node.TEXT_NODE: {
				if (!is_visible(e_arg.parentElement)) {
					return;
				}

				const s_text = e_arg.textContent;

				if (!s_text) {
					return;
				}

				let f_intersect = false;
				let n_start = 0;
				let n_end = s_text.length;

				if (e_arg === r_selection.startContainer) {
					n_start = r_selection.startOffset;
					f_intersect = true;
				}

				if (e_arg === r_selection.endContainer) {
					n_end = r_selection.endOffset;
					f_intersect = true;
				}

				if (f_intersect) {
					s_texts.push(s_text.substring(n_start, n_end));
				} else {
					if (!r_selection.isPointInRange(e_arg, 0)) {
						return;
					}

					s_texts.push(s_text);
				}

				break;
			}

			default:
				break;
		}
	};

	/**
	 * Rangeのなかの可視テキストを返す。
	 * @param {Range} r_selection
	 * @returns {string}
	 */
	const get_visible_text = (r_selection) => {
		const s_texts = [];
		get_visible_text_dfs(r_selection.commonAncestorContainer, s_texts, r_selection);
		return remove_white_spaces_hankaku(s_texts.join(''));
	};

	/**
	 * 選択したテキストを返す。
	 * @returns {string|undefined}
	 */
	const get_selection_text = () => {
		const selection = getSelection();
		if (!selection || !selection.rangeCount) {
			if (g_debug) {
				console.log('getSelection rangeCount===0');
			}
			return;
		}

		const r_selection = selection.getRangeAt(0);
		const s_selection = get_visible_text(r_selection);

		if (s_selection === "") {
			if (g_debug) {
				console.log('selection === ""');
			}
			return;
		}

		return s_selection;
	};

	/**
	 * document.bodyを深さ優先探索して、配列o_texts（初期値空）のデータを作成する。
	 * @param {HTMLElement|Node} e_arg
	 * @param {object[]} o_texts
	 * @returns
	 */
	const body_dfs = (e_arg, o_texts) => {
		switch (e_arg.nodeType) {
			case Node.ELEMENT_NODE: {
				if (['SCRIPT', 'STYLE'].includes(e_arg.nodeName.toLocaleUpperCase())) {
					return;
				}

				/**
				 * iframeの中の要素にもアクセスできる場合、アクセスする。
				 */
				const e_frame_childNodes = e_arg.contentDocument?.body?.childNodes;
				if (e_frame_childNodes) {
					for (let index = 0; index < e_frame_childNodes.length; index++) {
						const e_frame_childNode = e_frame_childNodes[index];
						body_dfs(e_frame_childNode, o_texts);
					}
				}

				const e_childNodes = e_arg.childNodes;
				for (let index = 0; index < e_childNodes.length; index++) {
					const e_childNode = e_childNodes[index];
					body_dfs(e_childNode, o_texts);
				}

				break;
			}

			case Node.TEXT_NODE: {
				if (!is_visible(e_arg.parentElement)) {
					return;
				}

				const s_text = remove_white_spaces_hankaku(e_arg.textContent);

				if (s_text === '') {
					return;
				}

				o_texts.push({
					s_text,
					"node": e_arg
				});

				break;
			}

			default:
				break;
		}
	};

	/**
	 * o_textsのindexを更新する。
	 * @param {object[]} o_texts
	 */
	const update_index = (o_texts) => {
		let sum_index = 0;

		for (let index = 0; index < o_texts.length; index++) {
			const o_text = o_texts[index];

			o_text.index_from = sum_index;

			const { s_text } = o_text;
			const n_text = s_text.length;

			o_text.index_to = sum_index + n_text;

			sum_index += n_text;
		}
	};

	/**
	 * s_whole_textのなかでs_selectionの開始位置を示す配列n_indexesを返す。
	 * @param {string} s_selection
	 * @param {string} s_whole_text
	 * @returns {number[]}
	 */
	const get_indexes = (s_selection, s_whole_text) => {
		const R_selection = new RegExp(escape_regexp(s_selection), 'gui');

		const ma = [...s_whole_text.matchAll(R_selection)];
		return ma.map((a) => a.index);
	};

	/**
	 * s_selectionの開始位置(n_index)が占めるノードの位置を返す。
	 * @param {number} n_index 配列n_indexesのなかの一つで、s_selectionの開始位置。
	 * @param {object[]} o_texts index_fromやindex_toを計算したオブジェクトo_textの配列。
	 * @param {{f_return_object?:boolean, f_is_end?:boolean}} param f_return_objectがtrueならo_texts[index]を返し、false（デフォルト）ならindexを返す。f_is_endがtrueなら終了位置を探すモードになり、false（デフォルト）なら開始位置を探すモードになる
	 * @returns {number|object}
	 */
	const get_text_object = (n_index, o_texts, { f_return_object = false, f_is_end = false } = {}) => {
		for (let index = 0; index < o_texts.length; index++) {
			const o_text = o_texts[index];

			const condition = f_is_end
				? o_text.index_to >= n_index
				: o_text.index_to > n_index;
			if (condition) {
				if (f_return_object) {
					return o_text;
				}
				return index;
			}
		}
		throw new Error(`not found at get_text_object(${n_index}) `);
	};

	/**
	 * n_indexesをCustom Range（startとendを示す）の配列に変換する。
	 * @param {number[]} n_indexes
	 * @param {object[]} o_texts
	 * @param {number} n_length s_selectionの長さ。
	 */
	const get_custom_ranges = (n_indexes, o_texts, n_length) => {

		const r_items = [];
		for (let index = 0; index < n_indexes.length; index++) {
			const n_index = n_indexes[index];

			const n_text_index = get_text_object(n_index, o_texts);
			const n_text_index_end = get_text_object(n_index + n_length, o_texts, { "f_is_end": true });

			/**
			 * o_texts[start.index]の位置start.posから
			 * o_texts[end.index]の位置end.posまでがハイライトの対象範囲。
			 */
			const o_custom_range = {
				"start": {
					"index": n_text_index,
					"pos": n_index - o_texts[n_text_index].index_from
				},
				"end": {
					"index": n_text_index_end,
					"pos": n_index + n_length - o_texts[n_text_index_end].index_from
				},
				"n_counter": index
			};

			r_items.push(o_custom_range);
		}
		return r_items;
	};

	/**
	 * ノードごとにまとめたcustom rangeを返す。
	 * @param {object[]} o_custom_ranges
	 * @param {object[]} o_texts
	 * @param {number} n_length s_selectionの長さ。
	 * @param {string} s_selection
	 * @param {number} n_highlight_selection_serial_color
	 * @returns {Map}
	 */
	const get_custom_ranges_by_node = (o_custom_ranges, o_texts, n_length, s_selection, n_highlight_selection_serial_color) => {
		const M_results = new Map();

		for (let index = 0; index < o_custom_ranges.length; index++) {
			const custom_range = o_custom_ranges[index];
			const custom_range_start_index = custom_range.start.index;
			const custom_range_end_index = custom_range.end.index;

			for (let custom_range_index = custom_range_start_index; custom_range_index <= custom_range_end_index; custom_range_index++) {
				const o_text = o_texts[custom_range_index];
				const { node } = o_text;
				let M_result;

				const f_is_highlighted = Boolean(node.parentElement.closest('.highlight_selection'));
				const f_is_equal_text = remove_white_spaces_hankaku(node.textContent) === s_selection;
				const f_is_same_color = node.parentElement.classList?.contains(`highlight_selection_serial_${n_highlight_selection_serial_color}`);

				if (f_is_highlighted && !f_is_equal_text && !f_is_same_color) {
					continue;
				}

				if (M_results.has(node)) {
					M_result = M_results.get(node);

				} else {
					M_result = {
						node,
						"custom_ranges": []
					};

					M_results.set(node, M_result);
				}

				switch (custom_range_index) {
					case custom_range_start_index:
						M_result.custom_ranges.push({
							"start": custom_range.start.pos,
							"end": Math.min(o_text.s_text.length, custom_range.start.pos + n_length),
							"n_counter": custom_range.n_counter,
							f_is_highlighted,
							f_is_equal_text
						});

						break;

					case custom_range_end_index:
						M_result.custom_ranges.push({
							"start": 0,
							"end": custom_range.end.pos,
							"n_counter": custom_range.n_counter,
							f_is_highlighted,
							f_is_equal_text
						});

						break;

					default:
						/**
						 * custom_range_start_indexとcustom_range_end_indexの間のとき。
						 */
						M_result.custom_ranges.push({
							"start": 0,
							"end": o_text.s_text.length,
							"n_counter": custom_range.n_counter,
							f_is_highlighted,
							f_is_equal_text
						});

						break;
				}
			}
		}

		return M_results;
	};

	/**
	 * 要素のdataset.s_count_highlightsに保存するテキストを返す。
	 * @param {number} n_count_highlights
	 * @param {number} n_counter2
	 * @returns {string}
	 */
	const get_count_highlights_text = (n_count_highlights, n_counter2) => n_count_highlights === 1
		? '1'
		: `${n_count_highlights} (↑${n_counter2}↓${n_count_highlights - n_counter2 - 1})`;

	/**
	 * テキストをハイライトした要素を返す。
	 * @param {string} text
	 * @param {number} n_highlight_selection_serial_color
	 * @param {number} n_max_highlight_selection_color
	 * @param {number} n_count_highlights
	 * @param {object} sorted_custom_range
	 * @returns {Element}
	 */
	const get_marked_node = (text, n_highlight_selection_serial_color, n_max_highlight_selection_color, n_count_highlights, sorted_custom_range) => {
		const { n_counter2 } = sorted_custom_range;
		const n_highlight_selection_color = n_highlight_selection_serial_color % n_max_highlight_selection_color;

		const e_mark = document.createElement("mark");
		e_mark.classList.add('highlight_selection', `highlight_selection_${n_highlight_selection_color}`, `highlight_selection_serial_${n_highlight_selection_serial_color}`);
		e_mark.textContent = text;

		e_mark.dataset.s_count_highlights = get_count_highlights_text(n_count_highlights, n_counter2);

		return e_mark;
	};

	/**
	 * テキストノードのテキストをハイライト後に得られる置換ノードの配列を返す。
	 * @param {object} o_custom_range_value
	 * @param {number} n_highlight_selection_serial_color
	 * @param {number} n_max_highlight_selection_color
	 * @param {number} n_count_highlights
	 * @returns {(Node)[]}
	 */
	const get_marked_nodes = (o_custom_range_value, n_highlight_selection_serial_color, n_max_highlight_selection_color, n_count_highlights) => {
		const a_results = [];

		const { node } = o_custom_range_value;
		const { textContent } = node;

		const sorted_custom_ranges = o_custom_range_value.custom_ranges.sort((a, b) => a.start > b.start ? 1 : -1);

		let n_cursor = 0;

		let sorted_custom_range;
		let s_focus;

		for (let index = 0; index < sorted_custom_ranges.length; index++) {
			sorted_custom_range = sorted_custom_ranges[index];

			s_focus = textContent.substring(n_cursor, get_adjusted_position(sorted_custom_range.start, textContent, { "f_include_end_spaces": true }));

			if (s_focus !== '') {
				a_results.push(document.createTextNode(s_focus));
			}

			const pos_end = get_adjusted_position(sorted_custom_range.end, textContent);
			s_focus = textContent.substring(get_adjusted_position(sorted_custom_range.start, textContent, { "f_include_end_spaces": true }), pos_end);

			a_results.push(get_marked_node(s_focus, n_highlight_selection_serial_color, n_max_highlight_selection_color, n_count_highlights, sorted_custom_range));

			n_cursor = pos_end;
		}

		s_focus = textContent.substring(get_adjusted_position(sorted_custom_range.end, textContent));

		if (s_focus !== '') {
			a_results.push(document.createTextNode(s_focus));
		}

		return a_results;
	};

	/**
	 * ハイライト色の連続番号を返す。
	 * 最大の色番号を超えたとき色番号を0に戻さないのは、最大の色番号を超えたときに作られた色番号のハイライトを削除したとき、超えた色番号のハイライトのみを削除し、0の色番号のハイライトを削除しないため。
	 * 「highlight_selection_番号」と「highlight_selection_serial_連続番号」の2つのクラスをハイライト対象の要素に付与する。
	 * @returns {number}
	 */
	const get_highlight_selection_serial_color = () => {
		const n_highlight_selection_serial_color = document.documentElement.dataset.n_highlight_selection_serial_color_current;

		if (typeof n_highlight_selection_serial_color !== 'undefined') {
			return Number(n_highlight_selection_serial_color) + 1;
		}
		return 0;
	};

	/**
	 * ハイライト色の最大番号を返す。
	 * @returns {number}
	 */
	const get_max_highlight_selection_color = () => {
		const e_style = document.querySelector('#highlight_selection_style');

		return e_style.textContent.match(/highlight_selection_\d+/gu).length;
	};

	/**
	 * o_custom_rangeのプロパティn_counter2にハイライトの連番を割り振る。ハイライトの数を返す。
	 * @param {object[]} o_custom_range_values
	 * @returns {number}
	 */
	const count_highlights = (o_custom_range_values) => {
		let n_max_counter = -1;
		let n_counter2 = -1;

		for (let n_index = 0; n_index < o_custom_range_values.length; n_index++) {
			const o_custom_range_value = o_custom_range_values[n_index];
			const o_custom_ranges = o_custom_range_value.custom_ranges;

			for (let n_index2 = 0; n_index2 < o_custom_ranges.length; n_index2++) {
				const o_custom_range = o_custom_ranges[n_index2];

				if (o_custom_range.n_counter > n_max_counter) {
					n_max_counter = o_custom_range.n_counter;
					n_counter2++;
					o_custom_range.n_counter2 = n_counter2;
				} else {
					o_custom_range.n_counter2 = n_counter2;
				}
			}
		}

		return n_counter2 + 1;
	};

	/**
	 * o_custom_range_value.custom_rangesの配列にf_is_highlightedがtrueかつf_is_equal_textがtrueのアイテムが含まれているかどうかを返す。
	 * @param {object} o_custom_range_value
	 * @returns {boolean}
	 */
	const has_equal_highlight = (o_custom_range_value) => o_custom_range_value.custom_ranges.length === 1
		&& o_custom_range_value.custom_ranges[0].f_is_highlighted && o_custom_range_value.custom_ranges[0].f_is_equal_text;

	/**
	 * 閉じるボタンを押したハイライトを削除する。
	 * @param {HTMLElement} e_highlight_selection_target
	 * @returns
	 */
	const remove_highlight_selections = (e_highlight_selection_target) => {
		const m = e_highlight_selection_target.className.match(/\bhighlight_selection_serial_(\d+)\b/u);
		const s_highlight_selection = m[1];

		const e_items = document.querySelectorAll(`.highlight_selection_serial_${s_highlight_selection}`);

		for (let index = 0; index < e_items.length; index++) {
			const e_item = e_items[index];

			if (!e_item.isConnected) {
				continue;
			}

			if (!e_item.parentElement) {
				console.log('e_item.parentElement not found', e_item.parentElement);
				return;
			}

			let prev_text_node = null;
			const child_nodes = [...e_item.parentElement.childNodes];

			for (let child_nodes_index = 0; child_nodes_index < child_nodes.length; child_nodes_index++) {
				const child_node = child_nodes[child_nodes_index];

				if (child_node.classList?.contains(`highlight_selection_serial_${s_highlight_selection}`)) {
					if (child_node.childNodes.length === 1 && child_node.firstChild.nodeType === Node.TEXT_NODE) {
						if (prev_text_node) {
							prev_text_node.textContent += child_node.textContent;
						} else {
							prev_text_node = child_node.lastChild;

							replace_node_with(child_node, child_node.childNodes);

							if (prev_text_node.nodeType !== Node.TEXT_NODE) {
								prev_text_node = null;
							}
						}

						child_node.remove();
					} else {
						replace_node_with(child_node, child_node.childNodes);

						prev_text_node = null;
					}


				} else if (child_node.nodeType === Node.TEXT_NODE) {
					if (prev_text_node) {
						prev_text_node.textContent += child_node.textContent;
						child_node.remove();
					} else {
						prev_text_node = child_node;
					}
				} else {
					prev_text_node = null;
				}
			}

		}

		if (document.documentElement.dataset.n_highlight_selection_serial_color_current === s_highlight_selection) {
			const n_current = Number(s_highlight_selection);
			document.documentElement.dataset.n_highlight_selection_serial_color_current = String(n_current - 1);
		}
	};

	/**
	 * AutoPagerizeまたはハイライト削除時に、要素におけるハイライト数を更新する。
	 * @param {HTMLElement} e_highlight
	 * @param {number} n_count_highlights
	 */
	const update_highlight = (e_highlight, n_count_highlights, o_custom_range_value) => {
		const { n_counter2 } = o_custom_range_value.custom_ranges[0];

		e_highlight.dataset.s_count_highlights = get_count_highlights_text(n_count_highlights, n_counter2);
	};

	/**
	 * テキストに対してハイライトを実行する。
	 * @param {string} s_selection
	 * @param {number} n_highlight_selection_serial_color
	 */
	const highlight_text = (s_selection, n_highlight_selection_serial_color) => {
		if (g_debug) {
			console.log('highlight_text start');
		}

		const o_texts = [];

		body_dfs(document.body, o_texts);

		update_index(o_texts);

		const s_whole_text = o_texts.map((a) => a.s_text).join('');

		/**
		 * 「選択範囲の文字列がs_whole_textのどの位置にあるか」についての開始位置の配列。
		 */
		const n_indexes = get_indexes(s_selection, s_whole_text);

		/**
		 * 「ハイライト文字列が配列o_texts[start]の文字列のどの位置から配列o_texts[end]の文字列のどの位置までにあるか」についての配列。
		 */
		const o_custom_ranges = get_custom_ranges(n_indexes, o_texts, s_selection.length);

		/**
		 * テキストノードをキーにしたノードごとのMapで、そのテキストノードのハイライト文字列の開始・終了位置の配列のプロパティなどを持つオブジェクトを持つ。
		 */
		const M_custom_ranges_by_node = get_custom_ranges_by_node(o_custom_ranges, o_texts, s_selection.length, s_selection, n_highlight_selection_serial_color);

		/**
		 * そのテキストノードのハイライト文字列の開始・終了位置の配列のプロパティなどを持つオブジェクトの配列。
		 */
		const o_custom_range_values = [...M_custom_ranges_by_node.values()];

		const n_max_highlight_selection_color = get_max_highlight_selection_color();

		const n_count_highlights = count_highlights(o_custom_range_values);

		for (let index = 0; index < o_custom_range_values.length; index++) {
			const o_custom_range_value = o_custom_range_values[index];

			if (has_equal_highlight(o_custom_range_value)) {
				/**
				 * AutoPagerizeまたはハイライト削除時。
				 */
				const e_highlight_selection = o_custom_range_value.node.parentElement.closest('.highlight_selection');
				update_highlight(e_highlight_selection, n_count_highlights, o_custom_range_value);
				continue;
			}

			const N_marked_items = get_marked_nodes(o_custom_range_value, n_highlight_selection_serial_color, n_max_highlight_selection_color, n_count_highlights);
			if (N_marked_items.length) {
				replace_node_with(o_custom_range_value.node, N_marked_items);
			}
		}
	};

	/**
	 * n_intervalの間、mutationsが発生しなかったらc_mutations_endを実行する。
	 * @param {function} c_mutations_end
	 * @param {number} n_interval
	 * @param {Element|Document} e_base
	 * @returns
	 */
	const add_callback_mutations_end = (c_mutations_end, n_interval = 2000, e_base = document) => {
		let n_mutation_timeout = null;

		const config = {
			"attributes": false,
			"characterData": false,
			"childList": true,
			"subtree": true
		};

		/**
		 * MutationObserverのコールバック。
		 * @param {MutationRecord[]} mutations
		 * @returns
		 */ /* eslint-disable-next-line no-unused-vars */
		const mutation_callback = (mutations) => {
			if (mutations.every((a) => a.addedNodes.length === 0)) {
				/**
				 * シンプル化のためaddedNodesが1つもなければスキップ。
				 */
				return;
			}

			if (g_debug > 2) {
				console.log('mutation_callback', mutations);
			}

			if (mutations.some((a) => a.addedNodes[0]?.className?.toLowerCase().includes('highlight_selection'))) {
				/**
				 * ハイライトをマウスオーバーした場合などでスキップ。
				 */
				return;
			}

			if (mutations[0]?.addedNodes[0]?.style?.position === 'fixed') {
				/**
				 * smartUp Gesturesの右クリックで追加される要素を含めてシンプルに対応。
				 */
				return;
			}

			clearTimeout(n_mutation_timeout);

			if (g_count_mutation_start < g_max_count_mutation_start) {

				n_mutation_timeout = setTimeout(() => {

					/* eslint-disable-next-line callback-return */
					c_mutations_end();

					g_count_mutation_start += 1;

				}, n_interval);
			}
		};

		const M_observer = new MutationObserver(mutation_callback);
		M_observer.observe(e_base, config);

		/**
		 * 再接続(reconnect)するときに引数が必要なのでオブジェクトM_observer_controllerを作成。
		 */
		const M_observer_controller = {
			"disconnect": () => {
				M_observer.disconnect();
			},
			"reconnect": () => {
				M_observer.observe(e_base, config);
			}
		};

		return M_observer_controller;
	};

	/**
	 * 追加されたページに対して再ハイライトする。
	 * 同じ関数内で対応すると複雑になりそうだったのでmain関数をコピペして一部を書き換えた。
	 * 主な変更点はo_custom_ranges_by_nodeの中でハイライト済のものをスキップさせた。
	 * @param {number} n_highlight_selection_serial_color
	 */
	const re_highlight = (n_highlight_selection_serial_color) => {
		const s_class = `.highlight_selection_serial_${n_highlight_selection_serial_color}`;
		const e_highlighted = document.querySelector(s_class);
		if (!e_highlighted) {
			return;
		}

		const s_selection = remove_white_spaces_hankaku(e_highlighted.textContent);

		highlight_text(s_selection, n_highlight_selection_serial_color);
	};

	/**
	 * mutationsが一定時間、発生しなかったときに再ハイライトを実行する関数。
	 */
	const start_re_highlight = () => {
		if (g_debug) {
			console.log('re_highlight start');
		}

		if (Object.hasOwn(window, "M_highlight_selection_observer_controller")) {
			/**
			 * MutationObserverに対応。
			 */
			window.M_highlight_selection_observer_controller.disconnect();
		}

		if (typeof document.documentElement.dataset.n_highlight_selection_serial_color_current === 'undefined') {
			return;
		}

		const n_highlight_selection_serial_color_current = Number(document.documentElement.dataset.n_highlight_selection_serial_color_current);

		for (let index = 0; index <= n_highlight_selection_serial_color_current; index++) {
			re_highlight(index);
		}

		if (Object.hasOwn(window, "M_highlight_selection_observer_controller")) {
			/**
			 * MutationObserverに対応。
			 */
			window.M_highlight_selection_observer_controller.reconnect();
		}

		if (g_debug) {
			console.log('re_highlight done');
		}
	};

	/**
	 * .highlight_selectionをmouseoverしたら閉じるボタンを表示するイベントリスナーを追加する。
	 */
	const add_close_button_event = () => {
		let c_mouseleave_sub_timeout_id;

		/**
		 * 要素に閉じるボタンがあればtrueを返す。
		 * @param {HTMLElement} e_target
		 * @returns {boolean|undefined}
		 */
		const has_close = (e_target) => e_target.lastElementChild?.classList.contains('highlight_selection_close');

		/**
		 * .highlight_selectionをmouseoverしたら閉じるボタンを表示する。
		 * @param {MouseEvent} e
		 */
		const c_mouseover = (e) => {
			/** @type {HTMLElement|null} */
			const e_target = e.target;
			if (!e_target) {
				throw new Error('!e_target at c_mouseover');
			}
			if (e_target.classList.contains('highlight_selection')) {
				e.stopPropagation();
				e.stopImmediatePropagation();

				if (g_debug > 2) {
					console.log('c_mouseover', e_target);
				}

				clearTimeout(c_mouseleave_sub_timeout_id);

				if (has_close(e_target)) {
					return;
				}

				document.querySelectorAll('.highlight_selection_close').forEach((a) => a.remove());

				e_target.insertAdjacentHTML('beforeend', '<span class="highlight_selection_close"><svg class="highlight_selection_close_svg"><use xlink:href="#highlight_selection_close_xlink"/></svg></span>');
				const e_close = e_target.querySelector(".highlight_selection_close");
				if (!e_close) {
					throw new Error('Unexpected e_close. Never here.');
				}

				/**
				 * 閉じるボタンをclickしたらハイライトを削除する。
				 * @param {MouseEvent} e
				 */
				const c_mousedown = (e) => {
					if (e.button !== 0) {
						/**
						 * 左ボタンでなければイベント関数を終了する。
						 */
						return;
					}

					e.stopPropagation();
					e.stopImmediatePropagation();

					/** @type {HTMLElement | null} */
					const e_highlight_selection = e_close.closest('.highlight_selection');
					if (!e_highlight_selection) {
						throw new Error('Unexpected e_highlight_selection. Never here.');
					}

					if (Object.hasOwn(window, "M_highlight_selection_observer_controller")) {
						/**
						 * MutationObserverに対応。
						 */
						window.M_highlight_selection_observer_controller.disconnect();
					}

					/**
					 * e_closeを削除することでclickイベントが発生しない。
					 */
					e_close.remove();

					remove_highlight_selections(e_highlight_selection);

					start_re_highlight();

					if (Object.hasOwn(window, "M_highlight_selection_observer_controller")) {
						/**
						 * MutationObserverに対応。
						 */
						window.M_highlight_selection_observer_controller.reconnect();
					}
				};

				e_close.addEventListener('mousedown', c_mousedown, {
					"capture": true
				});

				/**
				 * 行末を少し超えるハイライトをマウスオーバーしたとき明滅を素早く繰り返すことがある。
				 * その対処として、時間差を空けるためのサブ関数。
				 * @param {()=>void} c_mouseleave
				 */
				const c_mouseleave_sub = (c_mouseleave) => {
					e_target.removeEventListener('mouseleave', c_mouseleave);

					e_close.removeEventListener('mousedown', c_mousedown, {
						"capture": true
					});
					e_close.remove();
				};

				/**
				 * .highlight_selectionをmouseleaveしたら閉じるボタンを削除する。
				 */
				const c_mouseleave = () => {
					c_mouseleave_sub_timeout_id = setTimeout(() => c_mouseleave_sub(c_mouseleave), 500);
				};

				e_target.addEventListener('mouseleave', c_mouseleave);
			}
		};

		/**
		 * ダブルクリックしたときキーワード全体を選択する。
		 * @param {MouseEvent} e
		 */
		const c_dblclick = (e) => {
			const e_hs = e.target?.closest('.highlight_selection');

			if (!e_hs) {
				return;
			}

			e.preventDefault();

			const o_selection = getSelection();
			o_selection?.selectAllChildren(e_hs);
		};

		/**
		 * 一度だけ起動させ、常駐イベントリスナーとする。
		 * n_highlight_selection_serial_color_currentの値は終了前処理（finalize）で設定する。
		 */
		if (!document.documentElement.dataset.n_highlight_selection_serial_color_current) {
			document.addEventListener('mouseover', c_mouseover, {
				"capture": true
			});

			document.addEventListener('dblclick', c_dblclick, {
				"capture": true
			});
		}
	};

	/**
	 * 開始前処理
	 */
	const initialize = () => {
		g_count_mutation_start = 0;

		if (Object.hasOwn(window, "M_highlight_selection_observer_controller")) {
			/**
			 * MutationObserverに対応。
			 */
			window.M_highlight_selection_observer_controller.disconnect();
		}

		recover_console_log();

		add_style_sheet();
		add_svg_template();
	};

	/**
	 * 終了前処理
	 * @param {number} n_highlight_selection_serial_color
	 */
	const finalize = (n_highlight_selection_serial_color) => {
		document.documentElement.dataset.n_highlight_selection_serial_color_current = String(n_highlight_selection_serial_color);

		getSelection()?.empty();

		if (Object.hasOwn(window, "M_highlight_selection_observer_controller")) {
			/**
			 * MutationObserverに対応。
			 */
			window.M_highlight_selection_observer_controller.reconnect();
		}

		if (!Object.hasOwn(window, "M_highlight_selection_observer_controller")) {
			/* 一度だけ実行 */
			window.M_highlight_selection_observer_controller = add_callback_mutations_end(start_re_highlight);
		}
	};

	/**
	 * メイン関数
	 */
	const main = () => {
		console.log(`highlight_selection_bookmark.js: v${g_version}`);

		initialize();

		if (g_debug) {
			console.log('highlight_selection start');
		}

		const s_selection = get_selection_text();

		if (!s_selection) {
			return;
		}

		const n_highlight_selection_serial_color = get_highlight_selection_serial_color();
		highlight_text(s_selection, n_highlight_selection_serial_color);

		add_close_button_event();

		finalize(n_highlight_selection_serial_color);
	};

	if (typeof chrome === "undefined" || typeof chrome.runtime === 'undefined') {
		/**
		 * ブックマークレットから起動したとき。Firefoxのとき。
		 */
		main();

		if (g_debug) {
			console.log('done');
		}
	} else {
		/**
		 * Chrome拡張機能のコンテキストメニューから起動したとき。
		 */
		chrome.runtime.onMessage.addListener(
			(message, sender, sendResponse) => {
				if (message !== g_message) {
					if (g_debug) {
						console.log('onMessage unexpected');
					}

					return;
				}

				main();

				sendResponse('done');

				if (g_debug) {
					console.log('onMessage done');
				}
			}
		);
	}
})();
