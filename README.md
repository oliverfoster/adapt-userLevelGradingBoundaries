adapt-userLevelGradingBoundaries
================

Extension  

Using diffuseAssessments and contrib-assessment along with rollay and bottomnavigation to provide a course progress screen.  

####Requirements
1. Show feedback for diffuseAssessments (feedback based upon predicted/highest results or current result) as results panel  
2. Change contrib-assessment bank quantities based upon diffuseAssessment outcomes  
  
###Dependencies

Required:   
[adapt-diffuseAssessment](https://github.com/cgkineo/adapt-diffuseAssessment)  
[adapt-contrib-assessment](https://github.com/cgkineo/adapt-contrib-assessment)  

Optional (for results screen):  
[adapt-pageMenuRouter](https://github.com/cgkineo/adapt-pageMenuRouter)  
[adapt-rollay](https://github.com/cgkineo/adapt-rollay)  
[adapt-bottomnavigation](https://github.com/cgkineo/adapt-rollay)  

###Use
Navigate to #/ulgb/results or trigger event Adapt.trigger("userLevelGradingBoundaries:resultsOpen") to open results panel.
Use optional dependencies to show results panel.  
  
Or use to change contrib-assessment banks based upon diffuseAssessment outcome. No results panel is necessary.  

###Public Interface
```
Adapt.userLevelGradingBoundaries.model 
Adapt.userLevelGradingBoundaries.navigateToOther(section, replace) //navigates to #/ulgb/section
Adapt.userLevelGradingBoundaries.navigateToPrevious(replace) //back button equivalent
Adapt.userLevelGradingBoundaries.processPoints() // setup model with current points outcomes
Adapt.userLevelGradingBoundaries.processMarking() // setup model with current marking outcomes
Adapt.userLevelGradingBoundaries.processFeedback() // setup model with current feedback outcomes
Adapt.userLevelGradingBoundaries.processQuizBanks() // setup contrib-assessment with current quizbank outcomes

```

###Model
```
{
	_articleAssessment: {
		model: // model from article assessment 
		_quizBankComponents: // backbone collection of question components
	},
	_buttons: {
		"end": "Close course progress" // close button text
	},
	_assessments: { //see example.json

	},
	_isResultsShown: true/false,
	_views: {
		"results-view": ,
		"bottomnavigation-view": ,
		"topnavigation-view":
	},
	"body": "Body Text",
	"header": "Ongoing course progress",
	"title": "Title text"
}
```

###Feedback/Assessment Model  

To be used in feedback text/bodies, or to extend.
```
{ //mostly calculated at runtime, some carries over from course.json
	_assessmentId: "bank1", //from json, see example.json
	_averagePoints: 0,
	_averagePointsAsPercent:0,
	_countBankQuestions: 0,
	_countBankQuestionsAsPercent: 0,
	_countRightFirstTime: 0,
	_countRightFirstTimeAsPercent: 0,
	_currentFeedback: {
		"body": "",
		"title": ""
	},
	_currentMark: {
		_forScoreAsPercent: {
			_max: 100,
			_min: 0
		},
		_mark: "all",
		displayMark: "All"
	},
	_currentPoints: 0,
	_currentQuizBankFeedback: {
		_forFinalMark: "fail",
		_items: 2,
		_itemsAsPercent: 100,
		body: "Feedback body for showing current mark {{_currentMark.displayMark}}  ",
		title: "Feedback title for showing current mark {{_currentMark.displayMark}}  "
	}
	_currentScoreRatio: 1, // score / completed
	_feedback: [] ,// from json, see example.json
	_highestMark:{
		_forScoreAsPercent: {
			_max: 100,
			_min: 0
		},
		_mark: "all",
		displayMark: "All"
	},
	_highestScore: 0,
	_highestScoreAsPercent: 0,
	_isComplete: true,
	_isPassed: true,
	_marking: [], // from json, see example.json
	_maxBankQuestions: 0,
	_maxPoints: 0,
	_points: [], // from json, see example.json
	_possiblePoitns: 0,
	_projectedMark: {
		_forScoreAsPercent: {
			_max: 100,
			_min: 0
		},
		_mark: "all",
		displayMark: "All"
	},
	_projectedScore: 0,
	_projectedScoreAsPercent: 0,
	_quizBank: {}, // from json, see example.json
	_remainingScore: 0,
	_results: {} // from json, see example.json
	_scoreToPassAsPercent: 100
}
```



###Events

```
Triggers:  
userLevelGradingBoundaries:initialized

Listens To:
userLevelGradingBoundaries:resultsOpen
userLevelGradingBoundaries:resultsClose

```


###Configuration

Please see example.json.

###Points+Marking
To define a points and/or marking system use:
```
"_userLevelGradingBoundaries": {
    "_isEnabled": true,
    "header": "Course Dashboard",
    "_buttons": {
        "end": "Close Course Progress"
    },
    "_assessments" : [
        {
            "_assessmentId": "total",
            "_points": [
                {
                    "_forAttemptsToCorrect": {
                        "_min": 2,
                        "_max": 10000000
                    },
                    "_points": 1
                },
                {
                    "_forAttemptsToCorrect": {
                        "_min": 1,
                        "_max": 1
                    },
                    "_points": 2
                }
            ],
            "_marking": [
                {
                    "_forScoreAsPercent": {
                        "_min": 0,
                        "_max": 24
                    },
                    "_mark": "fail",
                    "displayMark": "Failed"
                },
                {
                    "_forScoreAsPercent": {
                        "_min": 25,
                        "_max": 49
                    },
                    "_mark": "pass",
                    "displayMark": "Pass"
                },
                {
                    "_forScoreAsPercent": {
                        "_min": 50,
                        "_max": 74
                    },
                    "_mark": "merit",
                    "displayMark": "Merit"
                },
                {
                    "_forScoreAsPercent": {
                        "_min": 75,
                        "_max": 100
                    },
                    "_mark": "distinction",
                    "displayMark": "Distinction"
                },

                //or
                {
                    "_forAveragePoints": {
                        "_min": 0,
                        "_max": 0.499
                    },
                    "_mark": "fail",
                    "displayMark": "Ungraded"
                },
                {
                    "_forAveragePoints": {
                        "_min": 0.5,
                        "_max": 0.999
                    },
                    "_mark": "bronze",
                    "displayMark": "Bronze"
                },
                {
                    "_forAveragePoints": {
                        "_min": 1,
                        "_max": 1.499
                    },
                    "_mark": "silver",
                    "displayMark": "Silver"
                },
                {
                    "_forAveragePoints": {
                        "_min": 1.5,
                        "_max": 2
                    },
                    "_mark": "gold",
                    "displayMark": "Gold"
                }
            ]
        }
    ]
}
```

###Marking Feedback Variation
To define feedback for marking system:
```
"_userLevelGradingBoundaries": {
    "_isEnabled": true,
    "header": "Course Dashboard",
    "_buttons": {
        "end": "Close Course Progress"
    },
    "_assessments" : [
        {
            "_assessmentId": "total",
            
            //marking+/points systems goes here, see above

			"_feedback": [
			    {
			        "_forFinalMark": "fail",
			        "title": "Variable Marking Feedback: Distinction",
			        "body": "Based on your current performance we are predicting that you won't achieve the course pass mark."
			    },
			    {
			        "_forFinalMark": "pass",
			        "title": "Variable Marking Feedback: Distinction",
			        "body": "Based on your current performance we are predicting that you will achieve a pass mark."
			    },
			    {
			        "_forFinalMark": "merit",
			        "title": "",
			        "body": "Based on your current performance we are predicting that you will achieve a merit mark."
			    },
			    {
			        "_forFinalMark": "distinction",
			        "title": "",
			        "body": "Based on your current performance we are predicting that you will achieve a distinction mark."
			    },
			    {
			        "_forProjectedMark": "fail",
			        "_forHighestMark": "fail pass merit distinction",
			        "title": "",
			        "body": "Based on your current performance we are predicting that you won't achieve the course pass mark."
			    },
			    {
			        "_forProjectedMark": "pass",
			        "_forHighestMark": "pass merit distinction",
			        "title": "",
			        "body": "Based on your current performance we are predicting that you will achieve a pass mark."
			    },
			    {
			        "_forProjectedMark": "merit",
			        "_forHighestMark": "merit distinction",
			        "title": "",
			        "body": "Based on your current performance we are predicting that you will achieve a merit mark."
			    },
			    {
			        "_forProjectedMark": "distinction",
			        "_forHighestMark": "distinction distinction",
			        "title": "",
			        "body": "Based on your current performance we are predicting that you will achieve a distinction mark."
			    }
			]
		}
	]
}
```

###Quizbank vs Marking variation
Only one diffuse assessment should affect one quizBankID.
```
"_userLevelGradingBoundaries": {
    "_isEnabled": true,
    "header": "Course Dashboard",
    "_buttons": {
        "end": "Close Course Progress"
    },
    "_assessments" : [
        {
            "_assessmentId": "total",
            
            //marking+/points systems goes here, see above

            //marking feedback goes here, see above

			"_quizBank": {
                "_quizBankID": 2,
                "_feedback": [
                    {
                        "_forCurrentMark": "none",
                        "_itemsAsPercent": 100, 
                        "_items": 2, 
                        "title": "",
                        "body": "You can still acheive a high score but you'll need to answer {{_currentQuizBankFeedback._items}} questions on this subject matter in the final assessment"
                    },
                    {
                        "_forCurrentMark": "some",
                        "_itemsAsPercent": 50, 
                        "_items": 1, 
                        "title": "",
                        "body": "You'll be asked {{_currentQuizBankFeedback._items}} questions on this subject matter in the final assessment"
                    },
                    {
                        "_forCurrentMark": "most",
                        "_itemsAsPercent": 0,
                        "_items": 0,
                        "title": "",
                        "body": "You do not need to answer any questions from this subject matter in the final assessment"
                    }
                ]
            }
        }
    ]
}
```

###Results Panel
The results panel is configured per assessment and has various sections which can be displayed per assessment.  

These sections are as follows:  

````
_type						description  
title 						output a single title pane  
questionsAttempted			feedback with chart showing the number of questions attempted as a percent
averagePoints				feedback with chart showing the number of average points attained per question
rightFirstTime 				feedback with chart shoing the number of questions that were correct on first attempt
predictedScore				feedback with chart showing marking boundaries and predicted score (current ratio)
forecastForFinalAssessment 	feedback with chart showing the number of bank questions expected in the final assessment
pageLevelView 				feedback with chart showing the number of bank questions expected in the final assessment
````

```
"_userLevelGradingBoundaries": {
    "_isEnabled": true,
    "header": "Course Dashboard",
    "_buttons": {
        "end": "Close Course Progress"
    },
    "_assessments" : [
        {
            "_assessmentId": "total",
            
            //marking+/points systems goes here, see above

            //marking feedback goes here, see above

            //marking quizbank goes here, see above

			"_results" : {
                "_sections": [
                    {
                        "_type": "title",
                        "_className" : "summary-title",
                        "title": "Summary",
                        "_size": "full"
                    },
                    {
                        "_type": "questionsAttempted",
                        "title": "Questions Attempted",
                        "body": "So far you have attempted {{_completeDescendentComponents}} of a possible {{_descendentComponents}} questions within the course<br>(excluding the final assessment)",
                        "_chart": {
                            "_animateDelay": 100,
                            "_animateDuration": 1000,
                            "title": "{{_completedAsPercent}}",
                            "_isPercent": true,
                            "_type": "donut",
                            "_colors": [ "rgb(73, 123, 179)", "lightgray" ]
                        },
                        "_size": "full"
                    },
                    {
                        "_type": "averagePoints",
                        "title": "Average points per questions",
                        "body": "Your average points score is {{_averagePoints}} out of {{_maxPoints}}<br>(2 points for right first time, 1 point for correct on subsequent attempts)",
                        "_chart": {
                            "_animateDelay": 200,
                            "_animateDuration": 1000,
                            "title": "{{_averagePointsAsPercent}}",
                            "_isPercent": true,
                            "_type": "donut",
                            "_colors": [ "rgb(73, 123, 179)", "lightgray" ]
                        },
                        "_size": "full"
                    },
                    {
                        "_type": "rightFirstTime",
                        "title": "Right first time",
                        "body": "{{_countRightFirstTime}} of the {{_completeDescendentComponents}} you've answered correctly have been done so on the first attempt",
                        "_chart": {
                            "_animateDelay": 300,
                            "_animateDuration": 1000,
                            "title": "{{_countRightFirstTimeAsPercent}}",
                            "_isPercent": true,
                            "_type": "donut",
                            "_colors": [ "rgb(73, 123, 179)", "lightgray" ]
                        },
                        "_size": "full"
                    },
                    {
                        "_type": "predictedScore",
                        "title": "Predicted Score",
                        "body": "{{_currentFeedback.body}}",
                        "_chart": {
                            "_animateDelay": 400,
                            "_animateDuration": 1000,
                            "title": "",
                            "_type": "gradedbar",
                            "_colors": [ "rgb(73, 123, 179)", "lightgray" ]
                        },
                        "_size": "half"
                    },
                    {
                        "_type": "forecastForFinalAssessment",
                        "title": "Forecast length of final assessment",
                        "body": "Based on your current performance we estimate that your final assessment will consist of {{_countBankQuestions}} questions",
                        "_chart": {
                            "_animateDelay": 500,
                            "_animateDuration": 1000,
                            "title": "{{_countBankQuestions}}",
                            "_type": "donut",
                            "_colors": [ "rgb(73, 123, 179)", "lightgray" ]
                        },
                        "_size": "half"
                    },
                    {
                        "_type": "title",
                        "_className" : "pagelevelview-title",
                        "title": "Page Level View",
                        "_size": "full"
                    },
                    {
                        "_type": "pageLevelView",
                        "title": "Page 1: <span class=\"learning-objective\">Learning objective here</span>",
                        "body": "{{{_currentFeedback.body}}}<br><br>{{{_currentQuizBankFeedback.body}}}",
                        "_chart": {
                            "_animateDelay": 500,
                            "_animateDuration": 1000,
                            "title": "{{_currentQuizBankFeedback._items}}",
                            "_type": "blockchart",
                            "_colors": [ "rgb(73, 123, 179)", "lightgray" ]
                        },
                        "_size": "full"
                    }
                ],
                "_size": "full",
                "_order": 0 
            }
        }
    ]
}
```

