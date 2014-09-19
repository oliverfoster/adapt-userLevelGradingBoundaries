/*
* adapt-userLevelGradingBoundaries
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Oliver Foster <oliver.foster@kineo.com>
*/

define(function(require) {

	var Adapt = require('coreJS/adapt');
	var Backbone = require('backbone');
	var assessmentItem = require('extensions/adapt-userLevelGradingBoundaries/js/ulgb-assessmentItem');
	

	var resultsView = Backbone.View.extend({
		className: "ulgb-dashboard",
		events: {
			"click div#close" : "onClose"
		},
		initialize: function() {
			this.model = new Backbone.Model({});
		},
		render: function() {
			var template = Handlebars.templates['ulgb-dashboard'];
			var data = {};
			if (this.model.get("_assessments") !== undefined) data._assessments = this.model.get("_assessments").toJSON();
			
			if (this.model.get("_userLevelGradingBoundaries") !== undefined) {
				data._userLevelGradingBoundaries = this.model.get("_userLevelGradingBoundaries").toJSON();
			}

			this.$el.html(template( data ));
			
		},
		postRender: function () {
			var _userLevelGradingBoundaries = this.model.get("_userLevelGradingBoundaries").toJSON();
			var children = [];
			var thisHandle = this;
			_userLevelGradingBoundaries._assessments.sort(function(a,b) {
				return a._order -b._order;
			})
			_.each(_userLevelGradingBoundaries._assessments, function(assess) {
				if (assess._results === undefined) return;
				var assessment = Adapt.diffuseAssessment.getAssessmentById(assess._id);
				var ai = new assessmentItem();
				thisHandle.$el.find(".assessmentItem-container").append(ai.$el);
				ai.model.set(assess);
				ai.render();
				children.push(ai);
			});
			this.model.set("_children", children);
		},
		setReadyStatus: function() {
			this.model.set("_isReady");
			_.defer(_.bind(this.postRender, this));

		},
		onClose: function() {
			Adapt.rollay.hide();
		}
	});

	return resultsView;

});