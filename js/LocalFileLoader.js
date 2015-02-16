/**
 * @author      Yongnan
 * @version     1.0
 * @time        9/29/2014
 * @name        PathBubbles_LocalFileLoader
 */

(function($P){
	'use strict';

	$P.LocalFileLoader = $P.defineClass(
		null,
		function LocalFileLoader(config) {
			this.bubble = config.bubble;},
		{
			load: function (url) {
				var _this = this;

				var check = new PATHBUBBLES.Check();
				if (typeof url === 'undefined') {
					alert("Please Choose the data which needs to load!");
					return;
				}

				var format = check.checkFileFormat(url.name);
				if (format === "")
					return;

				var reader = new FileReader();
				this.statusDomElement = this.addStatusElement();
				$("#bubble")[0].appendChild(this.statusDomElement);
				reader.readAsText(url, "UTF-8");
				var fileName = url.name;
				if (fileName.lastIndexOf('.') !== -1)
					fileName = fileName.substr(0, fileName.lastIndexOf('.'));
				this.fileName = fileName;
				reader.onerror = function () {
					_this.statusDomElement.innerHTML = "Could not read file, error code is " + reader.error.code;
				};
				reader.onprogress = function (event) {
					_this.updateProgress(event);
				};

				reader.onload = function () {
					var tempdata = "";
					tempdata = reader.result;
					if (tempdata != null) {
						if (format === "XML") {
							if (typeof tempdata == 'string' || tempdata instanceof String) {
								tempdata = tempdata.replace(/\\'/g, "'"); //dataType: "text",    ^"\r\n
								tempdata = tempdata.replace(/\\"/g, '"'); //dataType: "text",
								var parser = new DOMParser(),
										xmlDom = parser.parseFromString(tempdata, "text/xml");
								_this.parse($(xmlDom));
							}
						}
					}
				};
			},
			parse: function ($this) {
				var canvasSize = $this.find("Canvas");
				var size = canvasSize.find("Size").text()
							.replace("(", "")   //remove the right bracket
							.replace(")", "") //remove the left bracket;
							.split(",");
				var w, h;
				if (size.length === 2) {
					w = parseInt(size[0]);
					h = parseInt(size[1]);
				}
				this.bubble.bubbleView = new PATHBUBBLES.BubbleView({
					parent: this.bubble, position: 'back',
					w: w, h: h,
					cornerRadius: this.bubble.cornerRadius});

				var compartmentBlock = $this.find("compartmentBlock");
				this.complexBlock = $this.find("complexBlock");
				this.proteinBlock = $this.find("proteinBlock");
				this.physicalEntityBlock = $this.find("physicalEntityBlock");
				this.smallMoleculeBlock = $this.find("smallMoleculeBlock");
				this.dnaBlock = $this.find("DnaBlock");
				this.rnaBlock = $this.find("RnaBlock");
				this.reactionBlock = $this.find("reactionBlock");
				this.edgeBlock = $this.find("edgeBlock");
				this.parseCompartmentBlock(compartmentBlock);
				this.parseEdges();
				updateProgress();
				function updateProgress() {
					$("#status")[0].style.display = 'none';
				}

				for (var i = this.bubble.bubbleView.compartments.length - 1; i >= 0; i--) {
					var compartment = this.bubble.bubbleView.compartments[i];
					this.bubble.bubbleView.compartments[i].Left = compartment.x;
					this.bubble.bubbleView.compartments[i].Top = compartment.y;
					this.bubble.bubbleView.compartments[i].Bottom = compartment.y + compartment.h;
					this.bubble.bubbleView.compartments[i].Right = compartment.x + compartment.w;
				}
				var Left = Infinity, Right = -Infinity, Top = Infinity, Bottom = -Infinity;
				for (var i = this.bubble.bubbleView.compartments.length - 1; i >= 0; i--) {
					var compartment = this.bubble.bubbleView.compartments[i];
					if (compartment.Left <= Left) {
						Left = compartment.Left;
					}
					if (compartment.Top <= Top) {
						Top = compartment.Top;
					}
					if (compartment.Bottom >= Bottom) {
						Bottom = compartment.Bottom;
					}
					if (compartment.Right >= Right) {
						Right = compartment.Right;
					}
				}
				this.bubble.bubbleView.setCenterCoordinate(Left, Top, Right - Left, Bottom - Top);
				return;
			},
			addStatusElement: function () {
				var e = document.getElementById('status');
				if (e === null) {
					e = document.createElement("div");
					e.id = 'status';
				}
				else
					e.style.display = 'block';
				e.style.position = "absolute";
				e.style.fontWeight = 'bold';
				e.style.left = this.bubble.x + this.bubble.w / 2 + this.bubble.lineWidth / 2;
				e.style.top = this.bubble.y + this.bubble.h / 2 + this.bubble.lineWidth / 2;
				e.style.fontSize = "1.2em";
				e.style.textAlign = "center";
				e.style.color = "#f00";
				e.style.width = "100%";
				e.style.zIndex = 1000;
				e.innerHTML = "Loading ...";
				return e;
			},
			updateProgress: function (progress) {
				var message = "Loaded ";
				if (progress.total) {
					message += ( 100 * progress.loaded / progress.total ).toFixed(0) + "%";
				} else {
					message += ( progress.loaded / 1024 ).toFixed(2) + " KB";
				}
				this.statusDomElement.innerHTML = message;
				if (progress.loaded === progress.total) {
					this.statusDomElement.style.display = 'none';
				}
			},
			parseEdges: function () {
				var length = this.edgeBlock.children().length;
				var t = this.edgeBlock.attr('Num');
				length = Math.max(length, t) + 1;
				for (var i = 0; i < length; ++i) {
					var currentEdge = this.edgeBlock.find('edge[j="' + i + '"]');
					var type = currentEdge.find("Name").text();
					var ends = currentEdge.find("Ends").text()
								.replace("(", "")   //remove the right bracket
								.replace(")", "") //remove the left bracket;
								.replace(/[_\s]/g, '').split(",");
					var beginType = ends[0];
					var beginIndex = parseInt(ends[1]);
					var endType = ends[2];
					var endIndex = parseInt(ends[3]);
					this.addEdges(type, i, beginType, beginIndex, endType, endIndex);
				}
			},
			addEdges: function (type, index, beginType, beginIndex, endType, endIndex) {
				if (beginIndex < 0 || endIndex < 0)
					return;
				var flag = 0;
				var beginNode;
				var endNode;
				switch (type) {
				case "J":  //Arrow (Black)
					{
						flag = 0;
						for (var i = 0; i < this.bubble.bubbleView.nodes.length; i++) {
							if (beginType === "R") {
								if (this.bubble.bubbleView.nodes[i].dataId === beginIndex)
									if (this.bubble.bubbleView.nodes[i].type === "T" || this.bubble.bubbleView.nodes[i].type === "B" || this.bubble.bubbleView.nodes[i].type === "K") {
										beginNode = this.bubble.bubbleView.nodes[i];
										flag++;
									}
							}
							else {
								if (this.bubble.bubbleView.nodes[i].dataId === beginIndex && this.bubble.bubbleView.nodes[i].type === beginType) {
									beginNode = this.bubble.bubbleView.nodes[i];
									flag++;
								}
							}
							if (endType === "R") {
								if (this.bubble.bubbleView.nodes[i].dataId === endIndex)
									if (this.bubble.bubbleView.nodes[i].type === "T" || this.bubble.bubbleView.nodes[i].type === "B" || this.bubble.bubbleView.nodes[i].type === "K") {
										endNode = this.bubble.bubbleView.nodes[i];
										flag++;
									}
							}
							else {
								if (this.bubble.bubbleView.nodes[i].dataId === endIndex && this.bubble.bubbleView.nodes[i].type === endType) {
									endNode = this.bubble.bubbleView.nodes[i];
									flag++;
								}
							}
							if (flag === 2) {
								flag = 0;
								if (beginType === "R" && endType !== "R") {
									for (var j = 0; j < beginNode.connections.length; ++j) {
										if (beginNode.connections[j] === endNode) {
											break;
										}
									}
									if (j >= beginNode.connections.length) {
										beginNode.connections.push(endNode);
									}
								}
								if (beginType !== "R" && endType === "R") {
									for (var j = 0; j < endNode.connections.length; ++j) {
										if (endNode.connections[j] === beginNode) {
											break;
										}
									}
									if (j >= endNode.connections.length) {
										endNode.connections.push(beginNode);
									}
								}
								this.bubble.bubbleView.addArrow(index, beginNode, endNode);
							}
						}
					}
					break;
				case "I":  //Inhibition (Cyan)
					{
						flag = 0;
						for (var i = 0; i < this.bubble.bubbleView.nodes.length; i++) {
							if (beginType === "R") {
								if (this.bubble.bubbleView.nodes[i].dataId === beginIndex)
									if (this.bubble.bubbleView.nodes[i].type === "T" || this.bubble.bubbleView.nodes[i].type === "B" || this.bubble.bubbleView.nodes[i].type === "K") {
										beginNode = this.bubble.bubbleView.nodes[i];
										flag++;
									}
							}
							else {
								if (this.bubble.bubbleView.nodes[i].dataId === beginIndex && this.bubble.bubbleView.nodes[i].type === beginType) {
									beginNode = this.bubble.bubbleView.nodes[i];
									flag++;
								}
							}
							if (endType === "R") {
								if (this.bubble.bubbleView.nodes[i].dataId === endIndex)
									if (this.bubble.bubbleView.nodes[i].type === "T" || this.bubble.bubbleView.nodes[i].type === "B" || this.bubble.bubbleView.nodes[i].type === "K") {
										endNode = this.bubble.bubbleView.nodes[i];
										flag++;
									}
							}
							else {
								if (this.bubble.bubbleView.nodes[i].dataId === endIndex && this.bubble.bubbleView.nodes[i].type === endType) {
									endNode = this.bubble.bubbleView.nodes[i];
									flag++;
								}
							}
							if (flag === 2) {
								flag = 0;
								if (beginType === "R" && endType !== "R") {
									for (var j = 0; j < beginNode.connections.length; ++j) {
										if (beginNode.connections[j] === endNode) {
											break;
										}
									}
									if (j >= beginNode.connections.length) {
										beginNode.connections.push(endNode);
									}
								}
								if (beginType !== "R" && endType === "R") {
									for (var j = 0; j < endNode.connections.length; ++j) {
										if (endNode.connections[j] === beginNode) {
											break;
										}
									}
									if (j >= endNode.connections.length) {
										endNode.connections.push(beginNode);
									}
								}
								this.bubble.bubbleView.addInhibition(index, beginNode, endNode);
							}
						}
					}
					break;
				case "A":  //Activation (Green)
					{
						flag = 0;
						for (var i = 0; i < this.bubble.bubbleView.nodes.length; i++) {
							if (beginType === "R") {
								if (this.bubble.bubbleView.nodes[i].dataId === beginIndex)
									if (this.bubble.bubbleView.nodes[i].type === "T" || this.bubble.bubbleView.nodes[i].type === "B" || this.bubble.bubbleView.nodes[i].type === "K") {
										beginNode = this.bubble.bubbleView.nodes[i];
										flag++;
									}
							}
							else {
								if (this.bubble.bubbleView.nodes[i].dataId === beginIndex && this.bubble.bubbleView.nodes[i].type === beginType) {
									beginNode = this.bubble.bubbleView.nodes[i];
									flag++;
								}
							}
							if (endType === "R") {
								if (this.bubble.bubbleView.nodes[i].dataId === endIndex)
									if (this.bubble.bubbleView.nodes[i].type === "T" || this.bubble.bubbleView.nodes[i].type === "B" || this.bubble.bubbleView.nodes[i].type === "K") {
										endNode = this.bubble.bubbleView.nodes[i];
										flag++;
									}
							}
							else {
								if (this.bubble.bubbleView.nodes[i].dataId === endIndex && this.bubble.bubbleView.nodes[i].type === endType) {
									endNode = this.bubble.bubbleView.nodes[i];
									flag++;
								}
							}
							if (flag === 2) {
								flag = 0;
								if (beginType === "R" && endType !== "R") {
									for (var j = 0; j < beginNode.connections.length; ++j) {
										if (beginNode.connections[j] === endNode) {
											break;
										}
									}
									if (j >= beginNode.connections.length) {
										beginNode.connections.push(endNode);
									}
								}
								if (beginType !== "R" && endType === "R") {
									for (var j = 0; j < endNode.connections.length; ++j) {
										if (endNode.connections[j] === beginNode) {
											break;
										}
									}
									if (j >= endNode.connections.length) {
										endNode.connections.push(beginNode);
									}
								}
								this.bubble.bubbleView.addActivation(index, beginNode, endNode);
							}
						}
					}
					break;
				}
			},
			parseCompartmentBlock: function (compartmentBlock) {
				var length = compartmentBlock.children().length;
				var t = compartmentBlock.attr('Num');
				length = Math.max(length, t) + 1;
				for (var i = 0; i < length; ++i) {
					var currentCompartment = compartmentBlock.find('compartment[j="' + i + '"]');
					var name = currentCompartment.find("Name").text();
					var position = currentCompartment.find("Position").text()
								.replace("(", "")   //remove the right bracket
								.replace(")", "") //remove the left bracket;
								.split(",");
					var contain = currentCompartment.find("Contain").text();//when contain = "()"
					if (contain.indexOf(';') !== -1) {
						contain = currentCompartment.find("Contain").text().replace("(", "")   //remove the right bracket
							.replace(")", "") //remove the left bracket;
							.split(";");
						if (contain.length > 1) //when length =1  just = "" //contain = "()"
						{
							var x = parseFloat(position[0]);
							var y = parseFloat(position[1]);
							var w = parseFloat(position[2]);
							var h = parseFloat(position[3]);
							this.bubble.bubbleView.addCompartment(i, x, y, w, h, name);
							var len = contain.length;
							for (var j = 0; j < len - 1; ++j) {
								var array = contain[j].split(",");

								var type = array[0].replace(/[_\s]/g, '');
								var index = parseInt(array[1]);
								var temp = [];
								if (array[2] !== "")
									temp = array[2].split(" ");
								var colors = [];
								for (var k = 0; k < temp.length; ++k) {
									colors.push(parseInt(temp[k]));
								}
								this.addElement(i, type, index, colors);
							}
						}
					}
					else if (contain.indexOf(',') !== -1) {
						contain = currentCompartment.find("Contain").text().replace("(", "")   //remove the right bracket
							.replace(")", "") //remove the left bracket;
							.split(",");
						if (contain.length > 1) //when length =1  just = "" //contain = "()"
						{
							var x = parseFloat(position[0]);
							var y = parseFloat(position[1]);
							var w = parseFloat(position[2]);
							var h = parseFloat(position[3]);
							this.bubble.bubbleView.addCompartment(i, x, y, w, h, name);
							var len = contain.length / 3;
							for (var j = 0; j < len; ++j) {
								var type = contain[3 * j];
								var index = parseInt(contain[3 * j + 1]);
								var colors = [];
								this.addElement(i, type, index, colors);
							}
						}
					}
				}
			},
			addElement: function (comparmentId, type, index, colors) {
				switch (type) {
				case "C":  //COMPLEX
					{
						var complexE = this.complexBlock.find('complex[j="' + index + '"]'); //Complex we do not need to use the name
						var position = complexE.find("Position").text()
									.replace("(", "")   //remove the right bracket
									.replace(")", "") //remove the left bracket;
									.split(",");
						var name = complexE.find("Name").text();
						this.bubble.bubbleView.compartments[comparmentId].addComplex(index, position[0], position[1], position[2], position[3], name);
						break;
					}
				case "E": //Entity
					{
						var entityE = this.physicalEntityBlock.find('physicalEntity[j="' + index + '"]'); //Complex we do not need to use the name
						var position = entityE.find("Position").text()
									.replace("(", "")   //remove the right bracket
									.replace(")", "") //remove the left bracket;
									.split(",");
						var name = entityE.find("Name").text();
						this.bubble.bubbleView.compartments[comparmentId].addPhysical_Entity(index, position[0], position[1], position[2], position[3], name);
						break;
					}
				case "S":     //MOLECULE
					{
						var moleculeE = this.smallMoleculeBlock.find('smallMolecule[j="' + index + '"]'); //Complex we do not need to use the name
						var position = moleculeE.find("Position").text()
									.replace("(", "")   //remove the right bracket
									.replace(")", "") //remove the left bracket;
									.split(",");
						var name = moleculeE.find("Name").text();
						var duplicate = moleculeE.find("Dumplicate").text()
									.replace("(", "")   //remove the right bracket
									.replace(")", "") //remove the left bracket;
									.split(",");
						var duplicates = [];
						for (var i = 0; i < duplicate.length; ++i) {
							if (duplicate[i] !== "")
								duplicates.push(duplicate[i]);
						}
						this.bubble.bubbleView.compartments[comparmentId].addSmall_Molecule(index, position[0], position[1], position[2], position[3], name);
						break;
					}
				case "P":     //PROTEIN
					{
						var proteinE = this.proteinBlock.find('protein[j="' + index + '"]'); //Complex we do not need to use the name
						var position = proteinE.find("Position").text()
									.replace("(", "")   //remove the right bracket
									.replace(")", "") //remove the left bracket;
									.split(",");
						var name = proteinE.find("Name").text();
						this.bubble.bubbleView.compartments[comparmentId].addProtein(index, position[0], position[1], position[2], position[3], name);
						break;
					}
				case "D":     //DNA
					{
						var dnaE = this.dnaBlock.find('Dna[j="' + index + '"]'); //Complex we do not need to use the name
						var position = dnaE.find("Position").text()
									.replace("(", "")   //remove the right bracket
									.replace(")", "") //remove the left bracket;
									.split(",");
						var name = dnaE.find("Name").text();
						this.bubble.bubbleView.compartments[comparmentId].addDNA(index, position[0], position[1], position[2], position[3], name);
						break;
					}
				case "Rna":     //RNA
					{
						var rnaE = this.rnaBlock.find('Rna[j="' + index + '"]'); //Complex we do not need to use the name
						var position = rnaE.find("Position").text()
									.replace("(", "")   //remove the right bracket
									.replace(")", "") //remove the left bracket;
									.split(",");
						var name = rnaE.find("Name").text();
						this.bubble.bubbleView.compartments[comparmentId].addRNA(index, position[0], position[1], position[2], position[3], name);
						break;
					}
				case "R":   //Reaction
					{
						var reactionE = this.reactionBlock.find('reaction[j="' + index + '"]'); //Complex we do not need to use the name
						var position = reactionE.find("Position").text()
									.replace("(", "")   //remove the right bracket
									.replace(")", "") //remove the left bracket;
									.split(",");
						var name = reactionE.find("Name").text();
						var typeR = reactionE.find("Type").text();
						if (typeR === "K") {
							this.bubble.bubbleView.compartments[comparmentId].addDissociation(index, position[0], position[1], name);
						}
						else if (typeR === "T") {
							this.bubble.bubbleView.compartments[comparmentId].addTransition(index, position[0], position[1], name);
						}
						else if (typeR === "B") {
							this.bubble.bubbleView.compartments[comparmentId].addAssociation(index, position[0], position[1], name);
						}
						break;
					}
				}
			}
		});
})(PATHBUBBLES);
