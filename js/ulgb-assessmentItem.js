/*
* adapt-userLevelGradingBoundaries
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Oliver Foster <oliver.foster@kineo.com>
*/

define(function(require) {

	var Adapt = require('coreJS/adapt');
	var Backbone = require('backbone');
	var c3import = require('extensions/adapt-userLevelGradingBoundaries/js/c3.min');
	var HBS = require('extensions/adapt-userLevelGradingBoundaries/js/handlebars-v1.3.0');

	var uid = 0;

	var assessmentItem = Backbone.View.extend({
		className: "ulgb-assessmentItem",
		data: undefined,
		initialize: function() {
			this.model = new Backbone.Model({});
			this.model.set("uid",++uid);
			this.$el.attr("uid",uid);
			var thisHandle = this;
			this.listenTo(Adapt, "device:resize device:changed", function() {
				thisHandle.$(".animated").removeClass("animated").html("");
				thisHandle.renderCharts();
			});
		},
		render: function() {
			var template = Handlebars.templates['ulgb-assessmentItem'];
			var data = this.model.toJSON();

			var assessment = Adapt.diffuseAssessment.getAssessmentById(data._assessmentId);

			params = $.extend(true, {}, data);
			params = _.extend({}, assessment, params);

			_.each(params._results._sections, function (section) {
				section["_is" + section._type.substr(0,1).toUpperCase() + section._type.substr(1) ] = true;

				if (section.body) section.body = HBS.compile(section.body)(params);
				if (section.title) section.title = HBS.compile(section.title)(params);
			});

			this.data = params;

			this.$el.removeClass("right left full");
			this.$el.addClass(params._results._size);
			this.$el.html(template( params ));
			_.defer(_.bind(this.postRender, this));
		},
		postRender: function () {
			this.renderTime = (new Date()).getTime();
			this.renderCharts();
		},
		renderCharts: function() {
			var thisHandle = this;
			function chooseColors (sectiondata) {
				if (typeof sectiondata._chart._colors[0] == "object") {
		            for (var f = 0; f < sectiondata._chart._colors.length; f++) {
		            	var item = sectiondata._chart._colors[f];
		            	if (item._forCurrentMark !== undefined && thisHandle.data._currentMark !== undefined && item._forCurrentMark.split(" ").indexOf(thisHandle.data._currentMark._mark) > -1 ) {
		            		return item._colors;
			            } else if (!thisHandle.data._isComplete && item._forProjectedMark !== undefined && item._forHighestMark !== undefined &&  thisHandle.data._highestMark !== undefined && thisHandle.data._projectedMark !== undefined && item._forProjectedMark.split(" ").indexOf(thisHandle.data._projectedMark._mark) > -1 && item._forHighestMark.split(" ").indexOf(thisHandle.data._highestMark._mark) > -1) {
		            		return item._colors;
			            } else if (thisHandle.data._isComplete && item._forFinalMark !== undefined && thisHandle.data._currentMark !== undefined && item._forFinalMark.split(" ").indexOf(thisHandle.data._currentMark._mark) > -1) {
		            		return item._colors;
		            	}
		            }
		            return [];
				} else {
					return sectiondata._chart._colors;
				}
			}

			var $charts = this.$(".chart");
			
			$charts.each(function (index, item) {
				var $item = $(item);
				var section = $item.attr("section");
				var sectiondata = _.findWhere(thisHandle.data._results._sections, {_type : section });
				var settings = {
					_chartType: undefined,
					columns: []
				};
				settings.colors = chooseColors(sectiondata);
				settings._chartType = (sectiondata._chart._type ? sectiondata._chart._type : "pie");
				settings.title = HBS.compile(sectiondata._chart.title)(thisHandle.data);
				switch (section) {
				case "questionsAttempted":
					settings.columns.push(['_completeDescendentComponents', thisHandle.data._completeDescendentComponents]);
					settings.columns.push(['_descendentComponents', thisHandle.data._descendentComponents - thisHandle.data._completeDescendentComponents]);
					break;
				case "averagePoints":
					settings.columns.push(['_averagePoints', thisHandle.data._averagePoints]);
					settings.columns.push(['_maxPoints', thisHandle.data._maxPoints - thisHandle.data._averagePoints]);
					break;
				case "rightFirstTime":
					if (thisHandle.data._completeDescendentComponents === 0) {
						settings.columns.push(['_countRightFirstTime', 0]);
						settings.columns.push(['_completeDescendentComponents', 4]);
					} else {
						
						settings.columns.push(['_countRightFirstTime', thisHandle.data._countRightFirstTime]);
						settings.columns.push(['_completeDescendentComponents', thisHandle.data._completeDescendentComponents - thisHandle.data._countRightFirstTime]);
					}
					break;
				case "predictedScore":
					settings.columns.push(['_projectedScoreAsPercent', thisHandle.data._projectedScoreAsPercent]);
					settings.columns.push(['_bar', 100]);
					break;
				case "forecastForFinalAssessment":
					settings.columns.push(['_countBankQuestions', thisHandle.data._countBankQuestions]);
					settings.columns.push(['_bankQuestions', thisHandle.data._maxBankQuestions - thisHandle.data._countBankQuestions]);
					break;
				case "pageLevelView":
					settings.columns.push(['_descendentComponents', thisHandle.data._components.length]);
					settings.columns.push(['_score', thisHandle.data._score]);
					break;
				default:
					throw "Section type not supported: " + section;
				}
				thisHandle.renderChart($item, sectiondata, settings);
			});
		},
		renderChart: function($div, sectiondata, settings) {
			var thisHandle = this;
			var model = this.data;
			var _type = settings._chartType;
			$div.addClass(_type);
			var bindto =  '.ulgb-assessmentItem[uid="' + model.uid + '"] div.chart[section="' + sectiondata._type + '"]';
			var size = {
				width: $div.width(),
				height: $div.width()
			};

			var chartData = undefined;

			var animateCallback = undefined;

			switch (_type) {
			case "percentage":
				var className = model._isComplete === true
								? model._isPassed
									? "passed"
									: "failed" 
								: "incomplete";
				var percentage = $("<div class='percentage'><div class='complete'>" + assessment._scoreAsPercent + "%</div><div class='incomplete'>Incomplete</div></div>").addClass(className);
				$(bindto).html("").append(percentage);
				break;
			case "tick":
				var className = model._isComplete === true
								? model._isPassed 
									? "passed"
									: "failed" 
								: "incomplete";

				var tick = $("<div class='tick'><i class='passed icon icon-tick'></i><i class='failed icon icon-cross'></i><div class='incomplete'>Incomplete</div></div>").addClass(className);
				$(bindto).html("").append(tick);
				break;
			case "pie":
				//var colors = [ model._results._chart._colors._passed,  model._results._chart._colors._failed, model._results._chart._colors._incomplete ];
				chartData = {
				    bindto: bindto,
				    color: {
				    	pattern: settings.colors
				    },
				    interaction: {
				    	enabled: false
				    },
				    transition: {
				    	duration: 0
				    },
				    size : size,
				    data: {
				    	selection: {
				    		enabled: false
				    	},
				    	type: 'pie',
				      	columns: settings.columns,
				     	order: 'asc',
				     	onclick: function(event) {
			    			return false;
			    		},
			    		onmouseover: function(event) {
			    			return false;
			    		}
				    },
				    pie: {
					    label: {
					    	show: false,
						},
						expand: false
					},
				    tooltip: {
				    	show: false
				    },
				    zoom: {
				    	enabled: false
				    },
				    legend: {
				    	show: false
				    }
				};
				animateCallback = function(animateClick, animateDuration, settings, chartData) {
					var pc = (1/animateDuration) * animateClick;
					var x = pc * settings.columns[0][1], 
					y = (settings.columns[0][1] + settings.columns[1][1]) - x;

					chart.load({
						columns : [
							[settings.columns[0][0], x],
							[settings.columns[1][0], y]
						]
					});

					if (sectiondata._chart._isPercent === true ) t = t + "%";
					if ($div.css("opacity") !== 1) $div.css("opacity", pc)
				};
				var chart = c3.generate(chartData);
				break;
			case "donut":
				chartData = {
				    bindto: bindto,
				    color: {
				    	pattern: settings.colors
				    },
				    interaction: {
				    	enabled: false
				    },
				    transition: {
				    	duration: 0
				    },
				    size : size,
				    data: {
				    	selection: {
				    		enabled: false
				    	},
				    	type: 'donut',
				      	columns: settings.columns,
				     	groups: [
				     		['Passed','Failed', 'Incomplete']
				     	],
				     	order: null,
				     	onclick: function(event) {
			    			return false;
			    		},
			    		onmouseover: function(event) {
			    			return false;
			    		}
				    },
				    donut: {
				    	title: settings.title,
					    label: {
					    	show: false,
						},
						expand: false
					},
				    tooltip: {
				    	show: false
				    },
				    zoom: {
				    	enabled: false
				    },
				    legend: {
				    	show: false
				    }
				};
				animateCallback = function(animateClick, animateDuration, settings, chartData) {
					var pc = (1/animateDuration) * animateClick;
					var x = pc * settings.columns[0][1], 
					y = (settings.columns[0][1] + settings.columns[1][1]) - x;
					var t = Math.round(parseInt(chartData.donut.title) * pc);

					chart.load({
						columns : [
							[settings.columns[0][0], x],
							[settings.columns[1][0], y]
						]
					});

					if (sectiondata._chart._isPercent === true ) t = t + "%";

					$div.find(".c3-chart-arcs-title").html(t);
					if ($div.css("opacity") !== 1) $div.css("opacity", pc)
				};
				var chart = c3.generate(chartData);
				break;
			case "gradedbar":
				var className = model._isComplete === true
								? model._isPassed 
									? "passed"
									: "failed" 
								: "incomplete";

				var gradedbar = $(Handlebars.templates['ulgb-gradedbar'](this.data)).addClass(className);
				var $bindto = $(bindto);
				$bindto.html("").append(gradedbar);

				this.data._marking.sort(function(a,b) { 
					return a._forScoreAsPercent._max - b._forScoreAsPercent._max;
				} );

				for (var i = 0; i < this.data._marking.length; i++) {
					$bindto.find(".labels-top").append($('<div class="label-top ' + this.data._marking[i]._mark + '" style="left:' + (this.data._marking[i]._forScoreAsPercent._min) + '%;">' + this.data._marking[i]._forScoreAsPercent._min + '%</div>'));
					$bindto.find(".boundary-border").append($('<div class="boundary ' + this.data._marking[i]._mark + '" style="left:' + (this.data._marking[i]._forScoreAsPercent._min) + '%;"></div>'));
					$bindto.find(".labels-bottom").append($('<div class="label-bottom ' + this.data._marking[i]._mark + '" style="left:' + (this.data._marking[i]._forScoreAsPercent._min) + '%;">' + this.data._marking[i].displayMark + '</div>'));
				}
				$bindto.find(".bar-border").css("background-color", settings.colors[1]);
				$bindto.find(".bar").css("background-color", settings.colors[0]);

				animateCallback = function(animateClick, animateDuration, settings, chartData) {
					var pc = (1/animateDuration) * animateClick;
					var x = pc * settings.columns[0][1];

					$bindto.find(".bar").css("width", x + "%");

					if ($div.css("opacity") !== 1) $div.css("opacity", pc)

				};
				break;
			case "blockchart":
				var className = model._isComplete === true
								? model._isPassed 
									? "passed"
									: "failed" 
								: "incomplete";

				var blockchart = $(Handlebars.templates['ulgb-blockchart'](this.data)).addClass(className);
				var $bindto = $(bindto);
				$bindto.html("").append(blockchart);

				for (var i = 0; i < settings.columns[0][1]; i++) {
					$block = $("<div class='chart-block'><div class='chart-block-fill'></div></div>");
					if (settings.columns[1][1] > i)
						$block.find(".chart-block-fill").css("background-color", settings.colors[0]);
					$div.find(".blocks-border").append($block);
				}

				$bindto.find(".chart-block").css("background-color", settings.colors[1]);
				

				animateCallback = function(animateClick, animateDuration, settings, chartData) {
					var pc = (1/animateDuration) * animateClick;

					if ($div.css("opacity") !== 1) $div.css("opacity", pc);
					$div.find(".chart-block-fill").css("opacity", pc);

				};
				break;
			}
			

			if (animateCallback !== undefined) {

				
				var animateInterval = 10;
				var animateDelay =  (sectiondata._chart._animateDelay ? sectiondata._chart._animateDelay : 500);
				var animateDuration = (sectiondata._chart._animateDelay ? sectiondata._chart._animateDelay : 500);
				var thisHandle = this;
				$div.on("onscreen",function (event, onscreen) {
					var initial = (new Date()).getTime() - thisHandle.renderTime;
					if (initial > 500) animateDelay = 0;
					//if (onscreen.inviewP !== 100) $div.removeClass("animated");
					setTimeout(function() {
						if (onscreen.inviewP !== 100 || $div.hasClass("animated")) return;
						var startTime = (new Date()).getTime();
						$div.addClass("animated");
						settings.animateIntervalHandle = setInterval(_.bind(function(chartData, animateCallback, startTime, animateInterval, animateDuration, animateIntervalHandle) {
							var animateClick = (new Date()).getTime() - startTime;
							if (animateClick > animateDuration) animateClick = animateDuration;
							animateCallback(animateClick, animateDuration, this, chartData);
							if (animateClick == animateDuration) clearInterval(this.animateIntervalHandle);
						}, settings, chartData, animateCallback, startTime, animateInterval, animateDuration), animateInterval);
					}, animateDelay);
				});


			}

		}
	});

	return assessmentItem;

});