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
            questions: []
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
                </div>


                <div className="questionSelection">
                    {/* TODO: Must maintain concurrency: I.e. if a question is deleted by another admin, need to make sure
                        the currently selected question changed back to default, or alerts the user
                    */}
                    <select name="currentlySelectedQuestion" value={this.state.currentlySelectedQuestion} onChange={this.handleChange}>
                        <option name="defaultQuestionOption"
                                value="defaultOption"
                                key="defaultOption">---Please Select a Question---</option>
                        {this.state.questions.map((question) => {
                            return (
                                <option name="questionToSelectOption"
                                        key={question.id}
                                        value={question.id}>{question.questionText}</option>
                            )
                        })}
                    </select>
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