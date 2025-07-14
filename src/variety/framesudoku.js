(function(pidlist, classbase) {
	if (typeof module === "object" && module.exports) {
		module.exports = [pidlist, classbase];
	} else {
		pzpr.classmgr.makeCustom(pidlist, classbase);
	}
})(["framesudoku"], {
	//---------------------------------------------------------
	// マウス入力系
	MouseEvent: {
		inputModes: { edit: ["number"], play: ["number", "clear"] },

		mouseinput_number: function() {
			if (this.mousestart) {
				if (!this.puzzle.editmode || !this.inputqnum_excell()) {
					this.inputqnum();
				}
			}
		},
		mouseinput_auto: function() {
			if (this.puzzle.playmode) {
				if (this.mousestart) {
					var piece = this.getcell_excell();
					if (!piece.isnull && piece.group === "cell") {
						this.inputqnum();
					}
				}
			} else if (this.puzzle.editmode) {
				this.mouseinput_number();
			}
		},

		inputqnum_excell: function() {
			var excell = this.getpos(0).getex();
			if (excell.isnull) {
				return false;
			}

			if (excell !== this.cursor.getex()) {
				this.setcursor(excell);
			} else {
				this.inputqnum_main(excell);
			}
			return true;
		}
	},

	//---------------------------------------------------------
	// キーボード入力系
	KeyEvent: {
		enablemake: true,
		enableplay: true,
		keyinput: function(ca) {
			var excell = this.cursor.getex();
			if (!excell.isnull && this.puzzle.editmode) {
				this.key_inputqnum_main(excell, ca);
			} else {
				this.key_inputqnum(ca);
			}
		}
	},

	TargetCursor: {
		initCursor: function() {
			this.init(-1, -1);
			this.adjust_init();
		},
		setminmax_customize: function() {
			if (this.puzzle.editmode) {
				return;
			}
			this.minx += 2;
			this.miny += 2;
			this.maxx -= 2;
			this.maxy -= 2;
		}
	},

	//---------------------------------------------------------
	// 盤面管理系
	Cell: {
		enableSubNumberArray: true,

		maxnum: function() {
			return Math.max(this.board.cols, this.board.rows);
		}
	},
	ExCell: {
		minnum: function() {
			return 11;
		},

		maxnum: function() {
			return 99;
		}
	},

	Board: {
		cols: 9,
		rows: 9,

		hasborder: 1,
		hasexcell: 2,

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
		},

		getFrameSum: function(excell, x, y) {
			var pos = excell.getaddr(),
				dir = 0;
			if (pos.by === this.minby + 1) {
				dir = 2;
			} else if (pos.by === this.maxby - 1) {
				dir = 1;
			} else if (pos.bx === this.minbx + 1) {
				dir = 4;
			} else if (pos.bx === this.maxbx - 1) {
				dir = 3;
			}

			var rooms = this.board.roommgr.components;
			var sum = 0,
				roomid = -1;
			while (dir !== 0) {
				pos.movedir(dir, 2);

				var cell = pos.getc();
				if (cell.isnull) {
					break;
				}

				var nowRoomid = rooms.indexOf(cell.room);
				if (roomid !== -1 && roomid !== nowRoomid) {
					break;
				}

				sum += cell.getNum();
				roomid = nowRoomid;
			}

			return sum;
		}
	},

	AreaRoomGraph: {
		enabled: true
	},

	//---------------------------------------------------------
	// 画像表示系
	Graphic: {
		gridcolor_type: "LIGHT",
		lightcolor: "rgb(255, 255, 127)",

		paint: function() {
			this.drawBGCells();
			this.drawBGExCells();
			this.drawTargetSubNumber();
			this.drawGrid();
			this.drawBorders();

			this.drawSubNumbers();
			this.drawAnsNumbers();
			this.drawQuesNumbers();
			this.drawNumbersExCell();

			this.drawChassis();

			this.drawCursor();
		},

		getBGCellColor: function(cell) {
			if (cell.error === 1) {
				return this.errbcolor1;
			} else if (cell.qinfo === 1) {
				return this.lightcolor;
			}
			return null;
		},
		getBGExCellColor: function(excell) {
			if (excell.error === 1) {
				return this.errbcolor1;
			} else if (excell.qinfo === 1) {
				return this.lightcolor;
			}
			return null;
		}
	},

	//---------------------------------------------------------
	// URLエンコード/デコード処理
	Encode: {
		decodePzpr: function(type) {
			this.decodeNumber16ExCell();
			this.decodeNumber16();
		},
		encodePzpr: function(type) {
			this.encodeNumber16ExCell();
			this.encodeNumber16();
		}
	},
	//---------------------------------------------------------
	FileIO: {
		decodeData: function() {
			this.decodeCellExCellQnumAnumsub();
		},
		encodeData: function() {
			this.encodeCellExCellQnumAnumsub();
		},

		decodeCellExCellQnumAnumsub: function() {
			this.decodeCellExCell(function(obj, ca) {
				if (ca === ".") {
					return;
				} else if (obj.group === "excell") {
					obj.qnum = +ca;
				} else if (obj.group === "cell") {
					if (ca[0] === "q") {
						obj.qnum = +ca.substr(1);
						return;
					}
					if (ca.indexOf("[") >= 0) {
						ca = this.setCellSnum(obj, ca);
					}
					if (ca !== ".") {
						obj.anum = +ca;
					}
				}
			});
		},
		encodeCellExCellQnumAnumsub: function() {
			this.encodeCellExCell(function(obj) {
				if (obj.group === "excell") {
					if (obj.qnum !== -1) {
						return "" + obj.qnum + " ";
					}
				} else if (obj.group === "cell") {
					if (obj.qnum !== -1) {
						return "q" + obj.qnum + " ";
					}
					var ca = ".",
						num = obj.anum;
					if (num !== -1) {
						ca = "" + num;
					} else {
						ca += this.getCellSnum(obj);
					}
					return ca + " ";
				}
				return ". ";
			});
		}
	},

	//---------------------------------------------------------
	// 正解判定処理実行部
	AnsCheck: {
		checklist: [
			"checkDifferentNumberInRoom",
			"checkDifferentNumberInLine",
			"checkNoNumCell+",
			"checkFrameSum"
		],

		checkFrameSum: function() {
			var bd = this.board,
				result = true;

			for (var ec = 0; ec < bd.excell.length; ec++) {
				var excell = bd.excell[ec];
				if (excell.qnum === -1) {
					continue;
				}

				var sum = bd.getFrameSum(excell);
				if (sum === excell.qnum) {
					continue;
				}

				result = false;
				if (this.checkOnly) {
					break;
				}

				excell.seterr(1);
			}

			if (!result) {
				this.failcode.add("nmFrameSumNe");
			}
		}
	}
});
