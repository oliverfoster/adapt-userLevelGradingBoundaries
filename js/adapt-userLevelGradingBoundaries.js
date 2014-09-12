/*
* adapt-userLevelGradingBoundaries
* License - http://github.com/adaptlearning/adapt_framework/LICENSE
* Maintainers - Oliver Foster <oliver.foster@kineo.com>
*/

define(function(require) {

	var Adapt = require('coreJS/adapt');
	var Router = require('coreJS/router');
	var Backbone = require('backbone');
	var DAResults = require('extensions/adapt-userLevelGradingBoundaries/js/ulgb-dashboard');
	var DABottomNavigation = require('extensions/adapt-userLevelGradingBoundaries/js/ulgb-bottomnavigation');
	var DATopNavigation = require('extensions/adapt-userLevelGradingBoundaries/js/ulgb-topnavigation');
	var HBS = require('extensions/adapt-userLevelGradingBoundaries/js/handlebars-v1.3.0');

	var userLevelGradingBoundaries = new (Backbone.View.extend({
		model: new Backbone.Model({
			_isResultsShow: false,
			_views: []
		}),
		navigateToOther: function(page, replace) {
			if (replace === undefined) replace = true;
			Backbone.history.navigate("#/ulgb/"+page, {trigger: false, replace: replace});
		},
		navigateToPrevious: function(replace) {
			Adapt.router.set("_canNavigate",true);
			Router.navigateToPreviousRoute();
		},
		processMarking: function() {
			var _diffuseAssessment = userLevelGradingBoundaries.model.get("_diffuseAssessment");
			if (_diffuseAssessment !== undefined) {
				_.each(_diffuseAssessment._assessments, function(assessment) {
					var assess = Adapt.diffuseAssessment.getAssessmentById(assessment._assessmentId);
					
					assessment._currentMark = undefined;
		            assessment._projectedMark = undefined;
		            assessment._highestMark = undefined;
		            assessment._currentScoreRatio = assess._score / assess._completed;
		            assessment._remainingScore = assess._possibleScore - assess._completed;
		            assessment._isComplete = (assessment._remainingScore === 0);
		            assessment._projectedScore = assess._score + (isNaN(assessment._currentScoreRatio) ? 0 : assessment._remainingScore * assessment._currentScoreRatio );
		            assessment._highestScore = assess._score + assessment._remainingScore;
		            assessment._projectedScoreAsPercent = (100 / assess._possibleScore) * assessment._projectedScore;
		            assessment._highestScoreAsPercent = (100 / assess._possibleScore) * assessment._highestScore;
		            if (assessment._scoreToPassAsPercent !== undefined) {
		            	assessment._isPassed = assess._scoreAsPercent >= assessment._scoreToPassAsPercent;
		            } else if (assessment._scoreToPass !== undefined) {
			            assessment._isPassed = assess._score >= assessment._scoreToPass;
			        }

		            var _marking = assessment['_marking'];
		            if (_marking !== undefined) {
			            for (var f = 0; f < _marking.length; f++) {
			                var item = _marking[f];
			                if (item._forScoreAsPercent !== undefined && item._forScoreAsPercent._max >= assess._scoreAsPercent && item._forScoreAsPercent._min <= assess._scoreAsPercent ) {
			                    assessment._currentMark = item;
			                } else if (item._forScore !== undefined && item._forScore._max >= assess._score && item._forScore._min <= assess._score ) {
			                    assessment._currentMark = item;
			                }
			                if (item._forScoreAsPercent !== undefined && item._forScoreAsPercent._max >= assessment._projectedScoreAsPercent && item._forScoreAsPercent._min <= assessment._projectedScoreAsPercent ) {
			                    assessment._projectedMark = item;
			                }
			                if (item._forScoreAsPercent !== undefined && item._forScoreAsPercent._max >= assessment._highestScoreAsPercent && item._forScoreAsPercent._min <= assessment._highestScoreAsPercent ) {
			                    assessment._highestMark = item;
			                }
			            }
			        }
		        });
			}
		},
		processFeedback: function() {
			var _diffuseAssessment = userLevelGradingBoundaries.model.get("_diffuseAssessment");
			if (_diffuseAssessment !== undefined) {
				_.each(_diffuseAssessment._assessments, function(assessment) {

					var _marking = assessment['_marking'];
		            var _feedback = assessment['_feedback'];

		            var currentFeedback = undefined;

		            if (_feedback instanceof Array && _marking !== undefined) {
			            for (var f = 0; f < _feedback.length; f++) {
			            	var item = _feedback[f];
			            	if (!assessment._isComplete && item._forProjectedMark !== undefined && item._forHighestMark !== undefined &&  item._forProjectedMark.split(" ").indexOf(assessment._projectedMark._mark) > -1 && item._forHighestMark.split(" ").indexOf(assessment._highestMark._mark) > -1) {
			            		currentFeedback = item;
			            		break;
			            	} else if (assessment._isComplete && item._forFinalMark !== undefined && assessment._currentMark !== undefined && item._forFinalMark.split(" ").indexOf(assessment._currentMark._mark) > -1) {
			            		currentFeedback = item;
			            		break;
			            	}
			            }
			        } else if (_feedback !== undefined) {
			        	currentFeedback = _feedback;
			        }

			        if (currentFeedback !== undefined) {
			            var fb = {
			            	title: HBS.compile(currentFeedback.title)(assessment),
			            	body: HBS.compile(currentFeedback.body)(assessment)
			            };
			            
			            assessment._currentFeedback = fb;
			        }
		        });
			}
		},
		processQuizBanks: function() {
			var _diffuseAssessment = userLevelGradingBoundaries.model.get("_diffuseAssessment");
			var _articleAssessment = userLevelGradingBoundaries.model.get("_articleAssessment");


			if (_articleAssessment === undefined) return;
			var _assessment = _articleAssessment.model.get("_assessment");
			if (_assessment._banks === undefined || !(_assessment._banks._isEnabled)) {
			       console.log("Banks not enabled on _articleAssessment");
			}
			var _allQuizBankComponents = _articleAssessment._quizBankComponents;
			var _quizBankComponentsByQuizBank = _allQuizBankComponents.groupBy("_quizBankID");
			

			if (_diffuseAssessment === undefined) return;
			_.each(_diffuseAssessment._assessments, function(assessment) {
				
				var _marking = assessment['_marking'];
	            var _quizBank = assessment['_quizBank'];

	            var currentQuizBankFeedback = undefined;

				if (_quizBank !== undefined && _marking !== undefined) {
		            for (var f = 0; f < _quizBank._feedback.length; f++) {
		            	var item = _quizBank._feedback[f];
		            	if (assessment._isComplete && item._forFinalMark !== undefined && assessment._currentMark !== undefined && item._forFinalMark.split(" ").indexOf(assessment._currentMark._mark) > -1) {
		            		currentQuizBankFeedback = item;
		            		break;
		            	}
		            }
		        }

		        if (currentQuizBankFeedback !== undefined) {
		        	assessment._currentQuizBankFeedback = _.extend({}, currentQuizBankFeedback);
	            	assessment._currentQuizBankFeedback.title = HBS.compile(currentQuizBankFeedback.title)(assessment);
	            	assessment._currentQuizBankFeedback.body = HBS.compile(currentQuizBankFeedback.body)(assessment);

	            	console.log(assessment._currentQuizBankFeedback);

	            	var _quizBankID = assessment._quizBank._quizBankID
	            	var _quizBankComponents = _allQuizBankComponents.where({ _quizBankID: _quizBankID});

					if (currentQuizBankFeedback._itemsAsPercent !== undefined) 
	            		currentQuizBankFeedback._items = Math.round(( _quizBankComponents.length /100 ) * currentQuizBankFeedback._itemsAsPercent);

	            	if (_quizBankComponentsByQuizBank[_quizBankID] === undefined) {
	            		console.error("Quiz bank does not exist:" + _quizBankID);
	            		return;
	            	}

					if (currentQuizBankFeedback._items > _quizBankComponentsByQuizBank[_quizBankID].length ) {
						console.error("Trying to assign more items to the quiz bank (" + _quizBankID + ") than exist in the bank:" + currentQuizBankFeedback._items + " vs " +_quizBankComponentsByQuizBank[_quizBankID].length);
						return;
					} else if (currentQuizBankFeedback._items < 0) {
						console.error("Cannot assign negative questions to quiz bank");
						return;
					}

					var splits = _assessment._banks._split.split(",");

					splits[_quizBankID - 1] = currentQuizBankFeedback._items;

					_assessment._banks._split = splits.join(",");

				}

	        });

			//Reset article assessment model
			_articleAssessment.model.getChildren().models = _articleAssessment.model.get("assessmentModel").setQuizData();

		}
	}))();

	var _views = userLevelGradingBoundaries.model.get("_views");
	_views['results-view'] = new DAResults();
	_views['bottomnavigation-view'] = new DABottomNavigation();
	_views['topnavigation-view'] = new DATopNavigation();

	Adapt.once("diffuseAssessment:initialized", function () {
		_views['results-view'].model.set("_diffuseAssessment", Adapt.diffuseAssessment.model);
	});

	Adapt.once("userLevelGradingBoundaries:initialized", function() {
		_views['results-view'].model.set("_userLevelGradingBoundaries", Adapt.userLevelGradingBoundaries.model);
		_views['bottomnavigation-view'].model.set("_userLevelGradingBoundaries", Adapt.userLevelGradingBoundaries.model);
		_views['topnavigation-view'].model.set("_userLevelGradingBoundaries", Adapt.userLevelGradingBoundaries.model);
	});

	Adapt.on("userLevelGradingBoundaries:resultsOpen", function(internal) {
		if (!internal) userLevelGradingBoundaries.navigateToOther("results");

		$("html").addClass("user-level-grading-boundaries");

		Adapt.userLevelGradingBoundaries.processMarking();
		Adapt.userLevelGradingBoundaries.processFeedback();
		Adapt.userLevelGradingBoundaries.model.set("_isResultsShown", true);

		$(".navigation-inner").append( _views['topnavigation-view'].$el );
		_views['topnavigation-view'].render();

		Adapt.rollay.setCustomView(_views['results-view']);
		Adapt.rollay.show(function() {
			_views['results-view'].setReadyStatus();
		});
		Adapt.bottomnavigation.setCustomView(_views['bottomnavigation-view']);
		Adapt.bottomnavigation.show(function() {

		});
	});

	Adapt.on("userLevelGradingBoundaries:resultsClose", function(internal) {
		if (!internal) userLevelGradingBoundaries.navigateToPrevious(false);
		$("html").removeClass("user-level-grading-boundaries");
		_views['topnavigation-view'].$el.remove();
		Adapt.userLevelGradingBoundaries.model.set("_isResultsShown", false);
		Adapt.rollay.hide();
		Adapt.bottomnavigation.hide()
	});

	Adapt.on("router:menu router:page", function() {
		if (Adapt.userLevelGradingBoundaries.model.get("_isResultsShown") === true) {
			Adapt.trigger("userLevelGradingBoundaries:resultsClose", true);
		}
	});

	Adapt.on("router:plugin:ulgb", function(pluginName, location, action) {
		switch (location) {
		case "results":
			Adapt.trigger("userLevelGradingBoundaries:resultsOpen", true);
			break;
		}
	});

	Adapt.once("app:dataReady", function() {

		var model = Adapt.course.get("_userLevelGradingBoundaries");
		
		if (model._diffuseAssessment !== undefined) {
			var assessmentById = {};
			_.each(model._diffuseAssessment._assessments, function(assess) {
				assessmentById[assess._assessmentId] = assess;
			});
			model._diffuseAssessment._assessmentsById = assessmentById;
		}

		userLevelGradingBoundaries.model.set(model);

		//find assessment article and get banks information 
		var assesmentArticleModels = Adapt.articles.filter(function (item) { 
			return item.get("_assessment") !== undefined;
		});
		if (assesmentArticleModels.length > 0) {
			var quizBankComponents = new Backbone.Collection();
			Adapt.blocks.each(function(block) {
				var _quizBankID = block.get("_quizBankID");
				if (_quizBankID !== undefined) {
					var questionComponents = block.get("_children").where({ _isQuestionType: true});
					_.each(questionComponents, function(component) {
						component.set("_quizBankID", _quizBankID);
					})
					quizBankComponents.add(questionComponents);
				}
			});
			var _articleAssessment = {
				model: assesmentArticleModels[0],
				_quizBankComponents: quizBankComponents
			};
			userLevelGradingBoundaries.model.set("_articleAssessment", _articleAssessment );
		} else {
			console.error("No Article Assessment in course!");
		}
		
		Adapt.trigger("userLevelGradingBoundaries:initialized");
	});

	Adapt.on("diffuseAssessment:recalculated", function() {
		Adapt.userLevelGradingBoundaries.processMarking();
		Adapt.userLevelGradingBoundaries.processQuizBanks();
	});

	Adapt.userLevelGradingBoundaries = userLevelGradingBoundaries;
});