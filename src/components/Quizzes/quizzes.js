import React, { Component } from 'react';
import * as routes from '../../constants/routes';
import { firebase } from '../../firebase';
import { db } from '../../firebase';
import * as utils from '../../utilities/utils.js'

class QuizzesPage extends Component {
    constructor (props) {
        super(props);
        this.state = {
            currentlySelectedQuizz: "defaultOption",
            currentlySelectedTag: "defaultOption",
            tags: {},
            allQuizNames : {},
            quizFilterResults : [],
            inEditMode : false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleGetQuizzesWithTag = this.handleGetQuizzesWithTag.bind(this);
        this.handleGetQuizForEditFormSubmit = this.handleGetQuizForEditFormSubmit.bind(this);
        this.handleExitEditMode = this.handleExitEditMode.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value})
    }

    handleGetQuizForEditFormSubmit(event) {
        event.preventDefault();
        if(this.state.currentlySelectedQuiz !== "defaultOption") {
            this.setState({inEditMode: true});
        }

    }

    handleExitEditMode(event) {
        event.preventDefault();
        this.setState({inEditMode: false, currentlySelectedQuiz : "defaultOption", currentlySelectedTag : "defaultOption"});
    }

    handleGetQuizzesWithTag(event) {
        event.preventDefault();
        if (this.state.currentlySelectedTag !== "defaultOption") {
            {/* Iterate through selected tag, find the quizzes that have that tag, then set the state? */}
            this.setState({ currentlySelectedQuiz : "defaultOption"});
            let stateToSet = [];
            for (let quizID in this.state.tags[this.state.currentlySelectedTag].quizzes) {
                if (this.state.tags[this.state.currentlySelectedTag].quizzes[quizID] === true) {
                    stateToSet.push( {
                        id : quizID,
                        quizText : this.state.allQuizNames[quizID].name
                    });
                }
            }
            this.setState({
                quizFilterResults: stateToSet
            });
        }
    }

    componentDidMount () {
        db.getTagReference().on('value', (snapshot) => {
            let tagVal = snapshot.val();
            this.setState({
                tags : tagVal
            });
        });
        db.getAllQuizNames().on('value', (snapshot) => {
            let quizVal = snapshot.val();
            this.setState({
                allQuizNames : quizVal
            })
        });
    }

    render () {
        return <div className="wholeQuizPage">
            <h1> Quizzes Page </h1>
            <FilterQuizzes
                tags={this.state.tags}
                handleChange={this.handleChange}
                currentlySelectedTag={this.state.currentlySelectedTag}
                onTagSearchSubmit={this.handleGetQuizzesWithTag}
                onSelectEditQuizSubmit={this.handleGetQuizForEditFormSubmit}
                currentlySelectedQuiz={this.state.currentlySelectedQuiz}
                quizFilterResults={this.state.quizFilterResults}
                inEditMode={this.state.inEditMode}/>


            <QuizEdit
                selectedQuizForEditing={this.state.currentlySelectedQuiz}
                inEditMode={this.state.inEditMode}
                handleChange={this.handleChange}
                handleExitEditMode={this.handleExitEditMode}/>
        </div>
    }
}

class FilterQuizzes extends Component {
    constructor (props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.props.handleChange(event)
    }
    render() {
        return(
            <div>
                <div className="quizTagSearch">
                    <form onSubmit={this.props.onTagSearchSubmit}>
                        <select name="currentlySelectedTag" value={this.props.currentlySelectedTag} onChange={this.handleChange} disabled={this.props.inEditMode}>
                            <option name="defaultTagOption"
                                    value="defaultOption"
                                    key="defaultOption">---Select a Tag!---</option>
                            {Object.keys(this.props.tags).map(key => {
                                return ( <option name="tagOption"
                                                 key={key}
                                                 value={key}>{this.props.tags[key].name}</option>
                                )
                            })}
                        </select>
                        <button disabled={this.props.inEditMode}>Search For Quizzes With Tag </button>
                    </form>
                </div>

                {this.props.quizFilterResults.length > 0 &&
                <div className="quizSelection">
                    {/* TODO: Must maintain concurrency: I.e. if a quiz is deleted by another admin, need to make sure
                            the currently selected quiz changed back to default, or alerts the user
                        */}
                    <form onSubmit={this.props.onSelectEditQuizSubmit}>
                        <select name="currentlySelectedQuiz" value={this.props.currentlySelectedQuiz}
                                onChange={this.handleChange} disabled={this.props.inEditMode}>
                            <option name="defaultQuizOption"
                                    value="defaultOption"
                                    key="defaultOption">---Please Select a Quiz---
                            </option>
                            {this.props.quizFilterResults.map((item) => {
                                return (
                                    <option name="quizToSelectOption"
                                            key={item.id}
                                            value={item.id}>{item.quizText}</option>
                                )
                            })}
                        </select>
                        <button disabled={this.props.inEditMode}> Edit!</button>
                    </form>
                </div>
                }
            </div>
        )
    }
}

const InitialQuizEditState = {
    quizData : undefined
};

class QuizEdit extends Component {
    constructor(props) {
        super(props);
        {/* Actual state is listed above in the constant var called InitialQuizEditState*/}
        this.state = InitialQuizEditState;

        this.handleChange = this.handleChange.bind(this);
        this.handleTextStateChange = this.handleTextStateChange.bind(this);
        this.handleExitEditMode = this.handleExitEditMode.bind(this);
        this.submitQuiz = this.submitQuiz.bind(this);
        this.deleteQuiz = this.deleteQuiz.bind(this);
    }

    reset() {
        this.setState(InitialQuizEditState);
    }

    handleChange(event) {
        this.props.handleChange(event)
    }

    handleTextStateChange(event, keyName) {
        this.setState({
            quizData: Object.assign({}, this.state.quizData, {
                [keyName] : event.target.value,
            }),
        });
    }

    handleExitEditMode(event) {
        this.props.handleExitEditMode(event);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.inEditMode && nextProps.inEditMode) {
            {/* 1. If you are not in edit mode, but have requested to go into edit mode */}
            {/* Grab the data listed in Firebase so the user can edit! */}
            {/* Data Should be copied into a local structure */}
            db.getQuizWithID(this.props.selectedQuizForEditing).once('value', (snapshot) => {
                this.setState({quizData : snapshot.val()});
            });
        }
        else if (this.props.inEditMode && !nextProps.inEditMode) {
            {/* 2. If you are in edit mode, but have requested to switch out back to filtering and selecting quizzes */}
            {/* Reset your state back to nothing! So clear everything you've done so far*/}
            this.reset();
        }
    }

    submitQuiz(event) {
        event.preventDefault();

    }

    deleteQuiz(event) {
        event.preventDefault();
    }

    render() {
        if(this.props.inEditMode && this.state.quizData !== undefined) {
            return(
                <div className="quizEditDiv">
                    <form onSubmit={this.submitQuiz}>
                        <h1> Edit </h1>
                        <button type="button" onClick={this.handleExitEditMode}> Go Back To Quiz Select </button>
                        <h4> Quiz Name: </h4>
                        <input type="text"
                               name="existingQuizText"
                               value={this.state.quizData.name}
                               placeholder="Enter Quiz Text Here"
                               onChange={(event) => this.handleTextStateChange(event, "name")}/>
                        <h4> Total Points </h4>
                        <input type="text"
                               disabled="true"
                               name="totalPoints"
                               value={this.state.quizData.points}
                               placeholder="Total Points for this quiz"
                               onChange={(event) => this.handleTextStateChange(event, "points")}/>
                        {/*
                        <input type="text"
                               name="tagForQuizEdit"
                               placeholder="Enter Tag Here"
                               value={this.state.quizData.tags.} onChange={this.handleChange} /> */}

                        <button>Submit Changes!</button>
                    </form>
                    <form onSubmit={this.deleteQuiz}>
                        <h4> Want to delete the quiz? </h4>
                        <button> Delete (PERMANENT)</button>
                    </form>

                </div>
            )
        }
        else { return null; }
    }
}




export default QuizzesPage;
