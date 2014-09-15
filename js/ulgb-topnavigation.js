/*
* adapt-userLevelGradingBoundaries
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Oliver Foster <oliver.foster@kineo.com>
*/

define(function(require) {

	var Adapt = require('coreJS/adapt');
	var Backbone = require('backbone');

	var menu = Backbone.View.extend(
		{
			//UI
			tagName: "div",
			className: "ulgb-tutor-icon",
			template: "ulgb-topnavigation",

			initialize: function() {
				this.listenTo(Adapt, 'remove', this.remove);
				this.model= new Backbone.Model();
			},

			//DRAWING
			render: function() {
				var template = Handlebars.templates[this.template];
				var data = {
					_userLevelGradingBoundaries: this.model.get("_userLevelGradingBoundaries").toJSON()
				};
				this.$el.html(template( data ));
				_.defer(_.bind(function() {
					this.postRender();
				}, this));
			},
			
			postRender: function() {
				this.$el.attr("href","#");
				this.undelegateEvents();
				this.delegateEvents();
			},
		
			//EVENTS
			events: {
				'click .title-bar': 'onTutorButtonClick',
				'click .close': 'onEndClick'
			},

			onEndClick: function(event) {
				event.preventDefault();

				Adapt.trigger("userLevelGradingBoundaries:resultsClose");

			},

			onTutorButtonClick: function(event) {
				event.preventDefault();

				Adapt.trigger("userLevelGradingBoundaries:tutorOpen");
			}
			
		}
	);
	return menu;
})