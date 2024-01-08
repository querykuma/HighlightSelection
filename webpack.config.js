const MakeBookmarklet = require('./MakeBookmarklet.js');

module.exports = {
	"entry": './highlight_selection_bookmark.js',
	"output": {
		"filename": 'highlight_selection_bookmark_min.js',
		"path": __dirname
	},
	"plugins": [
		new MakeBookmarklet({
			"f_encodeURIComponent": false
		})
	],
	"mode": "production"
};
