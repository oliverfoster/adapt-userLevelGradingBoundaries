/*
* adapt-userLevelGradingBoundaries
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Oliver Foster <oliver.foster@kineo.com>
*/

define(function(require) {

	var Adapt = require('coreJS/adapt');
	var Backbone = require('backbone');

	var bottomNavigationView = Backbone.View.extend({
		className: "ulgb-bottomnavigation",
		events: {
			"click #ulgb-tutor-button" : "onTutorButtonClick",
			"click #ulgb-end" : "onClose"
		},
		initialize: function() {
			this.model = new Backbone.Model({});
		},
		render: function() {
			var template = Handlebars.templates['ulgb-bottomnavigation'];
			var data = {
				_userLevelGradingBoundaries: this.model.get("_userLevelGradingBoundaries").toJSON()
			};
			this.$el.html(template( data ));
			_.defer(_.bind(this.postRender, this));
		},
		postRender: function () {

		},
		onClose: function(event) {
			event.preventDefault();
			
			Adapt.trigger("userLevelGradingBoundaries:resultsClose");
		},

		onTutorButtonClick: function(event) {
			event.preventDefault();

			Adapt.trigger("userLevelGradingBoundaries:tutorOpen");
		}
	});

	return bottomNavigationView;

});