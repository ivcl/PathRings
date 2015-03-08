(function($P){
	'use strict';

	$P.FileLoader = $P.defineClass(
		null,
		function (config) {
			this.type = config.type;
			this.loadstart = config.loadstart || null;
			this.loadstart = config.loadend || null;
			this.progress = config.progress || null;
		},
		{
			load: function (url, callback) {
				var _this = this;
				if (typeof url === 'undefined') {
					alert("Please Choose the data which needs to load!");
					return;
				}
				var reader = new FileReader();
				//        this.statusDomElement = this.addStatusElement();
				//        $("#bubble")[0].appendChild(this.statusDomElement);
				reader.onloadstart = this.loadstart;
				reader.onloadend = this.loadend;
				reader.onprogress = this.progress;
				reader.onerror = function () {
					//            _this.statusDomElement.innerHTML = "Could not read file, error code is " + reader.error.code;
				};

				reader.onload = function () {
					var result = [];
					var tempdata = "";
					tempdata = reader.result;
					if (tempdata != null) {
						if (_this.type == "Ortholog") {
							tempdata = tempdata.replace(/\r\n/g, '\n');
							tempdata = tempdata.replace(/\r/g, '\n');
							var orthology = tempdata.split("\n");

							for (var j = 0; j < orthology.length; ++j) {
								if (orthology[j] == ""||orthology[j] == " ") {
									continue;
								}

								var obj = {};
								var temps = orthology[j].split("\t");
								if(temps.length!==2)
								{
									alert("Please check your ortholog data format.!");
									return;
								}
								if (temps[0] == "symbol" && temps[1] == "dbId") {
									continue;
								}
								if(typeof temps[0] !=="string")
									continue;
								obj.symbol = temps[0].toUpperCase();
								obj.dbId = temps[1];
								result.push(obj);
							}
							callback(result);
						}
						else if (_this.type == "Expression") {
							tempdata = tempdata.replace(/\r\n/g, '\n');
							tempdata = tempdata.replace(/\r/g, '\n');
							var expression = tempdata.split("\n");

							for (var j = 0; j < expression.length; ++j) {
								if (expression[j] == ""||expression[j] == " ") {
									continue;
								}
								var temps = expression[j].split("\t");
								if(temps.length!==3)
								{
									alert("Please check your gene expression data format.!");
									return;
								}
								if (temps[0] == "gene_id" ||typeof temps[1] !=="string"|| temps[2] == "Infinity" || temps[2]=="NaN" || isNaN(parseFloat(temps[2]))|| temps[2] == "0"||temps[1]==undefined) {
									continue;
								}

								var obj = {};
								obj.gene_id = temps[0];
								obj.symbol = temps[1].toUpperCase();
								//                        obj.ratio = Math.log2(parseFloat(temps[2]));
								obj.ratio = Math.log(parseFloat(temps[2]))/Math.log(2);
								result.push(obj);
							}
							callback(result);
						}


					}
				};
				reader.readAsText(url, "UTF-8");
			}
		});
})(PATHBUBBLES);
