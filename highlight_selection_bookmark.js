javascript: (() => {/* eslint-disable-line no-unused-labels */
	const g_debug = 0;

	/**
	 * 要素が可視ならtrueを返し、非表示ならfalseを返す。
	 * @param {HTMLElement} elem
	 * @returns {boolean}
	 */
	const is_visible = (elem) => {
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
			e_iframe.style.display = 'none';
			document.body.append(e_iframe);
		}

		try {
			console.log = e_iframe.contentWindow.console.log;
		} catch (error) {
			/* cross-origin frame */
			if (g_debug) {
				console.log(`${error.name}: ${error.message}`);
			}

			e_iframe = document.createElement("iframe");
			e_iframe.style.display = 'none';
			document.body.append(e_iframe);

			try {
				console.log = e_iframe.contentWindow.console.log;
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
	 * @param {node} N_target
	 * @param {node[]} N_replaced_items
	 */
	const replace_node_with = (N_target, N_replaced_items) => {
		const N_origin = N_target.previousSibling;
		const e_parent = N_target.parentElement;

		N_target.remove();

		/* target_nodeが最初の子ノードかで分岐する。 */
		if (N_origin) {
			N_origin.after(...N_replaced_items);
		} else {
			e_parent.prepend(...N_replaced_items);
		}
	};

	/**
	 * 引数のNodeに対するユニークキーを返す。
	 */
	const get_node_key = (() => {
		let n_key = 0;

		/**
		 * @param {Node} N_arg
		 * @returns {string}
		 */
		return (N_arg) => {
			if (typeof N_arg.n_key === 'undefined') {
				N_arg.n_key = n_key;
				n_key += 1;
			}

			return String(N_arg.n_key);
		};
	})();

	/**
	 * 全角から半角へ変換する。
	 * @param {string} s_text
	 */
	const zenkaku2hankaku = (s_text) => s_text.replace(/[Ａ-Ｚａ-ｚ０-９]/gu, (a) => String.fromCharCode(a.charCodeAt(0) - 0xFEE0));

	/**
	 * 引数の文字列から空白文字を除いて、全角を半角にして返す。
	 * @param {string} s_text
	 * @returns {string}
	 */
	const remove_white_spaces_hankaku = (s_text) => zenkaku2hankaku(s_text.replaceAll(/\s+/gu, ''));

	/**
	 * textContentに空白文字(\s)が存在することを考慮した位置を返す。
	 * @param {number} n_position
	 * @param {string} textContent
	 * @param {boolean} f_include_end_spaces trueなら範囲の後の空白文字を含む。
	 * @returns {number}
	 */
	const get_adjusted_position = (n_position, textContent, { f_include_end_spaces = false } = {}) => {
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

		return n_cursor;
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
.highlight_selection {
	position: relative;
	padding: 2px 0;
	font-style: normal;
	line-height: 1.3;
}

.highlight_selection_close {
	position: absolute;
	left: -5px;
	top: -5px;
	background-color: white;
	color: black;
	border: 1px solid;
	user-select: none;
	line-height: 0;
	max-width: unset;
	text-indent: 0;
}

.highlight_selection_close:hover {
	color: white;
	background-color: hotpink;
	cursor: pointer;
}

.highlight_selection_close_svg {
	width: 10px;
	height: 10px;
	fill: currentColor;
	max-width: unset;
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
	background-color: #d0f5f7
}

.highlight_selection_31 {
	color: #2884b3 !important;
	background-color: #f7c8ca
}

.highlight_selection_32 {
	color: #000091 !important;
	background-color: #f3dfe9 !important;
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
<symbol viewBox="0 0 512 512" id="highlight_selection_close_xlink">
<g>
 <polygon points="511.998,70.682 441.315,0 256.002,185.313 70.685,0 0.002,70.692 185.316,256.006 0.002,441.318 70.69,512 256.002,326.688 441.315,512 511.998,441.318 326.684,256.006"></polygon>
</g>
</symbol>
</svg>`);
	};

	/**
	 * 深さ優先探索をして可視テキストを返す
	 * @param {HTMLElement} e_arg
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

				if (s_text === '') {
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
	 * @returns {string}
	 */
	const get_selection_text = () => {
		const selection = getSelection();
		if (!selection.rangeCount) {
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
	 * @param {HTMLElement} e_arg
	 * @param {object[]} o_texts
	 * @returns
	 */
	const body_dfs = (e_arg, o_texts) => {
		switch (e_arg.nodeType) {
			case Node.ELEMENT_NODE: {
				if (['SCRIPT', 'STYLE'].includes(e_arg.nodeName.toLocaleUpperCase())) {
					return;
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

			const s_text = o_text.s_text;
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
	 * @param {boolean} f_return_object trueならo_texts[index]を返し、false（デフォルト）ならindexを返す。
	 * @param {boolean} f_is_end trueなら終了位置を探すモードになり、false（デフォルト）なら開始位置を探すモードになる。
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
		throw new Error('not found at get_node', n_index);
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
			const custom_range = {
				"start": {
					"index": n_text_index,
					"pos": n_index - o_texts[n_text_index].index_from
				},
				"end": {
					"index": n_text_index_end,
					"pos": n_index + n_length - o_texts[n_text_index_end].index_from
				}
			};

			r_items.push(custom_range);
		}
		return r_items;
	};

	/**
	 * ノードごとにまとめたcustom rangeを返す。
	 * @param {object[]} o_custom_ranges
	 * @param {object[]} o_texts
	 * @param {number} n_length s_selectionの長さ。
	 * @returns {object}
	 */
	const get_custom_ranges_by_node = (o_custom_ranges, o_texts, n_length) => {
		const o_results = {};

		for (let index = 0; index < o_custom_ranges.length; index++) {
			const custom_range = o_custom_ranges[index];
			const custom_range_start_index = custom_range.start.index;
			const custom_range_end_index = custom_range.end.index;

			for (let custom_range_index = custom_range_start_index; custom_range_index <= custom_range_end_index; custom_range_index++) {
				const o_text = o_texts[custom_range_index];
				const node = o_text.node;
				const s_key = get_node_key(node);
				let o_result;

				if (Object.prototype.hasOwnProperty.call(o_results, s_key)) {
					o_result = o_results[s_key];

					console.assert(node === o_result.node);
				} else {
					o_result = {
						node,
						s_key,
						"custom_ranges": []
					};

					o_results[s_key] = o_result;
				}

				switch (custom_range_index) {
					case custom_range_start_index:
						o_result.custom_ranges.push({
							"start": custom_range.start.pos,
							"end": Math.min(o_text.s_text.length, custom_range.start.pos + n_length)
						});

						break;

					case custom_range_end_index:
						o_result.custom_ranges.push({
							"start": 0,
							"end": custom_range.end.pos
						});

						break;

					default:
						/**
						 * custom_range_start_indexとcustom_range_end_indexの間のとき。
						 */
						o_result.custom_ranges.push({
							"start": 0,
							"end": o_text.s_text.length
						});

						break;
				}
			}
		}

		return o_results;
	};

	/**
	 * テキストをハイライトした要素を返す。
	 * @param {string} text
	 * @param {number} n_highlight_selection_serial_color
	 * @param {number} n_max_highlight_selection_color
	 * @returns {element}
	 */
	const get_marked_node = (text, n_highlight_selection_serial_color, n_max_highlight_selection_color) => {
		const n_highlight_selection_color = n_highlight_selection_serial_color % n_max_highlight_selection_color;

		const e_mark = document.createElement("mark");
		e_mark.classList.add(`highlight_selection`, `highlight_selection_${n_highlight_selection_color}`, `highlight_selection_serial_${n_highlight_selection_serial_color}`);
		e_mark.textContent = text;

		return e_mark;
	};

	/**
	 * テキストノードのテキストをハイライト後に得られる置換ノードの配列を返す。
	 * @param {object} o_custom_range_value
	 * @param {number} n_highlight_selection_serial_color
	 * @param {number} n_max_highlight_selection_color
	 * @returns {null|(element|string)[]}
	 */
	const get_marked_nodes = (o_custom_range_value, n_highlight_selection_serial_color, n_max_highlight_selection_color) => {
		const a_results = [];

		const node = o_custom_range_value.node;
		const textContent = node.textContent;

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

			a_results.push(get_marked_node(s_focus, n_highlight_selection_serial_color, n_max_highlight_selection_color));

			n_cursor = pos_end;
		}

		s_focus = textContent.substring(get_adjusted_position(sorted_custom_range.end, textContent));

		if (s_focus !== '') {
			a_results.push(document.createTextNode(s_focus));
		}

		return a_results;
	};

	/**
	 * 開始前処理
	 */
	const initialize = () => {
		recover_console_log();

		add_style_sheet();
		add_svg_template();
	};

	/**
	 * 終了前処理
	 * @param {number} n_highlight_selection_serial_color
	 */
	const finalize = (n_highlight_selection_serial_color) => {
		document.documentElement.dataset.n_highlight_selection_serial_color = n_highlight_selection_serial_color;

		getSelection().empty();
	};

	/**
	 * ハイライト色の連続番号を返す。
	 * 最大の色番号を超えたとき色番号を0に戻さないのは、最大の色番号を超えたときに作られた色番号のハイライトを削除したとき、超えた色番号のハイライトのみを削除し、0の色番号のハイライトを削除しないため。
	 * 「highlight_selection_番号」と「highlight_selection_serial_連続番号」の2つのクラスをハイライト対象の要素に付与する。
	 * @returns {number}
	 */
	const get_highlight_selection_serial_color = () => {
		const n_highlight_selection_serial_color = document.documentElement.dataset.n_highlight_selection_serial_color;

		if (n_highlight_selection_serial_color) {
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
	};

	/**
	 * .highlight_selectionをmouseoverしたら閉じるボタンを表示するイベントリスナーを追加する。
	 */
	const add_close_button_event = () => {
		let c_mouseleave_sub_timeout_id;

		/**
		 * 要素に閉じるボタンがあればtrueを返す。
		 * @param {HTMLElement} e_target
		 * @returns {boolean}
		 */
		const has_close = (e_target) => e_target.lastElementChild?.classList.contains('highlight_selection_close');

		/**
		 * .highlight_selectionをmouseoverしたら閉じるボタンを表示する。
		 * @param {MouseEvent} e
		 */
		const c_mouseover = (e) => {
			const e_target = e.target;
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

					const e_highlight_selection = e_close.closest('.highlight_selection');

					/**
					 * e_closeを削除することでclickイベントが発生しない。
					 */
					e_close.remove();

					remove_highlight_selections(e_highlight_selection);
				};

				e_close.addEventListener('mousedown', c_mousedown, {
					"capture": true
				});

				/**
				 * 行末を少し超えるハイライトをマウスオーバーしたとき明滅を素早く繰り返すことがある。
				 * その対処として、時間差を空けるためのサブ関数。
				 * @param {function} c_mouseleave
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
				 * @param {MouseEvent} e
				 */
				const c_mouseleave = () => {
					c_mouseleave_sub_timeout_id = setTimeout(() => c_mouseleave_sub(c_mouseleave), 500);
				};

				e_target.addEventListener('mouseleave', c_mouseleave);
			}
		};

		/**
		 * 初回だけ起動させ、常駐イベントリスナーになる。
		 * n_highlight_selection_serial_colorの値は終了前処理（finalize）で設定する。
		 */
		if (!document.documentElement.dataset.n_highlight_selection_serial_color) {
			document.addEventListener('mouseover', c_mouseover, {
				"capture": true
			});
		}
	};

	/**
	 * メイン関数
	 */
	const main = () => {
		initialize();

		if (g_debug) {
			console.log('highlight_selection_bookmark');
		}

		const s_selection = get_selection_text();

		if (g_debug) {
			console.log(`s_selection = "${s_selection}"`);
		}

		if (!s_selection) {
			return;
		}

		const o_texts = [];

		body_dfs(document.body, o_texts);

		update_index(o_texts);

		if (g_debug > 1) {
			console.log('o_texts =', o_texts);
		}

		const s_whole_text = o_texts.map((a) => a.s_text).join('');

		if (g_debug > 2) {
			console.log('s_whole_text =', s_whole_text);
		}

		const n_indexes = get_indexes(s_selection, s_whole_text);

		if (g_debug > 1) {
			console.log('n_indexes =', n_indexes);
		}

		const o_custom_ranges = get_custom_ranges(n_indexes, o_texts, s_selection.length);

		if (g_debug > 1) {
			console.log('custom_ranges = ', o_custom_ranges);
		}

		const o_custom_ranges_by_node = get_custom_ranges_by_node(o_custom_ranges, o_texts, s_selection.length);

		if (g_debug > 1) {
			console.log('custom_ranges_by_node = ', o_custom_ranges_by_node);
		}

		const n_highlight_selection_serial_color = get_highlight_selection_serial_color();
		const n_max_highlight_selection_color = get_max_highlight_selection_color();

		const o_custom_range_values = Object.values(o_custom_ranges_by_node);
		for (let index = 0; index < o_custom_range_values.length; index++) {
			const o_custom_range_value = o_custom_range_values[index];

			const N_marked_items = get_marked_nodes(o_custom_range_value, n_highlight_selection_serial_color, n_max_highlight_selection_color);
			if (N_marked_items) {
				replace_node_with(o_custom_range_value.node, N_marked_items);
			}
		}

		add_close_button_event();

		finalize(n_highlight_selection_serial_color);

		if (g_debug) {
			/**
			 * 元のテキストノードが全部置換されて削除されたことを確認する。
			 * これにより元のテキストノードに保存したget_node_keyのユニークキーが全部消え、ユニークキーの前回の状態を気にしなくていいことが分かる。
			 */
			o_custom_range_values.forEach((a) => console.assert(a.node.isConnected === false));

			console.log('done');
		}
	};

	main();
})();
