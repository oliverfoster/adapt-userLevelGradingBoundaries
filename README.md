adapt-userLevelGradingBoundaries
================

Extension  

Using learnerAssistant, diffuseAssessments and contrib-assessment along with rollay and bottomnavigation to provide a course progress screen.  

####Requirements
1. Show feedback for diffuseAssessments (feedback based upon predicted/highest results or current result) as results panel  
2. Change contrib-assessment bank quantities based upon diffuseAssessment outcomes  
  
###Dependencies

Required:   
[adapt-assessment-learnerAssistant](https://github.com/cgkineo/adapt-assessment-learnerAssistant)  
[adapt-diffuseAssessment](https://github.com/cgkineo/adapt-diffuseAssessment)  
[adapt-contrib-assessment](https://github.com/cgkineo/adapt-contrib-assessment)  

Optional (for results screen):  
[adapt-pageMenuRouter](https://github.com/cgkineo/adapt-pageMenuRouter)  
[adapt-rollay](https://github.com/cgkineo/adapt-rollay)  
[adapt-bottomnavigation](https://github.com/cgkineo/adapt-rollay)  

###Use
Navigate to #/ulgb/results or trigger event Adapt.trigger("userLevelGradingBoundaries:resultsOpen") to open results panel.
Use optional dependencies to show results panel.  
  
Or use just to change contrib-assessment banks based upon diffuseAssessment outcome. No results panel is necessary.  

###Public Interface
```
Adapt.userLevelGradingBoundaries.model 
Adapt.userLevelGradingBoundaries.navigateToOther(section, replace) //navigates to #/ulgb/section
Adapt.userLevelGradingBoundaries.navigateToPrevious(replace) //back button equivalent
Adapt.userLevelGradingBoundaries.processMarking() // setup model with current marking outcomes
Adapt.userLevelGradingBoundaries.processFeedback() // setup model with current feedback outcomes
Adapt.userLevelGradingBoundaries.processQuizBanks() // setup contrib-assessment with current quizbank outcomes

```

##Events

```
Triggers:  
userLevelGradingBoundaries:initialized

Listens To:
userLevelGradingBoundaries:resultsOpen
userLevelGradingBoundaries:resultsClose

```


###Configuration
```
//to go in course.json
"_userLevelGradingBoundaries": {
    "header": "Ongoing Course Progress",
    "title": "Title",
    "body": "Body text",
    "_buttons": {
        "end": "Close Course Progress"
    },
    "_diffuseAssessment": {
        "_assessments" : [
            {
                "_assessmentId": "total", //diffuse assessment id
                "_scoreToPassAsPercent": 100, //used to calculated 'tick' graph pass/fail
                "_results" : { //show assessment in results panel
                    "title": "Total",
                    "body": "Combined results of all questions",
                    "_chart": { //show chart in results panel
                        "_type": "donut", //donut/pie/bar/percentage/tick
                        "_size": "large" //small/medium/large
                    },
                    "_size": "full", //half/full width results component
                    "_order": 0 //order resutls components by
                },
                "_marking": [
                    {
                        "_forScoreAsPercent": { //use _forScoreAsPercent or _forScore
                            "_min": 0,
                            "_max": 25
                        },
                        "_mark": "fail",
                        "displayMark": "fail"
                    },
                    .
                    .
                    .
                    {
                        "_forScoreAsPercent": {
                            "_min": 76,
                            "_max": 100
                        },
                        "_mark": "distinction",
                        "displayMark": "gold"
                    }
                ],
                "_feedback": [
                    {
                        "_forProjectedMark": "fail", //corresponding _marking._mark
                        "_forHighestMark": "fail", //corresponding _marking._mark
                        "title": "Predictive Marking Feedback: Fail, Fail",
                        "body": "Predictive Marking Feedback: You will need to do some more reading before your final assessment! You are currently on target to get a {{_highestMark.displayMark}}"
                    },
                    .
                    .
                    .
                    {
                        "_forFinalMark": "distinction", //corresponding _marking._mark
                        "title": "Variable Marking Feedback: Distinction",
                        "body": "Final Marking Feedback: You should be on track to achieve a {{_projectedMark.displayMark}} in your final assessment."
                    }
                ],
                "_quizBank": {
                    "_quizBankID": 1, //contrib-assessment bank id
                    "_feedback": [
                        {
                            "_forFinalMark": "fail", //corresponding _marking._mark
                            "_itemsAsPercent": 100, //how many items to pick for contrib-assessment bank
                            "_items": 2, //how many items to pick for contrib-assessment bank
                            "title": "Quiz Bank Feedback: Adjustment",
                            "body": "Quiz Bank Feedback: Due to your poor performance you must attempt {{_currentQuizBankFeedback._items}} questions from this learning outcome in the final assessment"
                        },
                        .
                        .
                        .
                        {
                            "_forFinalMark": "distinction",
                            "_itemsAsPercent": 0,
                            "_items": 0,
                            "title": "Quiz Bank Feedback: Adjustment",
                            "body": "Quiz Bank Feedback: Due to your excellent performance you will not need to attempt any questions from this learning outcome in the final assessment"
                        }
                    ]
                }
            },
        }
    }
}
```