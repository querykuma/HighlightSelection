chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		"id": "HighlightSelection",
		"title": "選択範囲のキーワードをハイライト(&H)",
		"contexts": ["selection"],
		"type": "normal"
	});
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
	chrome.scripting.executeScript(
		{
			"target": {
				"tabId": tab.id,
				"allFrames": true
			},
			"files": ['highlight_selection_bookmark.js']
		},
		() => { });
});
