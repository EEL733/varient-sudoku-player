// Misc.js v3.4.1
/* global _doc:readonly */

//---------------------------------------------------------------------------
// ★Miscクラス html表示系 (Menu, Button以外)の制御を行う
//---------------------------------------------------------------------------
ui.misc = {
	//---------------------------------------------------------------------------
	// misc.displayDesign()  背景画像とかtitle・背景画像・html表示の設定
	// misc.bgimage()        背景画像を返す
	//---------------------------------------------------------------------------
	displayDesign: function() {
		var pid = ui.puzzle.pid;
		var pinfo = pzpr.variety(pid);
		var title = ui.selectStr(pinfo.ja, pinfo.en);
		title += ui.puzzle.playeronly ? " player" : " " + ui.i18n("editor");

		_doc.title = title;
		var titleEL = _doc.getElementById("title2");
		titleEL.innerHTML = title;

		if (ui.urlconfig.embed) {
			_doc.body.style.background = "white";
		} else {
			_doc.body.style.backgroundImage = "url(" + this.bgimage(pid) + ")";
		}
	},
	bgimage: function(pid) {
		return toBGimage(pid);
	},

	//--------------------------------------------------------------------------------
	// misc.modifyCSS()   スタイルシートの中身を変更する
	//--------------------------------------------------------------------------------
	modifyCSS: function(input) {
		var sheet = _doc.styleSheets[0];
		var rules = sheet.cssRules;
		if (rules === null) {
		} // Chromeでローカルファイルを開くとおかしくなるので、とりあえず何もしないようにします
		else if (!this.modifyCSS_sub(rules, input)) {
			var sel = "";
			for (sel in input) {
				break;
			}
			sheet.insertRule("" + sel + " {}", rules.length);
			rules = sheet.cssRules;
			this.modifyCSS_sub(rules, input);
		}
	},
	modifyCSS_sub: function(rules, input) {
		var modified = false;
		for (var i = 0, len = rules.length; i < len; i++) {
			var rule = rules[i];
			if (!rule.selectorText) {
				continue;
			}
			var pps = input[rule.selectorText];
			if (!!pps) {
				for (var p in pps) {
					if (!!pps[p]) {
						rule.style[p] = pps[p];
					}
				}
				modified = true;
			}
		}
		return modified;
	},

	//--------------------------------------------------------------------------------
	// misc.walker()        DOMツリーをたどる
	// misc.displayByPid()  要素のdata-pid, autocmp-typeカスタム属性によって表示するしないを切り替える
	//--------------------------------------------------------------------------------
	walker: function(parent, func) {
		var els = [parent.firstChild];
		while (els.length > 0) {
			var el = els.pop();
			func(el);
			if (!!el.nextSibling) {
				els.push(el.nextSibling);
			}
			if (el.nodeType === 1 && el.childNodes.length > 0) {
				els.push(el.firstChild);
			}
		}
	},
	displayByPid: function(parent) {
		ui.misc.walker(parent, function(el) {
			if (el.nodeType === 1) {
				var disppid = ui.customAttr(el, "dispPid");
				if (!!disppid) {
					el.style.display = pzpr.util.checkpid(disppid, ui.puzzle.pid)
						? ""
						: "none";
				}
				var autocmp = ui.customAttr(el, "autocmpType");
				if (!!autocmp) {
					el.style.display =
						ui.puzzle.painter.autocmp === autocmp ? "" : "none";
				}
			}
		});
	}
};

function toBGimage(pid) {
	var imgs = [];
	if (imgs.indexOf(pid) >= 0) {
		return "img/" + pid + ".png";
	}
	var header;
	var data = {
		/* カラーパレットが2色時のHeader(途中まで), 16×16サイズのData Block(途中から) */
		sudoku: ["P//wP///y", "HoRvgcvKDxxccp5qY0bY9hiE4khCn7ldabJq6/l8BQA7"]
	}[pid];

	/* 無い場合はimage.gifを返します */
	if (!data) {
		data = ["P//wP///y", "HoRvgcvKDxxccp5qY0bY9hiE4khCn7ldabJq6/l8BQA7"];
	}

	if (data[0].length <= 10) {
		header = "R0lGODdhEAAQAIAAA";
	} else {
		header = "R0lGODdhEAAQAKEAA";
	}

	return (
		"data:image/gif;base64," + header + data[0] + "wAAAAAEAAQAAAC" + data[1]
	);
}
