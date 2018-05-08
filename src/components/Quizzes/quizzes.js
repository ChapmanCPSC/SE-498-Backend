import React, { Component } from 'react';
import * as routes from '../../constants/routes';
import { firebase } from '../../firebase';
import { db } from '../../firebase';
import * as utils from '../../utilities/utils.js'
import {TagModification} from '../TagModification/TagModification.js'

class QuizzesPage extends Component {
    constructor (props) {
        super(props);
        this.state = {
            currentlySelectedQuiz: "defaultOption",
            currentlySelectedQuestion: "defaultOption",
            currentlySelectedTag: "defaultOption",
            currentlySelectedTagToAdd: "defaultOption",
            currentlySelectedTagForQuestionSearch: "defaultOption",
            newQuizText: "",
            tags: {},
            allQuizNames : {},
            allQuestionNames : {},
            quizFilterResults : [],
            questionFilterResults : [],
            inEditMode : false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleGetQuizzesWithTag = this.handleGetQuizzesWithTag.bind(this);
        this.handleGetQuizForEditFormSubmit = this.handleGetQuizForEditFormSubmit.bind(this);
        this.handleGetQuestionsWithTag = this.handleGetQuestionsWithTag.bind(this);
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

    // This handler function occurs whenever the user selects a question tag filter (in the select dropdown) when in the edit menu
    // It displays a list of questions with the specified question tag, and auto-selects the option in order for it to be added quickly
    handleGetQuestionsWithTag(event) {
        event.preventDefault();
        if (this.state.currentlySelectedTagForQuestionSearch !== "defaultOption") {
            // Iterate through selected tag, find the questions that have that tag, then set the state?

            let stateToSet = [];
            for (let quesID in this.state.tags[this.state.currentlySelectedTagForQuestionSearch].questions) {
                if (this.state.tags[this.state.currentlySelectedTagForQuestionSearch].questions[quesID] === true) {
                    stateToSet.push( {
                        id : quesID,
                        questionText : this.state.allQuestionNames[quesID].name
                    });
                }
            }
            if (stateToSet === undefined || stateToSet.length === 0) { // If no tags returned, we automatically just display All Question Names and select the highlighted option
                this.setState({
                    questionFilterResults: stateToSet,
                    currentlySelectedQuestion : Object.keys(this.state.allQuestionNames)[0]
                });
            }
            else { // we have found at least one quiz with the tag! So auto select the first
                this.setState({
                    questionFilterResults: stateToSet,
                    currentlySelectedQuestion: stateToSet[0].id // Set to first item (keeps it in line with *select* box display of the first option)
                });
            }
        }
    }

    handleExitEditMode(event) {
        event.preventDefault();
        this.setState({inEditMode: false,
            currentlySelectedQuiz : Object.keys(this.state.allQuizNames)[0], // Since we reset the page back to showing all quiz names (not filtered), select first option!
            currentlySelectedQuestion: Object.keys(this.state.allQuestionNames)[0], // Same as above, just now for the AddQuestionToQuiz Component
            currentlySelectedTag : "defaultOption",
            currentlySelectedTagForQuestionSearch: "defaultOption",
            quizFilterResults : false,
            questionFilterResults : false
        });
    }

    handleAddQuizSubmit(event) {
        event.preventDefault();

        let that = this;
        if (this.state.currentlySelectedTagToAdd !== "defaultOption") {
            // Need to be sure this works well with the filters

            const quizRef = db.getQuizReference();

            let currDate = new Date();
            let dateAdd = currDate.toISOString().split('T')[0];
            let timeAdd = currDate.toTimeString().split(' ')[0];

            // This push operation is all client-side. I.e., we can run it without worrying about asynchronous issues
            let newAddition = quizRef.push();
            let keyVal = newAddition.key;
            // This next section must utilize Promises to ensure that it all operates synchronously
            let newQuizData = {
                name: this.state.newQuizText,
                available: false,
                visible: false,
                courses : false,
                datecreated: dateAdd,
                lastused: false,
                tags: {[this.state.currentlySelectedTagToAdd] : true},
                questions: false,
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
                    currentlySelectedQuiz : Object.keys(that.state.allQuizNames)[0],
                    currentlySelectedTag : "defaultOption"})
            });


        }
    }

    handleGetQuizzesWithTag(event) {
        event.preventDefault();
        if (this.state.currentlySelectedTag !== "defaultOption") {
            // Iterate through selected tag, find the quizzes that have that tag, then set the state?

            let stateToSet = [];
            for (let quizID in this.state.tags[this.state.currentlySelectedTag].quizzes) {
                if (this.state.tags[this.state.currentlySelectedTag].quizzes[quizID] === true) {
                    stateToSet.push( {
                        id : quizID,
                        quizText : this.state.allQuizNames[quizID].name
                    });
                }
            }
            if (stateToSet === undefined || stateToSet.length === 0) { // If no tags returned, we automatically just display All Quiz Names and select the highlighted option
                this.setState({
                    quizFilterResults: stateToSet,
                    currentlySelectedQuiz : Object.keys(this.state.allQuizNames)[0]
                });
            }
            else { // we have found at least one quiz with the tag! So auto select the first
                this.setState({
                    quizFilterResults: stateToSet,
                    currentlySelectedQuiz: stateToSet[0].id // Set to first item (keeps it in line with *select* box display of the first option)
                });
            }

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
            if (quizVal) { // There is at least one returned quiz that exists in the DB, so we can autoselect the first option
                this.setState({
                    allQuizNames : quizVal,
                    currentlySelectedQuiz : Object.keys(quizVal)[0] // Set the first selected quiz (for editing) to the first item that is auto-selected in the *select*
                });
            }

        });
        db.getAllQuestionNames().on('value', (snapshot) => {
            let quesVal = snapshot.val();
            this.setState({
                allQuestionNames : quesVal,
                currentlySelectedQuestion : Object.keys(quesVal)[0] // Set the first selected question (for adding to a quiz) to the first item that is auto-selected in the *select*
            });
        });
    }

    componentWillUnmount() {
        db.getQuizReference().off();
        db.getTagReference().off();
    }

    render () {
        return (
            <div>
                <main role="main">
                    <div >
                        <div className="jumbotron">
                            <div className="container">
                                <h1 className="display-3"> Quiz Manager</h1>
                                <p> Welcome to the Quiz Management page! Here you can create, edit, and delete quizzes for use within the QuizEdu iOS application.
                                </p>
                            </div>
                        </div>
                        <div className="row marginstuff">
                            <div className="col-6 col-lg-4">
                                <AddQuiz
                                    newQuizText={this.state.newQuizText}
                                    onAddQuizSubmit={this.handleAddQuizSubmit}
                                    handleChange={this.handleChange}
                                    inEditMode={this.state.inEditMode}
                                    currentlySelectedTagToAdd={this.state.currentlySelectedTagToAdd}
                                    tags={this.state.tags}/>
                            </div>
                            <div className="col-12 col-sm-6 col-lg-8">
                                    <FilterQuizzes
                                        tags={this.state.tags}
                                        handleChange={this.handleChange}
                                        currentlySelectedTag={this.state.currentlySelectedTag}
                                        onTagSearchSubmit={this.handleGetQuizzesWithTag}
                                        onSelectEditQuizSubmit={this.handleGetQuizForEditFormSubmit}
                                        currentlySelectedQuiz={this.state.currentlySelectedQuiz}
                                        allQuizNames={this.state.allQuizNames}
                                        quizFilterResults={this.state.quizFilterResults}
                                        inEditMode={this.state.inEditMode}/>

                            </div>
                            <QuizEdit
                                selectedQuizForEditing={this.state.currentlySelectedQuiz}
                                inEditMode={this.state.inEditMode}
                                handleChange={this.handleChange}
                                handleExitEditMode={this.handleExitEditMode}
                                handleGetQuestionsWithTag={this.handleGetQuestionsWithTag}
                                currentlySelectedQuestion={this.state.currentlySelectedQuestion}
                                currentlySelectedTagToAdd={this.state.currentlySelectedTagToAdd}
                                currentlySelectedTagForQuestionSearch={this.state.currentlySelectedTagForQuestionSearch}
                                questionFilterResults={this.state.questionFilterResults}
                                allQuestionNames={this.state.allQuestionNames}
                                tags={this.state.tags}/>
                        </div>
                    </div>
                </main>
                <hr />
                <footer className="container">
                    <p>Developed by Chapman University</p>
                </footer>
            </div>
        )
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
        if(!this.props.inEditMode) {
            return (
                    <div className="card mb-4 box-shadow">
                        <div className="card-header">
                            <h4 className="my-0 font-weight-normal">Edit Existing Quiz</h4>
                        </div>
                        <div className="card-body">
                            <p> If you would like to edit or remove a pre-existing quiz, use the tool below! Begin by selecting the tag you believe the
                            quiz may have. Then, hit the "Filter" button to display quizzes with that tag! Select your quiz and then hit "Edit" to begin
                            alterations.</p>
                            <div className="container">
                                <form className="mb-3" onSubmit={this.props.onTagSearchSubmit}>
                                    <div className="form-group row">
                                        <select name="currentlySelectedTag" className="form-control"
                                                value={this.props.currentlySelectedTag}
                                                onChange={this.handleChange} disabled={this.props.inEditMode}>
                                            <option name="defaultTagOption"
                                                    value="defaultOption"
                                                    key="defaultOption">---Select a Tag---
                                            </option>
                                            {Object.keys(this.props.tags).map(key => {
                                                return (<option name="tagOption"
                                                                key={key}
                                                                value={key}>{this.props.tags[key].name}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                    <button className="btn btn-primary btn-block"
                                            disabled={this.props.inEditMode}> Filter
                                    </button>
                                </form>

                                {/* TODO: Must maintain concurrency: I.e. if a quiz is deleted by another admin, need to make sure
                                    the currently selected quiz changed back to default, or alerts the user
                                */}

                                <form onSubmit={this.props.onSelectEditQuizSubmit}>
                                    <div className="form-group row">
                                        <select className="form-control" size="10"
                                                name="currentlySelectedQuiz" value={this.props.currentlySelectedQuiz}
                                                onChange={this.handleChange} disabled={this.props.inEditMode}>
                                            {this.props.quizFilterResults.length > 0 ? this.props.quizFilterResults.map((item) => {
                                                return (
                                                    <option name="quizToSelectOption"
                                                            key={item.id}
                                                            value={item.id}>{item.quizText}</option>
                                                )
                                            }) : Object.keys(this.props.allQuizNames).map(id => {
                                                return (<option name="quizToSelectOption"
                                                key={id}
                                                value={id}>{this.props.allQuizNames[id].name}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                    <button className="btn btn-primary btn-block"
                                            disabled={this.props.inEditMode}> Edit
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
            )
        }
        else {
            return null;
        }
    }
}

const InitialQuizEditState = {
    quizData : undefined,
    quizDataInitialLoad : undefined
};

class QuizEdit extends Component {
    constructor(props) {
        super(props);
        // Actual state is listed above in the constant var called InitialQuizEditState
        this.state = InitialQuizEditState;

        this.handleChange = this.handleChange.bind(this);
        this.addQuestionToQuiz = this.addQuestionToQuiz.bind(this);
        this.deleteQuestionFromQuiz = this.deleteQuestionFromQuiz.bind(this);
        this.handleTextStateChange = this.handleTextStateChange.bind(this);
        this.handleCheckBoxStateChange = this.handleCheckBoxStateChange.bind(this);
        this.handleExitEditMode = this.handleExitEditMode.bind(this);
        this.handleGetQuestionsWithTag = this.handleGetQuestionsWithTag.bind(this);
        this.submitQuiz = this.submitQuiz.bind(this);
        this.deleteQuiz = this.deleteQuiz.bind(this);
        this.addTagToQuiz = this.addTagToQuiz.bind(this);
        this.removeTagFromQuiz = this.removeTagFromQuiz.bind(this);
    }

    reset() {
        this.setState(InitialQuizEditState);
    }

    handleChange(event) {
        this.props.handleChange(event)
    }

    handleGetQuestionsWithTag(event) {
        this.props.handleGetQuestionsWithTag(event);
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

    addQuestionToQuiz(event) {
        event.preventDefault();

        // Firstly, need to ensure that the question does not already belong to the quiz!
        if (!(this.props.currentlySelectedQuestion in this.state.quizData)) {
            // Now set the state of your Edit Quiz component to be updated with the new question added
            this.setState({
                quizData: Object.assign({}, this.state.quizData, {
                    questions : Object.assign({}, this.state.quizData.questions, {
                        [this.props.currentlySelectedQuestion] : true, //Adding question to quiz
                    }),
                }),
            });

        }
    }

    deleteQuestionFromQuiz(event, id) {
        if(Object.keys(this.state.quizData.questions).length !== 1) {
            let removedKeyStateCopy = Object.assign({}, this.state);
            delete removedKeyStateCopy.quizData.questions[id];
            this.setState(removedKeyStateCopy);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.inEditMode && nextProps.inEditMode) {
            // 1. If you are not in edit mode, but have requested to go into edit mode
            // Grab the data listed in Firebase so the user can edit!
            // Data Should be copied into a local structure
            db.getQuizWithID(this.props.selectedQuizForEditing).once('value', (snapshot) => {
                this.setState({quizData : snapshot.val(), quizDataInitialLoad : snapshot.val()});
            });
        }
        else if (this.props.inEditMode && !nextProps.inEditMode) {
            // 2. If you are in edit mode, but have requested to switch out back to filtering and selecting quizzes
            // Reset your state back to nothing! So clear everything you've done so far*/}
            this.reset();
        }
    }

    submitQuiz(event) {
        event.preventDefault();
        let updates = {};
        let that = this;


        updates['/quiz/' + this.props.selectedQuizForEditing] = this.state.quizData;
        updates['/quiz-name/' + this.props.selectedQuizForEditing ] = {name: this.state.quizData.name};
        // Be sure to update question relationships too! Let them know that they are part of the quiz
        Object.keys(this.state.quizData.questions).forEach(key => {
            updates['/question/' + key + '/quizzes/' + this.props.selectedQuizForEditing] = true;
        });

        // We will update the tags with the new and correct tag information (on the quiz)
        Object.keys(this.state.quizData.tags).forEach(key => {
            updates['/tag/' + key + '/quizzes/' + this.props.selectedQuizForEditing] = true;
        });

        // Here we do a set difference with the initial backup (for duplicated tag data), to see if anything was deleted ( and thus set to null to delete it)
        Object.keys(this.state.quizDataInitialLoad.tags).forEach(key => {
            if (!(key in this.state.quizData.tags)) {
                updates['/tag/' + key + '/quizzes/' + this.props.selectedQuizForEditing] = null;
            }
        });

        // Here we do a set difference with the initial backup (on our duplicated question data), to see if anything was deleted ( and thus set to null to delete it)
        Object.keys(this.state.quizDataInitialLoad.questions).forEach(key => {
            if (!(key in this.state.quizData.questions)) {
                updates['/question/' + key + '/quizzes/' + this.props.selectedQuizForEditing] = null;
            }
        });
        db.getFullDBReference().update(updates).then(function() {
            that.props.handleExitEditMode(event);
        });
    }

    deleteQuiz(event) {
        event.preventDefault();
        let deletes = {};
        let that = this;
        // Need to firstly ensure that you are removing tags and other linked information
        Object.keys(this.state.quizDataInitialLoad.tags).forEach(key => {
            deletes['/tag/' + key + '/quizzes/' + this.props.selectedQuizForEditing] = null;
        });
        // Be sure to delete question relationships too! Let them know that they are no longer a part of the quiz
        Object.keys(this.state.quizDataInitialLoad.questions).forEach(key => {
            deletes['/question/' + key + '/quizzes/' + this.props.selectedQuizForEditing] = null;
        });
        deletes['/quiz/' + this.props.selectedQuizForEditing] = null;
        deletes['/quiz-name/' + this.props.selectedQuizForEditing ] = null;

        db.getFullDBReference().update(deletes).then(function () {
            that.props.handleExitEditMode(event);
        });
    }

    addTagToQuiz (event) {
        event.preventDefault();

        // This is REALLY inefficient and we need another way of doing this without nested assigns
        this.setState({
            quizData: Object.assign({}, this.state.quizData, {
                tags : Object.assign({}, this.state.quizData.tags, {
                    [this.props.currentlySelectedTagToAdd] : true,
                }),
            }),
        });
    }
    removeTagFromQuiz(event, tagID) {
        event.preventDefault();

        if(Object.keys(this.state.quizData.tags).length !== 1) {
            let removedKeyStateCopy = Object.assign({}, this.state);
            delete removedKeyStateCopy.quizData.tags[tagID];
            this.setState(removedKeyStateCopy);
        }
    }



    render() {
        if(this.props.inEditMode && this.state.quizData !== undefined) {
            return(
                <div>
                    <div className="row mb-4">
                        <div className="col-6 col-sm-4">
                            <button type="button" className = "btn btn-light btn-lg" onClick={this.handleExitEditMode}> Return to Quizzes </button>
                        </div>
                        <div className="col-6 col-sm-4">
                            <form onSubmit={this.submitQuiz}>
                                <button className = "btn btn-success btn-lg"> Submit Changes </button>
                            </form>
                        </div>
                        <div className="col-6 col-sm-4">
                            <form onSubmit={this.deleteQuiz}>
                                <button className="btn btn-danger btn-lg" > Delete Quiz </button>
                            </form>
                        </div>
                    </div>



                    <form className="mb-3" onSubmit={this.submitQuiz}>
                        <div className="row">
                            <div className="col-6 col-lg-4">

                                <div className="card mb-4 box-shadow">
                                    <div className="card-header">
                                        <h4 className="my-0 font-weight-normal">Quiz Info</h4>
                                    </div>
                                    <div className="card-body">
                                        <p> Here, you can edit the Quiz Name, set whether or not the quiz is available to be used in practice mode,
                                        or set whether or not the quiz is visible to students</p>
                                        <div className="container">
                                            <div className="form-group row">
                                                <input type="text" className="form-control"
                                                       name="existingQuizText"
                                                       value={this.state.quizData.name}
                                                       placeholder="Enter Quiz Text Here" maxLength="200"
                                                       onChange={(event) => this.handleTextStateChange(event, "name")}/>
                                            </div>
                                            <div className="form-check row">
                                                <input className="form-check-input" id="practiceModeCheck" type="checkbox" checked={this.state.quizData.available} onChange={(event) => this.handleCheckBoxStateChange(event, "available")}/>
                                                <label className="form-check-label" htmlFor="practiceModeCheck">Available in Practice Mode?</label>
                                            </div>
                                            <div className="form-check row">
                                                <input className="form-check-input" id="visibleCheck" type="checkbox" checked={this.state.quizData.visible} onChange={(event) => this.handleCheckBoxStateChange(event, "visible")}/>
                                                <label className="form-check-label" htmlFor="visibleCheck"> Visible to Students? </label>
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-lg-8">
                                <TagModification
                                    tags={this.props.tags}
                                    inEditMode={this.props.inEditMode}
                                    handleChange={this.props.handleChange}
                                    handleAddTagToData={this.addTagToQuiz}
                                    handleRemoveTagFromData={this.removeTagFromQuiz}
                                    specificData={this.state.quizData}
                                    currentlySelectedTagToAdd={this.props.currentlySelectedTagToAdd}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-6 col-lg-4">
                                <div className="card mb-8 box-shadow">
                                    <div className="card-header">
                                        <h4 className="my-0 font-weight-normal">Questions in Quiz</h4>
                                    </div>
                                    <div className="card-body">
                                        <p> Here is a list of all of the questions currently a part of your quiz!</p>
                                        <div className="container">
                                            {Object.keys(this.state.quizData.questions).map((quizID) => {
                                                return (
                                                    <div className="form-group" key={quizID}>
                                                        <textarea className = "form-control" name="questionsInSelection" disabled="true" maxLength="60"
                                                               value={this.props.allQuestionNames[quizID].name} />
                                                        <button type="button" className = "btn btn-dark btn-block" onClick={(event) => this.deleteQuestionFromQuiz(event, quizID)}> Delete </button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-lg-8">
                                <AddQuestionToQuiz
                                    addQuestionToQuiz={this.addQuestionToQuiz}
                                    allQuestionNames={this.props.allQuestionNames}
                                    handleChange={this.handleChange}
                                    handleGetQuestionsWithTag={this.handleGetQuestionsWithTag}
                                    currentlySelectedQuestion={this.props.currentlySelectedQuestion}
                                    currentlySelectedTagForQuestionSearch={this.props.currentlySelectedTagForQuestionSearch}
                                    questionFilterResults={this.props.questionFilterResults}
                                    tags={this.props.tags}
                                />
                            </div>
                        </div>
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
        this.state = { isModalOpen: false }
    }
    handleChange(event) {
        this.props.handleChange(event)
    }
    render() {
        if(!this.props.inEditMode) {
            return (
                    <div className="card mb-4 box-shadow">
                        <div className="card-header">
                            <h4 className="my-0 font-weight-normal">Add New Quiz!</h4>
                        </div>
                        <div className="card-body">
                            <p> Want to add a new quiz to the QuizEdu system? Just click below! Be sure to select an initial tag for the quiz question</p>
                            <div className="container">
                                <form onSubmit={this.props.onAddQuizSubmit}>
                                    <div className="form-group row">
                                        <input type="text"
                                               className="form-control"
                                               id="quizNameLabel"
                                               disabled={this.props.inEditMode}
                                               name="newQuizText"
                                               placeholder="Please enter your quiz name"
                                               value={this.props.newQuizText}
                                               onChange={this.handleChange}
                                        />
                                    </div>
                                    <div className="form-group col-md-10">
                                        <select name="currentlySelectedTagToAdd" className="form-control"
                                                value={this.props.currentlySelectedTagToAdd}
                                                onChange={this.handleChange} disabled={this.props.inEditMode}>
                                            <option name="defaultTagOption"
                                                    value="defaultOption"
                                                    key="defaultOption">---Select a Tag!---
                                            </option>
                                            {Object.keys(this.props.tags).map(key => {
                                                return (<option name="tagOption"
                                                                key={key}
                                                                value={key}>{this.props.tags[key].name}</option>
                                                )
                                            })}
                                        </select>
                                    </div>
                                    <button className="btn btn-success btn-block " disabled={this.props.inEditMode}
                                    >Add
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
            )
        }
        else {
            return null;
        }
    }
    openModal() {
      this.setState({ isModalOpen: true })
    }

    closeModal() {
      this.setState({ isModalOpen: false })
    }
}
class Modal extends React.Component {
    render() {
      if (this.props.isOpen === false)
        return null

      let modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: '9999',
        backgroundColor: '#fff',
        borderRadius: 20,
        margin: '0 auto',
      }


      let backdropStyle = {
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: '0px',
        left: '0px',
        zIndex: '9998',
        background: 'rgba(0, 0, 0, 0.3)'
      }

      if (this.props.backdropStyle) {
        for (let key in this.props.backdropStyle) {
          backdropStyle[key] = this.props.backdropStyle[key]
        }
      }

      return (
        <div className={this.props.containerClassName}>
          <div className={this.props.className} style={modalStyle}>
            {this.props.children}
          </div>
          {!this.props.noBackdrop &&
              <div className={this.props.backdropClassName} style={backdropStyle}
                   onClick={e => this.close(e)}/>}
        </div>
      )
    }


    close(e) {
      e.preventDefault();

      if (this.props.onClose) {
        this.props.onClose()
      }
    }
  }

class AddQuestionToQuiz extends Component {
    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this);
        this.handleGetQuestionsWithTag = this.handleGetQuestionsWithTag.bind(this);
    }

    handleChange(event) {
        this.props.handleChange(event)
    }

    handleGetQuestionsWithTag(event) {
        this.props.handleGetQuestionsWithTag(event);
    }
    render () {
        return(
            <div className="card mb-4 box-shadow">
                <div className="card-header">
                    <h4 className="my-0 font-weight-normal">Add Question to Quiz</h4>
                </div>
                <div className="card-body">
                    <p> Want to add a Question to this Quiz? Use the Tag Filtering box to search for the question you would like to add, then hit add!</p>
                    <div className="container">

                        <div className="row">
                            <div className="form-group col-md-4 mb-3">
                                <select className="form-control"
                                    name="currentlySelectedTagForQuestionSearch" value={this.props.currentlySelectedTagForQuestionSearch}
                                    onChange={this.handleChange} disabled={this.props.inEditMode}>
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
                            </div>
                            <div className="col-md-4 mb-3">
                                <button className="btn btn-info"
                                        disabled={this.props.inEditMode}
                                        onClick={this.props.handleGetQuestionsWithTag} >Filter
                                </button>
                            </div>
                        </div>

                        <div className="form-group">
                            {/* TODO: Must maintain concurrency: I.e. if a question is deleted by another admin, need to make sure
                                                    the currently selected question changed back to default, or alerts the user
                                                */}
                            <select className = "form-control" size = "5" name="currentlySelectedQuestion" value={this.props.currentlySelectedQuestion}
                                    onChange={this.handleChange} disabled={this.props.inEditMode}>

                                {this.props.questionFilterResults.length > 0 ? this.props.questionFilterResults.map((item) => {
                                    return (
                                        <option name="questionToSelectOption"
                                                key={item.id}
                                                value={item.id}>{item.questionText}</option>
                                    )
                                }) : Object.keys(this.props.allQuestionNames).map(id => {
                                    return (<option name="questionToSelectOption"
                                    key={id}
                                    value={id}>{this.props.allQuestionNames[id].name}</option>
                                    )
                                })}

                            </select>

                        </div>

                        <button className = "btn btn-info btn-block" disabled={this.props.inEditMode}
                                onClick={this.props.addQuestionToQuiz}> Add Question To Quiz!</button>
                    </div>
                </div>
            </div>
        );

    }
}

export default QuizzesPage;
