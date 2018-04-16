import React, { Component } from 'react';
import * as routes from '../../constants/routes';
import { firebase } from '../../firebase';
import { db } from '../../firebase';
import * as utils from '../../utilities/utils.js'

class QuestionsPage extends Component {
    constructor (props) {
        super(props);
        this.state = {
            currentlySelectedQuestion : "defaultOption",
            currentlySelectedTag : "defaultOption",
            currentlySelectedTagToAdd: "defaultOption",
            searchQuestionName: "",
            newQuestionText : "",
            tags : {},
            allQuestionNames : {},
            questionFilterResults: [],
            inEditMode : false,
            newAnswerText : ""
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleAddQuestionSubmit = this.handleAddQuestionSubmit.bind(this);
        this.handleSearchForQuestion = this.handleSearchForQuestion.bind(this);
        this.handleGetQuestionsWithTag = this.handleGetQuestionsWithTag.bind(this);
        this.handleGetQuestionForEditFormSubmit = this.handleGetQuestionForEditFormSubmit.bind(this);
        this.handleExitEditMode = this.handleExitEditMode.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value})
    }
    handleAddQuestionSubmit(event) {
        event.preventDefault();

        let that = this;
        if (this.state.currentlySelectedTagToAdd !== "defaultOption") {
            console.log("Test Here");
            {/* Need to be sure this works well with the filters */
            }
            const quesRef = db.getQuestionReference();

            let currDate = new Date();
            let dateAdd = currDate.toISOString().split('T')[0];
            let timeAdd = currDate.toTimeString().split(' ')[0];

            {/* This push operation is all client-side. I.e., we can run it without worrying about asynchronous issues */}
            let newAddition = quesRef.push();
            let keyVal = newAddition.key;
            {/* This next section must utilize Promises to ensure that it all operates synchronously */}
            let newQuestionData = {
                name: this.state.newQuestionText,
                datecreated: dateAdd,
                imageforanswers: false,
                imageforquestion: false,
                lastused: false,
                points: 100,
                tags: {[this.state.currentlySelectedTagToAdd] : true},
                timecreated: timeAdd
            };

            let updates = {};
            updates['question/' + keyVal] = newQuestionData;
            updates['question-name/' + keyVal] = {name: that.state.newQuestionText};
            updates['choices/' + keyVal] = {answers: false, correctanswers: false};
            updates['tag/' + this.state.currentlySelectedTagToAdd + '/questions/' + keyVal] = true;

            db.getFullDBReference().update(updates).then(function () {
                that.setState({
                    newQuestionText : "",
                    currentlySelectedTagToAdd: "defaultOption",
                    currentlySelectedQuestion : "defaultOption",
                    currentlySelectedTag : "defaultOption"})
            });


        }
    }

    handleGetQuestionForEditFormSubmit(event) {
        event.preventDefault();
        if(this.state.currentlySelectedQuestion !== "defaultOption") {
            this.setState({inEditMode: true});
        }

    }

    handleSearchForQuestion(event) {
        event.preventDefault();
    }

    handleExitEditMode(event) {
        event.preventDefault();
        this.setState({inEditMode: false,
            currentlySelectedQuestion : "defaultOption",
            currentlySelectedTag : "defaultOption",
            questionFilterResults : false
        });
    }

    handleGetQuestionsWithTag(event) {
        event.preventDefault();
        if (this.state.currentlySelectedTag !== "defaultOption") {
            {/* Iterate through selected tag, find the questions that have that tag, then set the state? */}
            this.setState({ currentlySelectedQuestion : "defaultOption"});
            let stateToSet = [];
            for (let quesID in this.state.tags[this.state.currentlySelectedTag].questions) {
                if (this.state.tags[this.state.currentlySelectedTag].questions[quesID] === true) {
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

    render () {
        return (
            <div class = "center">
                <h1>MANAGE QUESTIONS</h1> {/* Header for the Question Creation/Editing Page */}

                {/* Here is the box for searching/filtering questions */}
                <FilterQuestions
                    tags={this.state.tags}
                    handleChange={this.handleChange}
                    currentlySelectedTag={this.state.currentlySelectedTag}
                    onTagSearchSubmit={this.handleGetQuestionsWithTag}
                    onSelectEditQuestionSubmit={this.handleGetQuestionForEditFormSubmit}
                    currentlySelectedQuestion={this.state.currentlySelectedQuestion}
                    allQuestionNames={this.state.allQuestionNames}
                    questionFilterResults={this.state.questionFilterResults}
                    inEditMode={this.state.inEditMode}/>

                <AddQuestion
                    newQuestionText={this.state.newQuestionText}
                    onAddQuestionSubmit={this.handleAddQuestionSubmit}
                    handleChange={this.handleChange}
                    inEditMode={this.state.inEditMode}
                    currentlySelectedTagToAdd={this.state.currentlySelectedTagToAdd}
                    tags={this.state.tags}/>

                {/* Here is the box for the editing of questions */}
                <QuestionEdit
                    selectedQuestionForEditing={this.state.currentlySelectedQuestion}
                    inEditMode={this.state.inEditMode}
                    handleChange={this.handleChange}
                    handleExitEditMode={this.handleExitEditMode}/>
                {/* {this.state.currentlySelectedQuestion !== 'defaultOption' && this.renderEditForm()} */}
            </div>
        )
    }
    componentDidMount () {
        db.getTagReference().on('value', (snapshot) => {
            let tagVal = snapshot.val();
            this.setState({
                tags : tagVal
            });
        });
        db.getAllQuestionNames().on('value', (snapshot) => {
            let quesVal = snapshot.val();
            this.setState({
                allQuestionNames : quesVal
            })
        });
    }
    componentWillUnmount() {
        db.getQuestionReference().off();
    }
}

class FilterQuestions extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
        this.props.handleChange(event)
    }
    render() {
        if(!this.props.inEditMode) {
            return (
                <div className="marginstuff">
                    <div className="questionTagSearch">
                        <form onSubmit={this.props.onTagSearchSubmit}>
                            <select name="currentlySelectedTag" value={this.props.currentlySelectedTag}
                                    onChange={this.handleChange} disabled={this.props.inEditMode}>
                                <option name="defaultTagOption"
                                        value="defaultOption"
                                        key="defaultOption">--Please Select a Tag!--
                                </option>
                                {Object.keys(this.props.tags).map(key => {
                                    return (<option name="tagOption"
                                                    key={key}
                                                    value={key}>{this.props.tags[key].name}</option>
                                    )
                                })}
                            </select>
                            <button class="marginTopBot marginLeft btn btn-info"
                                    disabled={this.props.inEditMode}>Filter
                            </button>
                        </form>
                    </div>
                    {/* Here is a box for searching for a question in the database by tag
            <div className="questionSearch">
                <form onSubmit={this.handleSearchForQuestion}>
                    <input type="text"
                           name="searchQuestionName"
                           placeholder="Enter the name of the question to search for"
                           value={this.state.searchQuestionName}
                           onChange={this.handleChange}
                    />
                    <button>Search</button>
                </form>
            </div> */}
                    <div className="questionSelection">
                        {/* TODO: Must maintain concurrency: I.e. if a question is deleted by another admin, need to make sure
                        the currently selected question changed back to default, or alert the user
                    */}
                        <form onSubmit={this.props.onSelectEditQuestionSubmit}>
                            <select style={{width: 800 + 'px'}} class="form-control" size="10"
                                    name="currentlySelectedQuestion" value={this.props.currentlySelectedQuestion}
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
                            <button class="marginTopBot btn btn-info" disabled={this.props.inEditMode}> Edit!</button>
                        </form>
                    </div>
                </div>
            )
        }
        else {
            return null;
        }
    }
}


const InitialQuestionEditState = {
    questionData : undefined,
    answerData : undefined,
    questionDataInitialLoad : undefined,
    answerDataInitialLoad : undefined
};

class QuestionEdit extends Component {
    constructor(props) {
        super(props);
        {/* Actual state is listed above in the constant var called InitialQuestionEditState*/}
        this.state = InitialQuestionEditState;

        this.handleChange = this.handleChange.bind(this);
        this.handleInStateChange = this.handleInStateChange.bind(this);
        this.handleInStateChange = this.handleTextStateChange.bind(this);
        this.submitQuestion = this.submitQuestion.bind(this);
        this.handleChangeAnswerText = this.handleChangeAnswerText.bind(this);
        this.handleChangeAnswerCorrectness = this.handleChangeAnswerCorrectness.bind(this);
        this.handleExitEditMode = this.handleExitEditMode.bind(this);
        this.addAnswerChoice = this.addAnswerChoice.bind(this);
        this.deleteAnswerChoice = this.deleteAnswerChoice.bind(this);
        this.deleteQuestion = this.deleteQuestion.bind(this);
    }
    reset() {
        this.setState(InitialQuestionEditState);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.inEditMode && nextProps.inEditMode) {
            {/* 1. If you are not in edit mode, but have requested to go into edit mode */}
            {/* Grab the data listed in Firebase so the user can edit! */}
            {/* Data Should be copied into a local structure */}
            console.log("1. We are beginning");
            db.getQuestionWithID(this.props.selectedQuestionForEditing).once('value', (snapshot) => {
                this.setState({questionData : snapshot.val(), questionDataInitialLoad : snapshot.val()});
                console.log("2. FB 1!");
            });
            db.getQuestionAnswersWithID(this.props.selectedQuestionForEditing).once('value', (snapshot) => {
                this.setState({answerData : snapshot.val(), answerDataInitialLoad : snapshot.val()});
                console.log("3. FB 2!");
            });
            console.log("4. We are done with Firebase!");
        }
        else if (this.props.inEditMode && !nextProps.inEditMode) {
            {/* 2. If you are in edit mode, but have requested to switch out back to filtering and selecting questions */}
            {/* Reset your state back to nothing! So clear everything you've done so far*/}
            this.reset();

        }
    }

    handleChange(event) {
        this.props.handleChange(event)
    }
    handleTextStateChange(event, keyName) {
        this.setState({
            questionData: Object.assign({}, this.state.questionData, {
                [keyName] : event.target.value,
            }),
        });
    }

    handleExitEditMode(event) {
        this.props.handleExitEditMode(event);
    }

    handleInStateChange(event) {
        this.setState({[event.target.name]: event.target.value})
    }

    handleChangeAnswerText(event, id) {
        {/* This is REALLY inefficient and we need another way of doing this without nested assigns*/}
        this.setState({
            answerData: Object.assign({}, this.state.answerData, {
                answers : Object.assign({}, this.state.answerData.answers, {
                    [id] : event.target.value,
                }),
            }),
        });
    }

    handleChangeAnswerCorrectness(event, id) {
        {/* This is REALLY inefficient and we need another way of doing this without nested assigns*/}
        this.setState({
            answerData: Object.assign({}, this.state.answerData, {
                correctanswers : Object.assign({}, this.state.answerData.correctanswers, {
                    [id] : event.target.checked,
                }),
            }),
        });
    }

    deleteAnswerChoice(event, id) {
        if(Object.keys(this.state.answerData.answers).length !== 1) {
            let removedKeyStateCopy = Object.assign({}, this.state);
            delete removedKeyStateCopy.answerData.answers[id];
            delete removedKeyStateCopy.answerData.correctanswers[id];
            this.setState(removedKeyStateCopy);
        }
    }

    addAnswerChoice(event) {
        if(Object.keys(this.state.answerData.answers).length !== 4) {
            let id = utils.generateAnswerID(); {/*  Generate A ID for the answer key */}
            this.setState({
                answerData: Object.assign({}, this.state.answerData, {
                    answers : Object.assign({}, this.state.answerData.answers, {
                        [id] : "",
                    }),
                    correctanswers : Object.assign({}, this.state.answerData.correctanswers, {
                        [id] : false,
                    }),
                }),
            });
        }
        else {
            {/* Alert user */}
        }
    }

    submitQuestion(event) {
        event.preventDefault();
        let updates = {};
        let that = this;
        updates['/question/' + this.props.selectedQuestionForEditing] = this.state.questionData;

        updates['/question-name/' + this.props.selectedQuestionForEditing ] = {name: this.state.questionData.name};
        updates['/choices/' + this.props.selectedQuestionForEditing] = this.state.answerData;
        db.getFullDBReference().update(updates).then(function () {
            that.props.handleExitEditMode(event);
        });
    }

    deleteQuestion (event) {
        event.preventDefault();
        let deletes = {};
        let that = this;
        {/* Need to firstly ensure that you are removing tags and other linked information */}
        Object.keys(this.state.questionDataInitialLoad.tags).forEach(key => {
            deletes['/tag/' + key + '/questions/' + this.props.selectedQuestionForEditing] = null;
        });
        {/* Be sure to delete quiz relationships too! Let them know that they no longer can use this question */}
        if(this.state.questionDataInitialLoad.quizzes !== undefined) {
            Object.keys(this.state.questionDataInitialLoad.quizzes).forEach(key => {
                deletes['/quiz/' + key + '/questions/' + this.props.selectedQuestionForEditing] = null;
            });
        }
        deletes['/question/' + this.props.selectedQuestionForEditing] = null;
        deletes['/question-name/' + this.props.selectedQuestionForEditing ] = null;
        deletes['/choices/' + this.props.selectedQuestionForEditing] = null;

        db.getFullDBReference().update(deletes).then(function () {
            that.props.handleExitEditMode(event);
        });
    }

    render() {
        if(this.props.inEditMode && this.state.questionData !== undefined && this.state.answerData !== undefined) {
            return(
                <div class = "marginstuff" className="questionEditDiv">
                    <form onSubmit={this.submitQuestion}>
                        <h1> Edit </h1>
                        <button type="button" onClick={this.handleExitEditMode}> Go Back To Question Select </button>
                        <h4> Question Name: </h4>
                        <input type="text"
                               name="existingQuestionText"
                               value={this.state.questionData.name}
                               placeholder="Enter Question Text Here" maxlength="90" size="100"
                               onChange={(event) => this.handleTextStateChange(event, "name")}/>
                        <h4> Points </h4>
                        <input type="text"
                               name="pointsRecievedOnCorrect"
                               value={this.state.questionData.points}
                               placeholder="Points gained on correct answer"
                               onChange={(event) => this.handleTextStateChange(event, "points")}/>
                        {/*
                        <input type="text"
                               name="tagForQuestionEdit"
                               placeholder="Enter Tag Here"
                               value={this.state.questionData.tags.} onChange={this.handleChange} /> */}

                        <Answers
                        answerData ={this.state.answerData}
                        handleChange = {this.handleInStateChange}
                        handleChangeAnswerText = {this.handleChangeAnswerText}
                        handleChangeAnswerCorrectness = {this.handleChangeAnswerCorrectness}
                        deleteAnswerChoice = {this.deleteAnswerChoice}
                        addAnswerChoice = {this.addAnswerChoice}/>

                        <button>Submit Changes!</button>
                    </form>
                    <form onSubmit={this.deleteQuestion}>
                        <h4> Want to delete the question? </h4>
                        <button> Delete (PERMANENT)</button>
                    </form>

                </div>
            )
        }
        else { return null; }
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


class AddQuestion extends Component {
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
                <button class = "btn btn-info" onClick={() => this.openModal()}>ADD QUESTIONS</button>
                <Modal isOpen={this.state.isModalOpen} onClose={() => this.closeModal()}>
                    <div class = 'roundedgetop modal-header'>
                        <h1>ADD A QUESTION</h1>
                    </div>
                    <form class = 'modalPad'onSubmit={this.props.onAddQuestionSubmit}>
                        <input type="text"
                               disabled={this.props.inEditMode}
                               name="newQuestionText"
                               placeholder="Please enter your question"
                               value={this.props.newQuestionText}
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
        )
    }
    openModal() {
        this.setState({ isModalOpen: true })
    }

    closeModal() {
        this.setState({ isModalOpen: false })
    }
}

class AddTag extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);

    }
    handleChange(event) {
        this.props.handleChange(event)
    }
}

class Answers extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
        this.handleAnswerTextChange = this.handleAnswerTextChange.bind(this);
        this.addNewAnswerChoice = this.addNewAnswerChoice.bind(this);
        this.deleteAnswerChoice = this.deleteAnswerChoice.bind(this);
    }
    handleChange(event) {
        this.props.handleChange(event)
    }

    handleAnswerTextChange(event, id) {
        this.props.handleChangeAnswerText(event, id);
    }

    handleAnswerCorrectOrNot(event, id) {
        this.props.handleChangeAnswerCorrectness(event, id);
    }

    deleteAnswerChoice(event, id) {
        this.props.deleteAnswerChoice(event, id);
    }
    addNewAnswerChoice(event) {
        this.props.addAnswerChoice(event);
    }

    render() {
        return(
            <div>
                <h3> Answers </h3>
                {Object.keys(this.props.answerData.answers).map((answerID) => {
                    return (
                        <div key={answerID}>
                            <input type="text" name="answersInSelection" placeholder="Enter Answer Text Here" maxlength="70" size="80"
                                   value={this.props.answerData.answers[answerID]} onChange={(event) => this.handleAnswerTextChange(event, answerID)}/>
                            <input type="checkbox" checked={this.props.answerData.correctanswers[answerID]} onChange={(event) => this.handleAnswerCorrectOrNot(event, answerID)}/>
                            <button type="button" onClick={(event) => this.deleteAnswerChoice(event, answerID)}> Delete </button>
                        </div>
                    )
                })}
                <button type ="button" onClick={this.addNewAnswerChoice}> Add New Answer Choice </button>
            </div>
        )
    }
}

export default QuestionsPage;