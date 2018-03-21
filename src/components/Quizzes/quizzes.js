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
                onSelectEditQuestionSubmit={this.handleGetQuizForEditFormSubmit}
                currentlySelectedQuiz={this.state.currentlySelectedQuiz}
                quizFilterResults={this.state.quizFilterResults}
                inEditMode={this.state.inEditMode}/>
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




export default QuizzesPage;
