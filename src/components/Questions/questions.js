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
            questionFilterResults: []
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleAddQuestionSubmit = this.handleAddQuestionSubmit.bind(this);
        this.handleSearchForQuestion = this.handleSearchForQuestion.bind(this);
        this.handleGetQuestionsWithTag = this.handleGetQuestionsWithTag.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value})
    }
    handleAddQuestionSubmit(event) {
        event.preventDefault();
        const ref = db.getQuestionReference();
        let newAddition = ref.push();
        newAddition.set({
            text: this.state.newQuestionText
        });
        this.setState({currentlySelectedQuestion: newAddition.key})
    }

    handleSearchForQuestion(event) {
        event.preventDefault();
    }

    handleGetQuestionsWithTag(event) {
        event.preventDefault();
        {/* Iterate through selected tag, find the questions that have that tag, then set the state? */}
        let stateToSet = [];
        for (let item in this.state.tags) {
            for (let quesID in this.state.tags[item].questions) {
                if (this.state.tags[item].questions[quesID] === true) {
                    db.getQuestionWithID(quesID).on('value', (snapshot) => {
                        let questionsVal = snapshot.val();
                        stateToSet.push( {
                            id : quesID,
                            questionText : questionsVal.text
                        });
                        console.log(quesID);
                    });
                }
            }
        }
        this.setState({
            questionFilterResults: stateToSet
        });
    }

    renderEditForm() {
        {/* this.state.questions[this.state.currentlySelectedQuestion].questionText */}
        return(
            <div className="questionEditDiv">
                <form>
                    <input type="text"
                           name="existingQuestionText"
                           value="PLEASECHANGETHIS!"
                           onChange={this.handleChange}
                    />
                </form>
            </div>
        )
    }

    render () {
        return (
            <div className="wholeQuestionPage">
                <h1>Questions Page</h1> {/* Header for the Question Creation/Editing Page */}

                {/* Here is a box for searching for a question in the database by tag */}
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
                </div>

                {/* Here is a dropdown for tags! */}

                <div className="questionTagSearch">
                    <form onSubmit={this.handleGetQuestionsWithTag}>
                        <select name="currentlySelectedTag" value={this.state.currentlySelectedTag} onChange={this.handleChange}>
                            <option name="defaultTagOption"
                                    value="defaultOption"
                                    key="defaultOption">---Select a Tag!---</option>
                            {Object.keys(this.state.tags).map(key => {
                                return ( <option name="tagOption"
                                                 key={key}
                                                 value={key}>{this.state.tags[key].name}</option>
                                )
                            })}
                        </select>
                        <button>Search For Questions With Tag </button>
                    </form>

                </div>

                {/* Here is a box and button for adding a new question */}
                <div className="addNewQuestion">
                    <form onSubmit={this.handleAddQuestionSubmit}>
                        <input type="text"
                               name="newQuestionText"
                               placeholder="Please enter your question"
                               value={this.state.newQuestionText}
                               onChange={this.handleChange}
                        />
                        <button>Add Question</button>
                    </form>
                </div>

                {/* Here is the box for the editing of questions */}
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


        {/*
        db.getQuestionReference().on('value', (snapshot) => {
            let questionsVal = snapshot.val();
            let stateToSet = [];
            for (let item in questionsVal) {
                stateToSet.push({
                    id : item,
                    questionText : questionsVal[item].text
                })
            }
            this.setState({
                questions: stateToSet
            });
        }); */}
    }
    componentWillUnmount() {
        db.getQuestionReference().off();
    }
}

export default QuestionsPage;