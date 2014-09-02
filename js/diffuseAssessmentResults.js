/*
* adapt-UserLevelGradingBoundaries
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Oliver Foster <oliver.foster@kineo.com>
*/

define(function(require) {

	var Adapt = require('coreJS/adapt');
	var Backbone = require('backbone');
	var c3import = require('extensions/adapt-UserLevelGradingBoundaries/js/c3.min');

	var resultsView = new (Backbone.View.extend({
			className: "da-results",
			render: function() {
				var template = Handlebars.templates['diffuseAssessmentResults'];
				this.$el.html(template());
				_.defer(this.postRender);
			},
			postRender: function () {

			}
	}))();

	Adapt.on("diffuseAssessment:resultsOpen", function() {
		var assessment1 = Adapt.diffuseAssessment.getAssessmentById("assessment1");

		Adapt.rollay.setCustomView(resultsView);
		Adapt.rollay.show(function() {
			var chart = c3.generate({
			    bindto: '.da-results #chart',
			    color: {
			    	pattern: ['green','red']
			    },
			    interaction: {
			    	enabled: false
			    },
			    data: {
			    	types: {
			    		'Passed': 'bar',
			    		'Failed': 'bar'
			    	},
			      	columns: [
			      	  	['Passed', assessment1._scoreAsPercent],
			      	  	['Failed', 100 - assessment1._scoreAsPercent]
			     	],
			     	groups: [
			     		['Passed','Failed']
			     	],
			     	order: 'asc'
			    },
			    legend: {
			    	item: {
			    		onclick: function(event) {
			    			return false;
			    		}
			    	}
			    },
			    pie: {
		    		expand: {
		    			enabled: false
		    		}
			    }
			});
		});
	});

});