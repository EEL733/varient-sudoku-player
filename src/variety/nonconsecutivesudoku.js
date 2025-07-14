(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["nonconsecutivesudoku"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { edit: ["number", "clear"], play: ["number", "clear"] },
		autoedit_func: "qnum",
		autoplay_func: "qnum"
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		enableplay: true
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		enableSubNumberArray: true,

		maxnum: function() {
			return Math.max(this.board.cols, this.board.rows);
		}
	},
	Board: {
		cols: 9,
		rows: 9,

		hasborder: 1,

		initBoardSize: function(col, row) {
			this.common.initBoardSize.call(this, col, row);

			var roomsizex, roomsizey;
			roomsizex = roomsizey = (Math.sqrt(this.cols) | 0) * 2;
			if (this.cols === 6) {
				roomsizex = 6;
			}
			for (var i = 0; i < this.border.length; i++) {
				var border = this.border[i];
				if (border.bx % roomsizex === 0 || border.by % roomsizey === 0) {
					border.ques = 1;
				}
			}
			this.rebuildInfo();
		}
	},

	AreaRoomGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		paint: function() {
			this.drawBGCells();
			this.drawTargetSubNumber();
			this.drawGrid();
			this.drawBorders();

			this.drawSubNumbers();
			this.drawAnsNumbers();
			this.drawQuesNumbers();

			this.drawChassis();

			this.drawCursor();
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellQnum();
			this.decodeCellAnumsub();
		},
		encodeData: function() {
			this.encodeCellQnum();
			this.encodeCellAnumsub();
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkDifferentNumberInRoom",
			"checkDifferentNumberInLine",
			"checkNoNumCell+",
			"checkNonConsecutive"
		],

		checkHintSideCell: function(func, code) {
			var boardborder = this.board.border;
			for (var id = 0; id < boardborder.length; id++) {
				var border = boardborder[id],
					cell1 = border.sidecell[0],
					cell2 = border.sidecell[1];
				var num1 = cell1.getNum(),
					num2 = cell2.getNum();
				if (num1 <= 0 || num2 <= 0 || !func(border, num1, num2)) {
					continue;
				}

				this.failcode.add(code);
				if (this.checkOnly) {
					break;
				}
				cell1.seterr(1);
				cell2.seterr(1);
			}
		},

		checkNonConsecutive: function() {
			this.checkHintSideCell(function(border, a1, a2) {
				return Math.abs(a1 - a2) === 1;
			}, "nmSubNe1");
		}
	}
});
