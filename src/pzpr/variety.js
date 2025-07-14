// Variety.js v3.4.1

(function() {
	var _info = {},
		_list = [];
	function toPID(name) {
		if (!!_info[name]) {
			return name;
		}
		for (var pid in _info) {
			if (!_info[pid].alias) {
				continue;
			}
			for (var type in _info[pid].alias) {
				if (_info[pid].alias[type] === name) {
					return pid;
				}
			}
		}
		return "";
	}

	var variety = (pzpr.variety = pzpr.genre = function(pid) {
		return _info[toPID(pid)] || { valid: false };
	});
	variety.extend = function(obj) {
		for (var n in obj) {
			this[n] = obj[n];
		}
	};
	variety.extend({
		info: _info,
		toPID: toPID,
		exists: function(name) {
			return variety(name).valid;
		},
		each: function(func) {
			for (var pid in _info) {
				func(pid);
			}
		},
		getList: function() {
			return _list.slice();
		}
	});
	delete variety.extend;

	(function(Genre, obj) {
		for (var pzprid in obj) {
			_info[pzprid] = new Genre(pzprid, obj[pzprid]);
			try {
				Object.freeze(_info[pzprid]);
				Object.freeze(_info[pzprid].exists);
				Object.freeze(_info[pzprid].alias);
			} catch (e) {}
		}
	})(
		// eslint-disable-next-line no-unexpected-multiline
		function Genre(pzprid, datalist) {
			this.valid = true;
			this.pid = pzprid; /* パズルID */
			this.script = !!datalist[4]
				? datalist[4]
				: pzprid; /* スクリプトファイル(クラス) */
			this.ja = datalist[2]; /* 日本語パズル名 */
			this.en = datalist[3]; /* 英語パズル名 */
			this.exists = {
				pzprapp: !!datalist[0],
				kanpen: !!datalist[1],
				pencilbox: !!datalist[1]
			};
			this.exists.pencilbox =
				this.exists.pencilbox &&
				pzprid !== "nanro" &&
				pzprid !== "ayeheya" &&
				pzprid !== "kurochute";
			/* pzprurl : ぱずぷれID(URL出力用) */
			/* kanpen  : カンペンID            */
			/* kanpen2 : カンペンID(入力のみ)  */
			this.alias = !!datalist[5] ? datalist[5] : {};
			this.urlid = this.alias.pzprurl || pzprid;
			this.kanpenid = !!datalist[1] ? this.alias.kanpen || pzprid : "";
			_list.push(pzprid);
		},
		{
			sudoku: [0, 0, "数独", "Sudoku"],
			nonconsecutivesudoku: [
				0,
				0,
				"NonConsecutive Sudoku",
				"NonConsecutive Sudoku"
			],
			skyscraperssudoku: [0, 0, "Skyscrapers Sudoku", "Skyscrapers Sudoku"],
			descriptivepairssudoku: [
				0,
				0,
				"Descriptive Pairs Sudoku",
				"Descriptive Pairs Sudoku"
			],
			framesudoku: [0, 0, "Frame Sudoku", "Frame Sudoku"],
			xsumssudoku: [0, 0, "X-Sums Sudoku", "X-Sums Sudoku"]
		}
	);
})();
