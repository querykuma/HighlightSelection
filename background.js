(() => {
	const g_message = "highlight_selection";

	chrome.runtime.onInstalled.addListener(() => {
		chrome.contextMenus.create({
			"id": "HighlightSelection",
			"title": "選択範囲のキーワードをハイライト(&H)",
			"contexts": ["selection"],
			"type": "normal"
		});
	});

	const after_executeScript = (n_tab_id) => {
		chrome.tabs.sendMessage(n_tab_id, g_message, () => { });
	};

	const inject_script = (n_tab_id) => {
		chrome.scripting.executeScript(
			{
				"target": {
					"tabId": n_tab_id,
					"allFrames": true
				},
				"files": ['highlight_selection_bookmark.js']
			},
			() => after_executeScript(n_tab_id)
		);
	};

	chrome.contextMenus.onClicked.addListener((info, tab) => {
		/**
		 * メモ。info.selectionTextに選択範囲のテキストが入っているのでいつか利用できるかもしれない。
		 */
		const n_tab_id = tab.id;

		chrome.tabs.sendMessage(n_tab_id, g_message, () => {
			/**
			 * https://stackoverflow.com/questions/47094454/chrome-extensions-script-running-many-times/47127060#47127060
			 * executeScriptが毎回コピーを挿入して複数回実行されてしまうため、sendMessageを使用する。
			 *
			 * executeScriptが未実行なら通信先がないのでchrome.runtime.lastErrorになる。
			 * それを利用して初回に一度だけexecuteScriptを実行させる。
			 * sendMessage → OK → ハイライト実行
			 * sendMessage → NG → executeScript → sendMessage → ハイライト実行
			 */
			if (chrome.runtime.lastError) {
				inject_script(n_tab_id);
			}
		});
	});
})();
