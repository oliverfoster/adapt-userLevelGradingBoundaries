/*
* adapt-userLevelGradingBoundaries
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Oliver Foster <oliver.foster@kineo.com>
*/

define(function(require) {

	var Adapt = require('coreJS/adapt');
	var Backbone = require('backbone');
	var c3import = require('extensions/adapt-userLevelGradingBoundaries/js/c3.min');

	var uid = 0;

	var assessmentItem = Backbone.View.extend({
		className: "ulgb-assessmentItem",
		initialize: function() {
			this.model = new Backbone.Model({});
			this.model.set("uid",++uid);
			this.$el.attr("uid",uid);
			var thisHandle = this;
			this.listenTo(Adapt, "device:resize device:changed", this.renderChart);
		},
		render: function() {
			var template = Handlebars.templates['ulgb-assessmentItem'];
			var data = this.model.toJSON();
			this.$el.removeClass("right left full");
			this.$el.addClass(data._results._size);
			this.$el.html(template( data ));
			_.defer(_.bind(this.postRender, this));
		},
		postRender: function () {
			this.renderChart();
		},
		renderChart: function() {
			var thisHandle = this;
			var model = this.model.toJSON();
			if (model._results === undefined || model._results._chart === undefined) return;
			var $div = this.$el.find("div.chart");
			var _type = model._results._chart._type;
			var assessment = Adapt.diffuseAssessment.getAssessmentById(model._assessmentId);
			$div.addClass(_type);
			var bindto =  '.ulgb-assessmentItem[uid="' + model.uid + '"] div.chart';
			var size = {
				width: $div.width(),
				height: $div.width()
			};


			switch (_type) {
			case "percentage":
				var className = model._isComplete === true
								? model._isPassed
									? "passed"
									: "failed" 
								: "incomplete";
				var percentage = $("<div class='percentage'><div class='complete'>" + assessment._scoreAsPercent + "%</div><div class='incomplete'>Incomplete</div></div>").addClass(className);
				$(bindto).html("").append(percentage);
				return;
			case "tick":
				var className = model._isComplete === true
								? model._isPassed 
									? "passed"
									: "failed" 
								: "incomplete";

				var tick = $("<div class='tick'><i class='passed icon icon-tick'></i><i class='failed icon icon-cross'></i><div class='incomplete'>Incomplete</div></div>").addClass(className);
				$(bindto).html("").append(tick);
				return;
			case "pie":
				var colors = [ model._results._chart._colors._passed,  model._results._chart._colors._failed, model._results._chart._colors._incomplete ];
				chartData = {
				    bindto: bindto,
				    color: {
				    	pattern: colors
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
				      	columns: [
				      	  	['Passed', assessment._scoreAsPercent],
				      	  	['Failed', (assessment._completedAsPercent - assessment._scoreAsPercent)],
				      	  	['Incomplete', 100 - assessment._completedAsPercent]
				     	],
				     	groups: [
				     		['Passed','Failed', 'Incomplete']
				     	],
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
				break;
			case "donut":
				var colors = [ model._results._chart._colors._passed,  model._results._chart._colors._failed, model._results._chart._colors._incomplete ];
				chartData = {
				    bindto: bindto,
				    color: {
				    	pattern: colors
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
				      	columns: [
				      	  	['Passed', assessment._scoreAsPercent],
				      	  	['Failed', (assessment._completedAsPercent - assessment._scoreAsPercent)],
				      	  	['Incomplete', 100 - assessment._completedAsPercent]
				     	],
				     	groups: [
				     		['Passed','Failed', 'Incomplete']
				     	],
				     	order: 'asc',
				     	onclick: function(event) {
			    			return false;
			    		},
			    		onmouseover: function(event) {
			    			return false;
			    		}
				    },
				    donut: {
				    	title: assessment._scoreAsPercent + "%",
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
				break;
			case "bar":
				var colors = [ model._results._chart._colors._passed,  model._results._chart._colors._failed, model._results._chart._colors._incomplete ];
				chartData = {
				    bindto: bindto,
				    color: {
				    	pattern: colors
				    },
				    interaction: {
				    	enabled: false
				    },
				    axis: {
				    	x: {
				    		show: true,
				    		label: assessment._scoreAsPercent + "%",
				    		tick: {
				    			count: 0,
				    			culling: {
				    				max: 0
				    			},
				    			fit: true
				    		}
				    	},
				    	y: {
				    		show: false
				    	}
				    },
				    size:size,
				    padding: {
			    		bottom: 20
			    	},
				    data: {

				    	types: {
				    		'Passed': 'bar',
				    		'Failed': 'bar',
				    		'Incomplete': 'bar'
				    	},
				      	columns: [
				      	  	['Passed', assessment._scoreAsPercent],
				      	  	['Failed', (assessment._completedAsPercent - assessment._scoreAsPercent)],
				      	  	['Incomplete', 100 - assessment._completedAsPercent]
				     	],
				     	groups: [
				     		['Passed','Failed', 'Incomplete']
				     	],
				     	order: 'asc',
				     	onclick: function(event) {
			    			return false;
			    		},
			    		onmouseover: function(event) {
			    			return false;
			    		}
				    },
				    legend: {
				    	show: false
				    }
				};
				break;
			}
			var chart = c3.generate(chartData);
		}
	});

	return assessmentItem;

});