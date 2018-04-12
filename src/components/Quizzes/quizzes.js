import React, { Component } from 'react';
import * as routes from '../../constants/routes';
import { firebase } from '../../firebase';
import { db } from '../../firebase';
import * as utils from '../../utilities/utils.js'

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

    handleGetQuestionsWithTag(event) {
        event.preventDefault();
        if (this.state.currentlySelectedTagForQuestionSearch !== "defaultOption") {
            {/* Iterate through selected tag, find the questions that have that tag, then set the state? */}
            this.setState({ currentlySelectedQuestion : "defaultOption"});
            let stateToSet = [];
            for (let quesID in this.state.tags[this.state.currentlySelectedTagForQuestionSearch].questions) {
                if (this.state.tags[this.state.currentlySelectedTagForQuestionSearch].questions[quesID] === true) {
                    stateToSet.push( {
                        id : quesID,
                        questionText : this.state.allQuestionNames[quesID].name
                    });
                }
            }
            this.setState({
                questionFilterResults: stateToSet
            });
        }
    }

    handleExitEditMode(event) {
        event.preventDefault();
        this.setState({inEditMode: false,
            currentlySelectedQuiz : "defaultOption",
            currentlySelectedQuestion: "defaultOption",
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
        db.getAllQuestionNames().on('value', (snapshot) => {
            let quesVal = snapshot.val();
            this.setState({
                allQuestionNames : quesVal
            })
        });
    }

    render () {
        return <div > 
            <div >
                <div class = "center">
                    <h1> MANAGE QUIZ</h1>
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
                </div>
                <div>
                    <QuizEdit
                        selectedQuizForEditing={this.state.currentlySelectedQuiz}
                        inEditMode={this.state.inEditMode}
                        handleChange={this.handleChange}
                        handleExitEditMode={this.handleExitEditMode}
                        handleGetQuestionsWithTag={this.handleGetQuestionsWithTag}
                        currentlySelectedQuestion={this.state.currentlySelectedQuestion}
                        currentlySelectedTagForQuestionSearch={this.state.currentlySelectedTagForQuestionSearch}
                        questionFilterResults={this.state.questionFilterResults}
                        allQuestionNames={this.state.allQuestionNames}
                        tags={this.state.tags}/>
                </div>
            </div>
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
            <div className = "marginstuff">
                <div className="marginTopBot">
                    <form onSubmit={this.props.onTagSearchSubmit}>
                        <select name="currentlySelectedTag" value={this.props.currentlySelectedTag} onChange={this.handleChange} disabled={this.props.inEditMode}>
                            <option name="defaultTagOption"
                                    value="defaultOption"
                                    key="defaultOption">---Select a Tag---</option>
                            {Object.keys(this.props.tags).map(key => {
                                return ( <option name="tagOption"
                                                 key={key}
                                                 value={key}>{this.props.tags[key].name}</option>
                                )
                            })}
                        </select>
                        <button class = "marginTopBot marginLeft btn btn-info" disabled={this.props.inEditMode}>Filter </button>
                    </form>
                </div>

                <div className="quizSelection">
                    {/* TODO: Must maintain concurrency: I.e. if a quiz is deleted by another admin, need to make sure
                            the currently selected quiz changed back to default, or alerts the user
                        */}
                    <form onSubmit={this.props.onSelectEditQuizSubmit}>
                        <select style={{width: 800 + 'px'}} class = "form-control" size = "10" name="currentlySelectedQuiz" value={this.props.currentlySelectedQuiz}
                                onChange={this.handleChange} disabled={this.props.inEditMode}>
                            {this.props.quizFilterResults.length > 0 && this.props.quizFilterResults.map((item) => {
                                return (
                                    <option name="quizToSelectOption"
                                            key={item.id}
                                            value={item.id}>{item.quizText}</option>
                                )
                            })}
                        </select>
                        <button class = "marginTopBot btn btn-info" disabled={this.props.inEditMode}> EDIT</button>
                    </form>
                </div>
            </div>
        )
    }
}

const InitialQuizEditState = {
    quizData : undefined,
    quizDataInitialLoad : undefined
};

class QuizEdit extends Component {
    constructor(props) {
        super(props);
        {/* Actual state is listed above in the constant var called InitialQuizEditState*/}
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
        {/* Firstly, need to ensure that the question does not already belong to the quiz! */}
        if (!(this.props.currentlySelectedQuestion in this.state.quizData)) {
            this.setState({
                quizData: Object.assign({}, this.state.quizData, {
                    questions : Object.assign({}, this.state.quizData.questions, {
                        [this.props.currentlySelectedQuestion] : true,
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
            {/* 1. If you are not in edit mode, but have requested to go into edit mode */}
            {/* Grab the data listed in Firebase so the user can edit! */}
            {/* Data Should be copied into a local structure */}
            db.getQuizWithID(this.props.selectedQuizForEditing).once('value', (snapshot) => {
                this.setState({quizData : snapshot.val(), quizDataInitialLoad : snapshot.val()});
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
        let that = this;
        updates['/quiz/' + this.props.selectedQuizForEditing] = this.state.quizData;
        updates['/quiz-name/' + this.props.selectedQuizForEditing ] = {name: this.state.quizData.name};
        {/* Be sure to update question relationships too! Let them know that they are part of the quiz */}
        Object.keys(this.state.quizData.questions).forEach(key => {
            updates['/question/' + key + '/quizzes/' + this.props.selectedQuizForEditing] = true;
        });
        {/* Here we do a set difference with the initial backup, to see if anything was deleted ( and thus set to null to delete it) */}
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
        {/* Need to firstly ensure that you are removing tags and other linked information */}
        Object.keys(this.state.quizDataInitialLoad.tags).forEach(key => {
            deletes['/tag/' + key + '/quizzes/' + this.props.selectedQuizForEditing] = null;
        });
        {/* Be sure to delete question relationships too! Let them know that they are no longer a part of the quiz */}
        Object.keys(this.state.quizDataInitialLoad.questions).forEach(key => {
            deletes['/question/' + key + '/quizzes/' + this.props.selectedQuizForEditing] = null;
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
                <div>
                    <div class = "marginstuff">
                        <form onSubmit={this.submitQuiz}>
                            <h1> Edit </h1>
                            <div>
                                <div class = "row">
                                    <div class = "column">
                                        <div align = "left">
                                            <button type="button" class = "marginTopBot marginLeft btn btn-info" onClick={this.handleExitEditMode}> RETURN TO QUIZ LIST </button>
                                            <h4> Quiz Name: </h4>
                                            <input type="text"
                                                   name="existingQuizText"
                                                   value={this.state.quizData.name}
                                                   placeholder="Enter Quiz Text Here" maxlength="60" size="70"
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
                                        </div>
                                    </div>
                                    <div class = "column">
                                        <div align = "left">
                                            <h4> Questions in Quiz </h4>
                                            {Object.keys(this.state.quizData.questions).map((quizID) => {
                                                return (
                                                    <div key={quizID}>
                                                        <textarea class = "form-control" name="questionsInSelection" disabled="true" maxlength="60" size="3"
                                                               value={this.props.allQuestionNames[quizID].name} />
                                                        <button type="button" class = "marginTopBot marginLeft btn btn-info" onClick={(event) => this.deleteQuestionFromQuiz(event, quizID)}> Delete </button>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>

                    </div>
                    <div class ="marginstuff">
                        <AddQuestionToQuiz
                            addQuestionToQuiz={this.addQuestionToQuiz}
                            handleChange={this.handleChange}
                            handleGetQuestionsWithTag={this.handleGetQuestionsWithTag}
                            currentlySelectedQuestion={this.props.currentlySelectedQuestion}
                            currentlySelectedTagForQuestionSearch={this.props.currentlySelectedTagForQuestionSearch}
                            questionFilterResults={this.props.questionFilterResults}
                            tags={this.props.tags}
                            />
                    </div>
                    <form class = "marginstuff" onSubmit={this.deleteQuiz}>
                            <button class = "marginTopBot marginLeft btn btn-info">SUBMIT</button>
                            <button class = "marginTopBot marginLeft btn btn-info" > DELETE </button>
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
        return (
            <div class = "marginstuff">
                <button class = "btn btn-info" disabled={this.props.inEditMode} onClick={() => this.openModal()}>ADD QUIZ</button>
                <div class ="roundedge">
                    <Modal isOpen={this.state.isModalOpen} onClose={() => this.closeModal()}>
                            <div class = 'roundedgetop modal-header'>
                                <h1>ADD A QUIZ </h1>
                            </div>
                            <form class = 'modalPad' onSubmit={this.props.onAddQuizSubmit}>
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

                            </form>
                            <div class = "roundedgebot modal-header" >
                                    <button class = "btn btn-info" disabled={this.props.inEditMode} onClick={() => this.closeModal()}>ADD</button>
                            </div>


                    </Modal>
                </div>
                
            </div>
        )
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
            <div className="addQuestionDiv">
                <div className="filterTag">
                    <form onSubmit={this.props.handleGetQuestionsWithTag}>
                        <select name="currentlySelectedTagForQuestionSearch" value={this.props.currentlySelectedTagForQuestionSearch} onChange={this.handleChange} disabled={this.props.inEditMode}>
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
                        <button class = "marginTopBot marginLeft btn btn-info" disabled={this.props.inEditMode}>Search For Questions With Tag </button>
                    </form>
                </div>
                {this.props.questionFilterResults.length > 0 &&
                <div className="questionSelection">
                    {/* TODO: Must maintain concurrency: I.e. if a question is deleted by another admin, need to make sure
                                            the currently selected question changed back to default, or alerts the user
                                        */}
                    <form onSubmit={this.props.addQuestionToQuiz}>
                        <select class = "form-control" size = "5" name="currentlySelectedQuestion" value={this.props.currentlySelectedQuestion}
                                onChange={this.handleChange} disabled={this.props.inEditMode}>
                            <option name="defaultQuestionOption"
                                    value="defaultOption"
                                    key="defaultOption">---Please Select a Question---
                            </option>
                            {this.props.questionFilterResults.map((item) => {
                                return (
                                    <option name="questionToSelectOption"
                                            key={item.id}
                                            value={item.id}>{item.questionText}</option>
                                )
                            })}
                        </select>
                        <button class = "marginTopBot marginLeft btn btn-info" disabled={this.props.inEditMode}> Add Question To Quiz!</button>
                    </form>
                </div>
                }
            </div>
        );

    }
}

export default QuizzesPage;
