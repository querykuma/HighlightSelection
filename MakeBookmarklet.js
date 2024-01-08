const fs = require('fs');

class MakeBookmarklet {
	static o_defaultOptions = {
		"f_encodeURIComponent": false
	};

	constructor(o_options) {
		this.o_options = {
			...MakeBookmarklet.o_defaultOptions,
			...o_options
		};
	}

	apply(compiler) {
		const s_pluginName = MakeBookmarklet.name;

		compiler.hooks.assetEmitted.tap(s_pluginName, (s_filename, o_info) => {
			const s_targetPath = o_info.targetPath;
			if (!s_targetPath.match(/\.js$/u)) {
				console.log(`${s_filename} は.jsではありません。`);
				return;
			}

			const s_content = o_info.content.toString('utf8');

			if (!s_content.match(/^\(\(\)=>\{.*\}\)\(\);$/u)) {
				console.log(`${s_filename} の中身が予期されない形をしています。`);
				return;
			}

			const s_content2
				= this.o_options.f_encodeURIComponent
					? `javascript:${encodeURIComponent(s_content)}`
					: `javascript:${s_content}`;

			fs.stat(s_targetPath, (err, stats) => {
				if (err) { throw err; }
				if (!stats.isFile()) {
					console.log(`${s_filename} はファイルではありません。`);
					return;
				}

				fs.unlink(s_targetPath, (err2) => {
					if (err2) { throw err2; }

					fs.writeFile(s_targetPath, s_content2, 'utf8', (err3) => {
						if (err3) { throw err3; }
						console.log(`${s_filename} をbookmarkletにしました。`);
					});
				});
			});
		});
	}
}

module.exports = MakeBookmarklet;
