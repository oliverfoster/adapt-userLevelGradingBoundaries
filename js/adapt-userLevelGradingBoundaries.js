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

	var _isEnabled = false;
	var _NavBarView = undefined;

	var userLevelGradingBoundaries = new (Backbone.View.extend({
		model: new Backbone.Model({
			_isResultsShown: false,
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
		processScore : function(assess) {
			var _assessments = userLevelGradingBoundaries.model.get("_assessments");
			if (_assessments === undefined) return;
			var assessment = _.findWhere(_assessments, { _assessmentId: assess._id });

			var assess = Adapt.diffuseAssessment.getAssessmentById(assessment._assessmentId);
			
			assessment._currentScoreRatio = Math.round((assess._score === 0 ? 0 : assess._score / assess._completed) * 1000) / 1000;
            assessment._remainingScore = assess._possibleScore - assess._completed;
            assessment._isComplete = (assessment._remainingScore === 0);
            assessment._projectedScore = assess._score + (isNaN(assessment._currentScoreRatio) ? 0 : assessment._remainingScore * assessment._currentScoreRatio );
            assessment._highestScore = assess._score + assessment._remainingScore;
            assessment._projectedScoreAsPercent = Math.round((100 / assess._possibleScore) * assessment._projectedScore);
            assessment._highestScoreAsPercent = Math.round((100 / assess._possibleScore) * assessment._highestScore);
            if (assessment._scoreToPassAsPercent !== undefined) {
            	assessment._isPassed = assess._scoreAsPercent >= assessment._scoreToPassAsPercent;
            } else if (assessment._scoreToPass !== undefined) {
	            assessment._isPassed = assess._score >= assessment._scoreToPass;
	        }

		},
		processPoints: function(assess) {
			var _assessments = userLevelGradingBoundaries.model.get("_assessments");
			if (_assessments === undefined) return;
			var assessment = _.findWhere(_assessments, { _assessmentId: assess._id });

			var assess = Adapt.diffuseAssessment.getAssessmentById(assessment._assessmentId);

			var _points = assessment['_points'];
			if (_points instanceof Array) {
				var maxPoint = _.max(_points, function(item) { return item._points; })._points;
				var currentPoints = 0;
				var countRightFirstTime = 0;

				_.each(assess._descendentComponentModels, function(component) {
					if (component._isCorrect !== true || component._isComplete !== true ) return;							
		            for (var f = 0; f < _points.length; f++) {
		            	var item = _points[f];
		            	if (item._forAttemptsToCorrect !== undefined && component._interactions >= item._forAttemptsToCorrect._min && component._interactions <= item._forAttemptsToCorrect._max) {
		            		currentPoints = currentPoints + item._points;
		            		break;
		            	}

		            }
		            if (component._interactions == 1) countRightFirstTime++;
		        });
		        _.each(assess._componentModels, function(component) {
					if (component._isCorrect !== true || component._isComplete !== true ) return;							
		            for (var f = 0; f < _points.length; f++) {
		            	var item = _points[f];
		            	if (item._forAttemptsToCorrect !== undefined && component._interactions >= item._forAttemptsToCorrect._min && component._interactions <= item._forAttemptsToCorrect._max) {
		            		currentPoints = currentPoints + item._points;
		            		break;
		            	}

		            }
		            if (component._interactions == 1) countRightFirstTime++;
		        });

				var possiblePoints = assess._completeDescendentComponents * maxPoint;
				var totalPoints = assess._descendentComponents * maxPoint;
				var highestPoints = (assess._incompleteDescendentComponents * maxPoint) + currentPoints;
		        var averagePoints = (currentPoints === 0 ? 0 : (maxPoint / possiblePoints) * currentPoints);
		        var highestAveragePoints = (currentPoints === 0 ? 0 : (maxPoint / totalPoints) * highestPoints);

		        assessment._maxPoint = maxPoint;
		        assessment._currentPoints = currentPoints;
		        assessment._highestPoints = highestPoints;
		        assessment._possiblePoints = possiblePoints;
		        assessment._averagePoints = Math.round(averagePoints*1000) / 1000;
		        assessment._highestAveragePoints = Math.round(highestAveragePoints*1000) / 1000;
		        assessment._countRightFirstTime = countRightFirstTime;
		        assessment._averagePointsAsPercent = Math.round((100/maxPoint) * averagePoints);
		        assessment._countRightFirstTimeAsPercent = Math.round(assess._completeDescendentComponents === 0 ? 0 : (100/assess._completeDescendentComponents) * assessment._countRightFirstTime);
		    }
		},
		processMarking: function(assess) {
			var _assessments = userLevelGradingBoundaries.model.get("_assessments");
			if (_assessments === undefined) return;
			var assessment = _.findWhere(_assessments, { _assessmentId: assess._id });
			
			var assess = Adapt.diffuseAssessment.getAssessmentById(assessment._assessmentId);
			
			assessment._currentMark = undefined;
            assessment._projectedMark = undefined;
            assessment._highestMark = undefined;

            var _marking = assessment['_marking'];
            if (_marking !== undefined) {
	            for (var f = 0; f < _marking.length; f++) {
	                var item = _marking[f];
	                if (assessment._currentMark === undefined) { 
		                if (item._forScoreAsPercent !== undefined && item._forScoreAsPercent._max >= assess._scoreAsPercent && item._forScoreAsPercent._min <= assess._scoreAsPercent ) {
		                    assessment._currentMark = item;
		                } else if (item._forScore !== undefined && item._forScore._max >= assess._score && item._forScore._min <= assess._score ) {
		                    assessment._currentMark = item;
		                } else if (item._forPoints !== undefined && item._forPoints._max >= assessment._currentPoints && item._forPoints._min <= assessment._currentPoints ) {
		                    assessment._currentMark = item;
		                } else if (item._forAveragePoints !== undefined && item._forAveragePoints._max >= assessment._averagePoints && item._forAveragePoints._min <= assessment._averagePoints ) {
		                    assessment._currentMark = item;
		                }
		            }
		            if ( assessment._projectedMark === undefined) {
		                if (item._forScoreAsPercent !== undefined && item._forScoreAsPercent._max >= assessment._projectedScoreAsPercent && item._forScoreAsPercent._min <= assessment._projectedScoreAsPercent ) {
		                    assessment._projectedMark = item;
		                } else if (item._forAveragePoints !== undefined && item._forAveragePoints._max >= assessment._averagePoints && item._forAveragePoints._min <= assessment._averagePoints ) {
		                    assessment._projectedMark = item;
		                }
		            }
		            if (assessment._highestMark === undefined) {
		                if (item._forScoreAsPercent !== undefined && item._forScoreAsPercent._max >= assessment._highestScoreAsPercent && item._forScoreAsPercent._min <= assessment._highestScoreAsPercent ) {
		                    assessment._highestMark = item;
		                } else if (item._forAveragePoints !== undefined && item._forAveragePoints._max >= assessment._highestAveragePoints && item._forAveragePoints._min <= assessment._highestAveragePoints ) {
		                    assessment._highestMark = item;
		                }
		            }
	            }
	        }

	        if (assessment._pushGradingToCertificate && assessment._currentMark !== undefined) Adapt.trigger("learnerassistant:currentMarkChanged", assessment._currentMark);
	        if (assessment._isComplete && assessment._pushGradingToCertificate && assessment._currentMark !== undefined) Adapt.trigger("learnerassistant:finalMarkChanged", assessment._currentMark);

		},
		processFeedback: function(assess) {
			var _assessments = userLevelGradingBoundaries.model.get("_assessments");
			if (_assessments === undefined) return;
			var assessment = _.findWhere(_assessments, { _assessmentId: assess._id });

			var _marking = assessment['_marking'];
            var _feedback = assessment['_feedback'];

            var currentFeedback = undefined;

            if (_feedback instanceof Array && _marking !== undefined) {
	            for (var f = 0; f < _feedback.length; f++) {
	            	var item = _feedback[f];
	            	if (item._forCurrentMark !== undefined && assessment._currentMark !== undefined && item._forCurrentMark.split(" ").indexOf(assessment._currentMark._mark) > -1 ) {
	            		currentFeedback = item;
	            		break;
	            	} else if (!assessment._isComplete && item._forProjectedMark !== undefined && item._forHighestMark !== undefined &&  assessment._highestMark !== undefined && assessment._projectedMark !== undefined && item._forProjectedMark.split(" ").indexOf(assessment._projectedMark._mark) > -1 && item._forHighestMark.split(" ").indexOf(assessment._highestMark._mark) > -1) {
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
	        	assessment._currentFeedback = currentFeedback;

	        	var assess = Adapt.diffuseAssessment.getAssessmentById(assessment._assessmentId);
				var params = $.extend(true, {}, assessment);
				params = _.extend(params, assess);

	            var fb = {
	            	title: HBS.compile(currentFeedback.title)(params),
	            	body: HBS.compile(currentFeedback.body)(params)
	            };
	            
	            assessment._currentFeedback = fb;
	        } else {
	        	console.log("No feedback specified for assessment: " + assessment._assessmentId + ", assessment._isComplete: "+ (assessment._isComplete ? "yes (using finalMark), " : "no (using projectedMark), ") + " currentMark:" + assessment._currentMark._mark + ", projectedMark:" + assessment._projectedMark._mark + ", highestMark:" + assessment._highestMark._mark);
	        }

		},
		processQuizBanks: function(assess) {
			var _assessments = userLevelGradingBoundaries.model.get("_assessments");
			if (_assessments === undefined) return;
			var assessment = _.findWhere(_assessments, { _assessmentId: assess._id });

			var _articleAssessment = userLevelGradingBoundaries.model.get("_articleAssessment");


			if (_articleAssessment === undefined) return;
			var _assessment = _articleAssessment.model.get("_assessment");
			if (_assessment._banks === undefined || !(_assessment._banks._isEnabled)) {
			       console.log("Banks not enabled on _articleAssessment");
			}
			var _allQuizBankComponents = _articleAssessment._quizBankComponents;
			var _quizBankComponentsByQuizBank = _allQuizBankComponents.groupBy("_quizBankID");
	
			var _marking = assessment['_marking'];
            var _quizBank = assessment['_quizBank'];

            var currentQuizBankFeedback = undefined;
            var projectedQuizBankFeedback = undefined;

			if (_quizBank !== undefined && _marking !== undefined) {
	            for (var f = 0; f < _quizBank._feedback.length; f++) {
	            	var item = _quizBank._feedback[f];
	            	if (currentQuizBankFeedback === undefined) {
		            	if (item._forCurrentMark !== undefined && assessment._currentMark !== undefined && item._forCurrentMark.split(" ").indexOf(assessment._currentMark._mark) > -1 ) {
		            		currentQuizBankFeedback = item;
			            } else if (!assessment._isComplete && item._forProjectedMark !== undefined && item._forHighestMark !== undefined &&  assessment._highestMark !== undefined && assessment._projectedMark !== undefined && item._forProjectedMark.split(" ").indexOf(assessment._projectedMark._mark) > -1 && item._forHighestMark.split(" ").indexOf(assessment._highestMark._mark) > -1) {
		            		currentQuizBankFeedback = item;
			            } else if (assessment._isComplete && item._forFinalMark !== undefined && assessment._currentMark !== undefined && item._forFinalMark.split(" ").indexOf(assessment._currentMark._mark) > -1) {
		            		currentQuizBankFeedback = item;
		            	}
		            }
		            if (projectedQuizBankFeedback === undefined) {
		            	if (item._forCurrentMark !== undefined && assessment._projectedMark !== undefined && item._forCurrentMark.split(" ").indexOf(assessment._projectedMark._mark) > -1 ) {
		            		projectedQuizBankFeedback = item;
			            } else if (!assessment._isComplete && item._forProjectedMark !== undefined && item._forHighestMark !== undefined &&  assessment._highestMark !== undefined && assessment._projectedMark !== undefined && item._forProjectedMark.split(" ").indexOf(assessment._projectedMark._mark) > -1 && item._forHighestMark.split(" ").indexOf(assessment._highestMark._mark) > -1) {
		            		projectedQuizBankFeedback = item;
			            } else if (assessment._isComplete && item._forFinalMark !== undefined && assessment._projectedMark !== undefined && item._forFinalMark.split(" ").indexOf(assessment._projectedMark._mark) > -1) {
		            		projectedQuizBankFeedback = item;
		            	}
		            }
	            }

	        }

	       

	        if (currentQuizBankFeedback !== undefined) {
	        	var bankQuestions = _assessment._banks._split.split(",");

	        	var _quizBankID = assessment._quizBank._quizBankID
            	var _quizBankComponents = _allQuizBankComponents.where({ _quizBankID: _quizBankID});

	        	var maxBankQuestions = _.max(_quizBank._feedback, function(item) { 
	        		if (item._itemsAsPercent) {
	        			return Math.round(( _quizBankComponents.length /100 ) * item._itemsAsPercent);
	        		} else {
	        			return item._items; 
	        		}
	        	})._items;
	        	var minBankQuestions = _.min(_quizBank._feedback, function(item) { 
	        		if (item._itemsAsPercent) {
	        			return Math.round(( _quizBankComponents.length /100 ) * item._itemsAsPercent);
	        		} else {
	        			return item._items; 
	        		}
	        	})._items;

	        	if (parseInt(bankQuestions[_quizBankID - 1]) === 0) {
	        		maxBankQuestions = 0;
	        		minBankQuestions = 0;
	        	}

	        	assessment._minBankQuestions = minBankQuestions;
	        	assessment._maxBankQuestions = maxBankQuestions;
				assessment._currentQuizBankFeedback = $.extend(true, {}, currentQuizBankFeedback);

	        	var assess = Adapt.diffuseAssessment.getAssessmentById(assessment._assessmentId);
				var params = $.extend(true, {}, assessment);
				params = _.extend(params, assess);

            	assessment._currentQuizBankFeedback.title = HBS.compile(currentQuizBankFeedback.title)(params);
            	assessment._currentQuizBankFeedback.body = HBS.compile(currentQuizBankFeedback.body)(params);

            	

				if (currentQuizBankFeedback._itemsAsPercent !== undefined) 
            		currentQuizBankFeedback._items = Math.round(( _quizBankComponents.length /100 ) * currentQuizBankFeedback._itemsAsPercent);

            	if (projectedQuizBankFeedback._itemsAsPercent !== undefined) 
            		projectedQuizBankFeedback._items = Math.round(( _quizBankComponents.length /100 ) * projectedQuizBankFeedback._itemsAsPercent);

            	if (parseInt(bankQuestions[_quizBankID - 1]) !== 0) {
            		assessment._projectedBankQuestions = projectedQuizBankFeedback._items;
            	} else {
            		assessment._projectedBankQuestions._items = 0;
            	}

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

				

				if (parseInt(bankQuestions[_quizBankID - 1]) !== 0) {
					bankQuestions[_quizBankID - 1] = currentQuizBankFeedback._items;
				} else {
					currentQuizBankFeedback._items = 0;
				}

				_assessment._banks._split = bankQuestions.join(",");

			} else {
	        	console.log("No quizbankfeedback specified for assessment: " + assessment._assessmentId + ", assessment._isComplete: "+ (assessment._isComplete ? "yes (using finalMark), " : "no (using projectedMark), ") + " currentMark:" + assessment._currentMark._mark + ", projectedMark:" + assessment._projectedMark._mark + ", highestMark:" + assessment._highestMark._mark);
	        }

			var bankQuestions = _assessment._banks._split.split(",");
			if (assessment._quizBank) {

            	assessment._countBankQuestions = parseInt(bankQuestions[assessment._quizBank._quizBankID - 1]);

            } else {
	            var cateredQuizBanks = [];
            	assessment._maxBankQuestions = 0;
            	assessment._minBankQuestions = 0;
	            assessment._countBankQuestions = 0;
	            assessment._projectedBankQuestions = 0;
	             _.each(assess._assessmentModels, function(item) {
	            	
	            	var ulgbassess = _.findWhere(_assessments, { _assessmentId: item._id });
	            	if (ulgbassess._quizBank !== undefined) {
	            		var projectedQuizBankFeedback = undefined;
	            		cateredQuizBanks.push(ulgbassess._quizBank._quizBankID);
	            		for (var f = 0; f < ulgbassess._quizBank._feedback.length; f++) {
			            	var item = ulgbassess._quizBank._feedback[f];
				            if (projectedQuizBankFeedback === undefined) {
				            	if (item._forCurrentMark !== undefined && assessment._projectedMark !== undefined && item._forCurrentMark.split(" ").indexOf(assessment._projectedMark._mark) > -1 ) {
				            		projectedQuizBankFeedback = item;
					            } else if (!assessment._isComplete && item._forProjectedMark !== undefined && item._forHighestMark !== undefined &&  assessment._highestMark !== undefined && assessment._projectedMark !== undefined && item._forProjectedMark.split(" ").indexOf(assessment._projectedMark._mark) > -1 && item._forHighestMark.split(" ").indexOf(assessment._highestMark._mark) > -1) {
				            		projectedQuizBankFeedback = item;
					            } else if (assessment._isComplete && item._forFinalMark !== undefined && assessment._projectedMark !== undefined && item._forFinalMark.split(" ").indexOf(assessment._projectedMark._mark) > -1) {
				            		projectedQuizBankFeedback = item;
				            	}
				            }
			            }
			            if (projectedQuizBankFeedback !== undefined) {
			            	if (projectedQuizBankFeedback._itemsAsPercent !== undefined) 
            					projectedQuizBankFeedback._items = Math.round(( ulgbassess._maxBankQuestions /100 ) * projectedQuizBankFeedback._itemsAsPercent);
		            			if (parseInt(bankQuestions[_quizBankID - 1]) === 0) {
				            		projectedQuizBankFeedback._items = 0;
		            			}
			            	if (ulgbassess._projectedBankQuestions) assessment._projectedBankQuestions += projectedQuizBankFeedback._items;
			            } else {
			            	if (ulgbassess._projectedBankQuestions) assessment._projectedBankQuestions += ulgbassess._projectedBankQuestions;
			            }
			            
			        } else {
			        	if (ulgbassess._projectedBankQuestions) assessment._projectedBankQuestions += ulgbassess._projectedBankQuestions;
			        }
			        if (parseInt(bankQuestions[ulgbassess._quizBank._quizBankID - 1]) !== 0) {
		            	if (ulgbassess._maxBankQuestions) assessment._maxBankQuestions += ulgbassess._maxBankQuestions;
		            	if (ulgbassess._minBankQuestions) assessment._minBankQuestions += ulgbassess._minBankQuestions;
		            	if (ulgbassess._countBankQuestions) assessment._countBankQuestions += ulgbassess._countBankQuestions;
		            }
	            });
	            for (var i = 0; i < bankQuestions.length; i ++) {
	            	if (cateredQuizBanks.indexOf(i+1) > -1) continue;
	            	assessment._maxBankQuestions += parseInt(bankQuestions[i]);
	            	assessment._countBankQuestions += parseInt(bankQuestions[i]);
	            	assessment._projectedBankQuestions += parseInt(bankQuestions[i]);
	            }
	        }

	        assessment._countBankQuestionsAsPercent = (100/assessment._maxBankQuestions) * assessment._countBankQuestions;

			//Reset article assessment model
			_articleAssessment.model.getChildren().models = _articleAssessment.model.get("assessmentModel").setQuizData();

		}
	}))();

	var _views = userLevelGradingBoundaries.model.get("_views");
	_views['results-view'] = new DAResults();
	_views['bottomnavigation-view'] = new DABottomNavigation();
	_views['topnavigation-view'] = new DATopNavigation();

	Adapt.once("diffuseAssessment:initialized", function () {
		if (!_isEnabled) return;
		_views['results-view'].model.set("_diffuseAssessment", Adapt.diffuseAssessment.model);
	});

	Adapt.once("userLevelGradingBoundaries:initialized", function() {
		if (!_isEnabled) return;
		_views['results-view'].model.set("_userLevelGradingBoundaries", Adapt.userLevelGradingBoundaries.model);
		_views['bottomnavigation-view'].model.set("_userLevelGradingBoundaries", Adapt.userLevelGradingBoundaries.model);
		_views['topnavigation-view'].model.set("_userLevelGradingBoundaries", Adapt.userLevelGradingBoundaries.model);
	});

	Adapt.on("pageMenuRouter:topNavigationView:postRender", function(view) {

		_NavBarView = view;
		var assess = Adapt.diffuseAssessment.getAssessmentById("total");
		var ass = userLevelGradingBoundaries.model.get("_assessmentsById")['total'];
		var progCount = view.$el.find(".progress-count");
		if (!view.$el.attr("old-classes")) view.$el.attr("old-classes", view.$el.attr("class"));
		view.$el.attr("class",view.$el.attr("old-classes")).addClass(ass._projectedMark._mark);
		if (ass._isComplete) progCount.html( ass._countBankQuestions );
		else progCount.html( ass._projectedBankQuestions );

	});

	Adapt.on("userLevelGradingBoundaries:tutorOpen", function() {
		var _notify = undefined;

		_notify = userLevelGradingBoundaries.model.get("_tutorButton");

		if (_notify !== undefined) {
			if (! _notify._show) return;
			
			var alertObject = {
			    title: _notify.title,
			    body: _notify.body,
			    confirmText: _notify.button,
			    _callbackEvent: "",
			    _showIcon: false
			};

			Adapt.trigger('notify:alert', alertObject);

		}

	});

	Adapt.on("userLevelGradingBoundaries:resultsOpen", function(internal) {
		if (!_isEnabled) return;
		if (!internal) userLevelGradingBoundaries.navigateToOther("results");

		$("html").addClass("user-level-grading-boundaries");

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
		if (!_isEnabled) return;
		if (!internal) userLevelGradingBoundaries.navigateToPrevious(false);
		$("html").removeClass("user-level-grading-boundaries");
		_views['topnavigation-view'].$el.remove();
		Adapt.userLevelGradingBoundaries.model.set("_isResultsShown", false);
		Adapt.rollay.hide();
		Adapt.bottomnavigation.hide()
	});

	Adapt.on("router:menu router:page", function() {
		if (!_isEnabled) return;
		if (Adapt.userLevelGradingBoundaries.model.get("_isResultsShown") === true) {
			Adapt.trigger("userLevelGradingBoundaries:resultsClose", true);
		}
	});

	Adapt.on("router:plugin:ulgb", function(pluginName, location, action) {
		if (!_isEnabled) return;
		switch (location) {
		case "results":
			Adapt.trigger("userLevelGradingBoundaries:resultsOpen", true);
			break;
		}
	});

	Adapt.once("app:dataReady", function() {

		var model = Adapt.course.get("_userLevelGradingBoundaries");
		if (model === undefined || model._isEnabled === false) return;

		_isEnabled = true;

		if (model._assessments !== undefined) {

			//var countBankQuestions = 0;
			//var allBankQuestions = 0;
			//var bankQuestions = 0;
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
				//bankQuestions = _articleAssessment.model.get("_assessment")._banks._split.split(",");
				//countBankQuestions = _.reduce(bankQuestions, function (rtn, item) { return rtn+parseInt(item); }, 0);
				//allBankQuestions = countBankQuestions;
				userLevelGradingBoundaries.model.set("_articleAssessment", _articleAssessment );

			} else {
				console.error("No Article Assessment in course!");
			}


			var assessmentById = {};
			_.each(model._assessments, function(assess) {
				assessmentById[assess._assessmentId] = assess;
				assess._countRightFirstTime = 0;
				assess._countRightFirstTimeAsPercent = 0;
				assess._currentPoints = 0;
				assess._maxPoint = 0;
		        assess._possiblePoints = 0;
		        assess._averagePoints = 0;
		        assess._averagePointsAsPercent = 0;
				assess._currentQuizBankFeedback = undefined;
				assess._currentFeedback = undefined;
				assess._currentPoints = undefined;
				assess._currentMark = undefined;
	            assess._projectedMark = undefined;
	            assess._highestMark = undefined;
	            assess._currentScoreRatio = 0;
	            assess._remainingScore = 0;
	            assess._isComplete = false;
	            assess._projectedScore = 0;
	            assess._highestScore = 0;
	            assess._projectedScoreAsPercent = 0;
	            assess._highestScoreAsPercent = 100;
	            assess._isPassed = false;
	            assess._projectedBankQuestions = 0;
	            assess._countBankQuestions = 0;
	            assess._maxBankQuestions = 0;
	            /*// if (assess._quizBank) {
	            assess._countBankQuestions = parseInt(bankQuestions[assess._quizBank._quizBankID - 1]);
	            assess._allBankQuestions =  parseInt(bankQuestions[assess._quizBank._quizBankID - 1]);
	            //} else {
		        assess._countBankQuestions = countBankQuestions;
		        assess._allBankQuestions = allBankQuestions;
		        //}
		        assess._countBankQuestionsAsPercent = Math.round((100/assess._allBankQuestionss) * assess._countBankQuestions);*/
			});
			model._assessmentsById = assessmentById;
		}

		userLevelGradingBoundaries.model.set(model);

		Adapt.trigger("userLevelGradingBoundaries:initialized");
	});


	Adapt.on("diffuseAssessment:assessmentCalculate", function(assessment) {
		if (!_isEnabled) return;
		Adapt.userLevelGradingBoundaries.processScore(assessment);
		Adapt.userLevelGradingBoundaries.processPoints(assessment);
		Adapt.userLevelGradingBoundaries.processMarking(assessment);
		Adapt.userLevelGradingBoundaries.processQuizBanks(assessment);
		Adapt.userLevelGradingBoundaries.processFeedback(assessment);
	});

	Adapt.on("diffuseAssessment:assessmentComplete", function(assessment) {
		if (!_isEnabled) return;
		Adapt.userLevelGradingBoundaries.processScore(assessment);
		Adapt.userLevelGradingBoundaries.processPoints(assessment);
		Adapt.userLevelGradingBoundaries.processMarking(assessment);
		Adapt.userLevelGradingBoundaries.processQuizBanks(assessment);
		Adapt.userLevelGradingBoundaries.processFeedback(assessment);
	});

	Adapt.on("diffuseAssessment:recalculated", function() {
		Adapt.trigger("pageMenuRouter:topNavigationView:postRender", _NavBarView);
	});

	Adapt.userLevelGradingBoundaries = userLevelGradingBoundaries;
});
