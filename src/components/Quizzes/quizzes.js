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
            currentlySelectedTagToAdd: "defaultOption",
            newQuizText: "",
            tags: {},
            allQuizNames : {},
            quizFilterResults : [],
            inEditMode : false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleGetQuizzesWithTag = this.handleGetQuizzesWithTag.bind(this);
        this.handleGetQuizForEditFormSubmit = this.handleGetQuizForEditFormSubmit.bind(this);
        this.handleExitEditMode = this.handleExitEditMode.bind(this);
        this.handleAddQuizSubmit = this.handleAddQuizSubmit.bind(this);
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

    handleAddQuizSubmit(event) {
        event.preventDefault();

        let that = this;
        if (this.state.currentlySelectedTagToAdd !== "defaultOption") {
            {/* Need to be sure this works well with the filters */
            }
            const quizRef = db.getQuizReference();

            let currDate = new Date();
            let dateAdd = currDate.toISOString().split('T')[0];
            let timeAdd = currDate.toTimeString().split(' ')[0];

            {/* This push operation is all client-side. I.e., we can run it without worrying about asynchronous issues */}
            let newAddition = quizRef.push();
            let keyVal = newAddition.key;
            {/* This next section must utilize Promises to ensure that it all operates synchronously */}
            let newQuizData = {
                name: this.state.newQuizText,
                available: false,
                visible: false,
                courses : false,
                datecreated: dateAdd,
                lastused: false,
                points: 100,
                tags: {[this.state.currentlySelectedTagToAdd] : true},
                timecreated: timeAdd
            };

            let updates = {};
            updates['quiz/' + keyVal] = newQuizData;
            updates['quiz-name/' + keyVal] = {name: that.state.newQuizText};
            updates['tag/' + this.state.currentlySelectedTagToAdd + '/quizzes/' + keyVal] = true;

            db.getFullDBReference().update(updates).then(function () {
                that.setState({
                    newQuizText : "",
                    currentlySelectedTagToAdd: "defaultOption",
                    currentlySelectedQuiz : "defaultOption",
                    currentlySelectedTag : "defaultOption"})
            });


        }
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
            <AddQuiz
                newQuizText={this.state.newQuizText}
                onAddQuizSubmit={this.handleAddQuizSubmit}
                handleChange={this.handleChange}
                inEditMode={this.state.inEditMode}
                currentlySelectedTagToAdd={this.state.currentlySelectedTagToAdd}
                tags={this.state.tags}/>


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
        this.handleCheckBoxStateChange = this.handleCheckBoxStateChange.bind(this);
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

    handleCheckBoxStateChange(event, keyName) {
        this.setState({
            quizData: Object.assign({}, this.state.quizData, {
                [keyName] : event.target.checked,
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
        let updates = {};
        updates['/quiz/' + this.props.selectedQuizForEditing] = this.state.quizData;
        updates['/quiz-name/' + this.props.selectedQuizForEditing ] = {name: this.state.quizData.name};
        db.getFullDBReference().update(updates);
    }

    deleteQuiz(event) {
        event.preventDefault();
        let deletes = {};
        let that = this;
        {/* Need to firstly ensure that you are removing tags and other linked information */}
        Object.keys(this.state.quizData.tags).forEach(key => {
            deletes['/tag/' + key + '/quizzes/' + this.props.selectedQuizForEditing] = null;
        });
        deletes['/quiz/' + this.props.selectedQuizForEditing] = null;
        deletes['/quiz-name/' + this.props.selectedQuizForEditing ] = null;

        db.getFullDBReference().update(deletes).then(function () {
            that.props.handleExitEditMode(event);
        });
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
                        {/* This needs to be determined automatically */}
                        <input type="text"
                               disabled="true"
                               name="totalPoints"
                               value={this.state.quizData.points}
                               placeholder="Total Points for this quiz"
                               onChange={(event) => this.handleTextStateChange(event, "points")}/>
                        <div>
                            <h5> Available in Practice Mode? </h5>
                            <input type="checkbox" checked={this.state.quizData.available} onChange={(event) => this.handleCheckBoxStateChange(event, "available")}/>
                        </div>
                        <div>
                            <h5> Visible to Students? </h5>
                            <input type="checkbox" checked={this.state.quizData.visible} onChange={(event) => this.handleCheckBoxStateChange(event, "visible")}/>
                        </div>
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

class AddQuiz extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
        this.props.handleChange(event)
    }
    render() {
        return (
            <div className="addNewQuiz">
                <h3> Add New Quiz </h3>
                <form onSubmit={this.props.onAddQuizSubmit}>
                    <input type="text"
                           disabled={this.props.inEditMode}
                           name="newQuizText"
                           placeholder="Please enter your quiz name"
                           value={this.props.newQuizText}
                           onChange={this.handleChange}
                    />
                    <select name="currentlySelectedTagToAdd" value={this.props.currentlySelectedTagToAdd} onChange={this.handleChange} disabled={this.props.inEditMode}>
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
                    <button disabled={this.props.inEditMode}>Add Quiz</button>
                </form>
            </div>
        )
    }
}




export default QuizzesPage;
