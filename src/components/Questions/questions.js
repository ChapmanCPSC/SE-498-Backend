import React, { Component } from 'react';
import * as routes from '../../constants/routes';
import { firebase } from '../../firebase';
import { db } from '../../firebase';

class QuestionsPage extends Component {
    constructor (props) {
        super(props);
        this.state = {
            currentlySelectedQuestion : "defaultOption",
            currentlySelectedTag : "defaultOption",
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
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value})
    }
    handleAddQuestionSubmit(event) {
        {/* Need to be sure this works well with the filters */}
        event.preventDefault();
        const ref = db.getQuestionReference();
        let newAddition = ref.push();
        newAddition.set({
            text: this.state.newQuestionText
        });
        this.setState({currentlySelectedQuestion: newAddition.key})
    }
    handleGetQuestionForEditFormSubmit(event) {
        event.preventDefault();
        db.getQuestionWithID(this.state.currentlySelectedQuestion).once('value', (snapshot) => {
            this.setState({selectedQuestionData : snapshot.val()});
        });
        db.getQuestionAnswersWithID(this.state.currentlySelectedQuestion).once('value', (snapshot) => {
            this.setState({selectedQuestionAnswerData : snapshot.val()});
        });

    }

    handleSearchForQuestion(event) {
        event.preventDefault();
    }

    handleGetQuestionsWithTag(event) {
        event.preventDefault();
        {/* Iterate through selected tag, find the questions that have that tag, then set the state? */}
        this.state.currentlySelectedQuestion = "defaultOption";
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

    render () {
        return (
            <div className="wholeQuestionPage">
                <h1>Questions Page</h1> {/* Header for the Question Creation/Editing Page */}

                {/* Here is the box for searching/filtering questions */}
                <FilterQuestions
                    tags={this.state.tags}
                    handleChange={this.handleChange}
                    currentlySelectedTag={this.state.currentlySelectedTag}
                    onTagSearchSubmit={this.handleGetQuestionsWithTag}
                    onSelectEditQuestionSubmit={this.handleGetQuestionForEditFormSubmit}
                    currentlySelectedQuestion={this.state.currentlySelectedQuestion}
                    questionFilterResults={this.state.questionFilterResults}/>

                <AddQuestion
                    newQuestionText={this.state.newQuestionText}
                    onAddQuestionSubmit={this.state.handleAddQuestionSubmit}
                    handleChange={this.handleChange}/>
                {/* Here is the box for the editing of questions */}
                <QuestionEdit
                    selectedQuestionForEditing={this.state.currentlySelectedQuestion}
                    inEditMode={this.state.inEditMode}
                    handleChange={this.handleChange}/>
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
        return(
            <div>
                <div className="questionTagSearch">
                    <form onSubmit={this.props.onTagSearchSubmit}>
                        <select name="currentlySelectedTag" value={this.props.currentlySelectedTag} onChange={this.handleChange}>
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
                        <button>Search For Questions With Tag </button>
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
                {this.props.questionFilterResults.length > 0 &&
                    <div className="questionSelection">
                        {/* TODO: Must maintain concurrency: I.e. if a question is deleted by another admin, need to make sure
                            the currently selected question changed back to default, or alerts the user
                        */}
                        <form onSubmit={this.props.onSelectEditQuestionSubmit}>
                            <select name="currentlySelectedQuestion" value={this.props.currentlySelectedQuestion}
                                    onChange={this.handleChange}>
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
                            <button> Edit!</button>
                        </form>
                    </div>
                }
            </div>
        )
    }
}

class QuestionEdit extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedQuestionData : undefined,
            selectedQuestionAnswerData : undefined
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.props.handleChange(event)
    }
    deleteAnswerChoice() {

    }
    render() {
        if(this.props.inEditMode == true) {
            return(
                <div className="questionEditDiv">
                    <form>
                        <h1> Edit </h1>
                        <input type="text"
                               name="existingQuestionText"
                               value={this.props.selectedQuestionData.text}
                               placeholder="Enter Question Text Here"
                               onChange={this.handleChange} />
                        <input type="text"
                               name="tagForQuestionEdit"
                               placeholder="Enter Tag Here"
                               value={this.props.tagForQuestionEdit} onChange={this.handleChange} />
                        <div>
                            <h3> Answers </h3>
                            {Object.keys(this.props.selectedQuestionAnswerData.answers).map((item) => {
                                return (
                                    <div>
                                        <input type="text" name="answersInSelection"
                                               value={this.props.selectedQuestionAnswerData.answers[item]} onChange={this.handleChange}/>
                                        <input type="checkbox" />
                                        <button type="button" onClick={this.deleteAnswerChoice}> Delete </button>
                                    </div>
                                )
                            })}
                            <button type ="button"> Add New Answer Choice </button>
                        </div>
                        <button>Submit Changes!</button>
                    </form>
                </div>
            )
        }
        else { return null; }
    }
}


class AddQuestion extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
        this.props.handleChange(event)
    }
    render() {
        return (
            <div className="addNewQuestion">
                <form onSubmit={this.props.onAddQuestionSubmit}>
                    <input type="text"
                           name="newQuestionText"
                           placeholder="Please enter your question"
                           value={this.props.newQuestionText}
                           onChange={this.handleChange}
                    />
                    <button>Add Question</button>
                </form>
            </div>
        )
    }
}

class Answers extends React.Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }
    handleChange(event) {
        this.props.handleChange(event)
    }

    deleteAnswerChoice() {

    }
    addNewAnswerChoice() {

    }

    render() {
        return null;
    }
}

export default QuestionsPage;