import React, { Component } from 'react';
import * as routes from '../../constants/routes';
import { firebase } from '../../firebase';
import { db } from '../../firebase';
import { storage } from '../../firebase';
import * as utils from '../../utilities/utils.js'
import {TagModification} from '../TagModification/TagModification.js'
import Dropzone from 'react-dropzone'

class QuestionsPage extends Component {
    constructor (props) {
        super(props);
        this.state = {
            currentlySelectedQuestion : "defaultOption",
            currentlySelectedTag : "defaultOption",
            searchQuestionName: "",
            tags : {},
            allQuestionNames : {},
            questionFilterResults: [],
            inEditMode : false,
            newAnswerText : ""
        };
        this.handleChange = this.handleChange.bind(this);
        this.quickStateUpdate = this.quickStateUpdate.bind(this);

        this.handleSearchForQuestion = this.handleSearchForQuestion.bind(this);
        this.handleGetQuestionsWithTag = this.handleGetQuestionsWithTag.bind(this);
        this.handleGetQuestionForEditFormSubmit = this.handleGetQuestionForEditFormSubmit.bind(this);
        this.handleExitEditMode = this.handleExitEditMode.bind(this);
    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value})
    }



    // Use the below function to update the state for the main landing page for Questions to account for new or removed questions
    quickStateUpdate(event) {
        this.setState({
            currentlySelectedTagToAdd: "defaultOption",
            currentlySelectedQuestion : Object.keys(this.state.allQuestionNames)[0],
            currentlySelectedTag : "defaultOption"})
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

        this.setState({inEditMode: false,
            currentlySelectedQuestion : Object.keys(this.state.allQuestionNames)[0], // Since we reset the page back to showing all question names (not filtered), select first option!
            currentlySelectedTag : "defaultOption",
            currentlySelectedTagToAdd : "defaultOption",
            questionFilterResults : false
        });
    }

    handleGetQuestionsWithTag(event) {
        event.preventDefault();
        if (this.state.currentlySelectedTag !== "defaultOption") {
            // Iterate through selected tag, find the questions that have that tag, then set the state?

            let stateToSet = [];
            for (let quesID in this.state.tags[this.state.currentlySelectedTag].questions) {
                if (this.state.tags[this.state.currentlySelectedTag].questions[quesID] === true) {
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

    render () {
        return (
            <div>
                <main role="main">
                    <div >
                        <div className="jumbotron">
                            <div className="container">
                                <h1 className="display-3"> Question Manager </h1>
                                    <p> Welcome to the Question Management page! Here you can create, edit, and delete questions for use within the QuizEdu iOS application.
                                    </p>
                            </div>
                        </div>
                        <div className="row marginstuff">
                            <div className="col-6 col-lg-4">
                                <AddQuestion
                                    updateState={this.quickStateUpdate}
                                    inEditMode={this.state.inEditMode}
                                    tags={this.state.tags}/>
                            </div>
                            <div className="col-12 col-sm-6 col-lg-8">
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
                            </div>

                              <QuestionEdit
                                  selectedQuestionForEditing={this.state.currentlySelectedQuestion}
                                  inEditMode={this.state.inEditMode}
                                  handleChange={this.handleChange}
                                  handleExitEditMode={this.handleExitEditMode}
                                  tags={this.state.tags}
                                  currentlySelectedTagToAdd={this.state.currentlySelectedTagToAdd}/>
                        </div>
                    </div >
                </main>
                <hr />
                <footer className="container">
                    <p>Developed by Chapman University</p>
                </footer>
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
            if (quesVal) {
                this.setState({
                    allQuestionNames : quesVal,
                    currentlySelectedQuestion: Object.keys(quesVal)[0] // Set the first selected question (for editing) to the first item that is auto-selected in the *select*
                })
            }
        });
    }
    componentWillUnmount() {
        db.getQuestionReference().off();
        db.getTagReference().off();
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
                    <div className="card mb-4 box-shadow">
                        <div className="card-header">
                            <h4 className="my-0 font-weight-normal">Edit Existing Question</h4>
                        </div>
                        <div className="card-body">
                            <p> If you would like to edit or remove a pre-existing question, use the tool below! Begin by selecting the tag you believe the
                            question may have. Then, hit the "Filter" button to display question with that tag! Select your question and then hit "Edit" to begin
                            alterations.</p>
                            <div className="container">
                              <form className="mb-3" onSubmit={this.props.onTagSearchSubmit}>
                                <div className="form-group row">
                                  <select name="currentlySelectedTag" className="form-control" value={this.props.currentlySelectedTag}
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
                                </div>
                                <button className="btn btn-primary btn-block"
                                        disabled={this.props.inEditMode}>Filter
                                </button>
                              </form>
                                  {/* TODO: Must maintain concurrency: I.e. if a question is deleted by another admin, need to make sure
                                  the currently selected question changed back to default, or alert the user
                              */}
                              <form onSubmit={this.props.onSelectEditQuestionSubmit}>
                                <div className="form-group row">
                                  <select className="form-control" size="10"
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
                                </div>
                                <button className="btn btn-primary btn-block" disabled={this.props.inEditMode}> Edit!</button>
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


const InitialQuestionEditState = {
    questionData : undefined, // The JS Object with the whole question structure and data(from Firebase)
    answerData : undefined, // The JS Object with the whole answer structure and data (from Firebase)
    questionDataInitialLoad : undefined, // The JS Object with the whole question structure and data(from Firebase), before any changes are made to it
    answerDataInitialLoad : undefined, // The JS Object with the whole answer structure and data (from Firebase), before any changes are made to it
    // Below: Image files and converted Image Data URLS (for display locally on the user's browser)
    questionImage: undefined, // An array which stores (1) question image the user uploads. After being confirmed for uploading, the url storage location is included in questionData
    answerImages: undefined, //An array which stores (2, 3, or 4) images for your question answers
    questionImageDataURL: undefined, // a single DataURL for the question image
    answerImageDataURL: undefined, // This will be an array of URLs
};

class QuestionEdit extends Component {
    constructor(props) {
        super(props);
        // Actual state is listed above in the constant var called InitialQuestionEditState
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
        this.addTagToQuestion = this.addTagToQuestion.bind(this);
        this.removeTagFromQuestion = this.removeTagFromQuestion.bind(this);
        this.removeQuestionImage = this.removeQuestionImage.bind(this);
        this.onDrop = this.onDrop.bind(this);
    }
    reset() {
        this.setState(InitialQuestionEditState);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.inEditMode && nextProps.inEditMode) {
            // 1. If you are not in edit mode, but have requested to go into edit mode
            // Grab the data listed in Firebase so the user can edit!
            // Data Should be copied into a local structure

            let that = this;
            db.getQuestionWithID(this.props.selectedQuestionForEditing).once('value', (snapshot) => {
                let snapVal = snapshot.val();
                if (snapVal.imageforquestion) { // Load in existing image(s), if one (and/or additional answer images) is already on a question
                    storage.getStorageRef().child(snapVal.imageurl).getDownloadURL().then(function(url) {
                        that.setState({questionData : snapshot.val(), questionDataInitialLoad : snapshot.val(),
                            questionImageDataURL : url
                        });
                    });
                }
                else { // Else just set the state regularly
                    this.setState({questionData : snapshot.val(), questionDataInitialLoad : snapshot.val()});
                }

            });


            db.getQuestionAnswersWithID(this.props.selectedQuestionForEditing).once('value', (snapshot) => {
                this.setState({answerData : snapshot.val(), answerDataInitialLoad : snapshot.val()});

            });

        }
        else if (this.props.inEditMode && !nextProps.inEditMode) {
            // 2. If you are in edit mode, but have requested to switch out back to filtering and selecting questions
            // Reset your state back to nothing! So clear everything you've done so far
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
        // This is REALLY inefficient and we need another way of doing this without nested assigns
        this.setState({
            answerData: Object.assign({}, this.state.answerData, {
                answers : Object.assign({}, this.state.answerData.answers, {
                    [id] : event.target.value,
                }),
            }),
        });
    }

    handleChangeAnswerCorrectness(event, id) {
        // This is REALLY inefficient and we need another way of doing this without nested assigns
        this.setState({
            answerData: Object.assign({}, this.state.answerData, {
                correctanswers : Object.assign({}, this.state.answerData.correctanswers, {
                    [id] : event.target.checked,
                }),
            }),
        });
    }

    deleteAnswerChoice(event, id) {
        // If the question doesn't have 2 answer choices (the minimum)
        if(Object.keys(this.state.answerData.answers).length !== 2) {
            let removedKeyStateCopy = Object.assign({}, this.state);
            delete removedKeyStateCopy.answerData.answers[id];
            delete removedKeyStateCopy.answerData.correctanswers[id];
            this.setState(removedKeyStateCopy);
        }
    }

    addAnswerChoice(event) {
        // Firstly, check to ensure we don't have more than 4 answers in the question!
        if(Object.keys(this.state.answerData.answers).length !== 4) {
            let id = utils.generateAnswerID(); //  Generate A ID for the answer key
            // Now, use Object.assign to create a temporary state with the updated information, which will then be set into the actual React component state.
            this.setState({
                answerData: Object.assign({}, this.state.answerData, {
                    // Below, we are doing two more inner Object.assigns, due to different property values needing to be updated (two in this case: answers and correctanswers
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
            // Alert user
        }
    }

    submitQuestion(event) {
        event.preventDefault();

        // Need to start a loading spinner here

        let updates = {}; // our updates! We update the question/ object, our tags within the tags/ object, the question-name/ object, & our answer choices/
        let that = this; // necessary for callback below


        // We will update the tags with the new and correct tag information (on the question)
        Object.keys(this.state.questionData.tags).forEach(key => {
            updates['/tag/' + key + '/questions/' + this.props.selectedQuestionForEditing] = true;
        });

        // Here we do a set difference with the initial backup (for duplicated tag data), to see if anything was deleted ( and thus set to null to delete it)
        Object.keys(this.state.questionDataInitialLoad.tags).forEach(key => {
            if (!(key in this.state.questionData.tags)) {
                updates['/tag/' + key + '/questions/' + this.props.selectedQuestionForEditing] = null;
            }
        });

        updates['/question/' + this.props.selectedQuestionForEditing] = this.state.questionData;
        updates['/question-name/' + this.props.selectedQuestionForEditing ] = {name: this.state.questionData.name};
        updates['/choices/' + this.props.selectedQuestionForEditing] = this.state.answerData;

        // Connect to Firebase and commit the updates! After you receive the callback stating the update was successful, exit edit mode
        db.getFullDBReference().update(updates).then(function () {
            console.log("1st Update!");

            // First, let's check and see if we used to not have an image on the question, and now an image has been added
            if(that.state.questionDataInitialLoad.imageforquestion === false && that.state.questionData.imageforquestion) {

                storage.getQuestionImagesFolderRef().child(that.props.selectedQuestionForEditing + "/" + that.state.questionImage.name)
                    .put(that.state.questionImage).then(function(snapshot) {
                    // File successfully uploaded
                    console.log("Add Successful");
                    that.props.handleExitEditMode(event);
                }).catch(function(error) {
                    console.log("Error in upload");
                });

            }
            // If not the first, let's check to see if there used to be an image on the question, but now it has been removed
            else if (that.state.questionDataInitialLoad.imageforquestion && that.state.questionData.imageforquestion === false) {

                storage.getStorageRef().child(that.state.questionDataInitialLoad.imageurl).delete().then(function(snapshot) {
                    // File successfully deleted
                    console.log("1.5");
                    console.log("Delete Successful");
                    that.props.handleExitEditMode(event);
                }).catch(function(error) {
                    console.log("Error");
                });

            }
            // If we had an image on the question before, but are "swapping it out" for a new one"
            else if (that.state.questionDataInitialLoad.imageforquestion && that.state.questionData.imageforquestion &&
                (that.state.questionDataInitialLoad.imageurl !== that.state.questionData.imageurl)) {

                // Delete Existing Image
                storage.getStorageRef().child(that.state.questionDataInitialLoad.imageurl).delete().then(function() {
                    // File successfully deleted
                    console.log("Delete Successful");
                }).then(function () {
                    storage.getQuestionImagesFolderRef().child(that.props.selectedQuestionForEditing + "/" + that.state.questionImage.name)
                        .put(that.state.questionImage).then(function () {
                        // File successfully uploaded
                        console.log("success in 3!");
                        that.props.handleExitEditMode(event);
                    });
                });
            }
            else {
                console.log("2nd Exit!!");
                that.props.handleExitEditMode(event);
            }
        });
    }

    deleteQuestion (event) {
        event.preventDefault();
        let deletes = {};
        let that = this;
        // Need to firstly ensure that you are removing tags and other linked information
        Object.keys(this.state.questionDataInitialLoad.tags).forEach(key => {
            deletes['/tag/' + key + '/questions/' + this.props.selectedQuestionForEditing] = null;
        });
        // Be sure to delete quiz relationships too! Let them know that they no longer can use this question
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

    addTagToQuestion (event) {
        event.preventDefault();

        // This is REALLY inefficient and we need another way of doing this without nested assigns
        this.setState({
            questionData: Object.assign({}, this.state.questionData, {
                tags : Object.assign({}, this.state.questionData.tags, {
                    [this.props.currentlySelectedTagToAdd] : true,
                }),
            }),
        });

    }

    removeTagFromQuestion (event, tagID) {
        event.preventDefault();

        if(Object.keys(this.state.questionData.tags).length !== 1) {
            let removedKeyStateCopy = Object.assign({}, this.state);
            delete removedKeyStateCopy.questionData.tags[tagID];
            this.setState(removedKeyStateCopy);
        }

    }

    removeQuestionImage(event) {
        this.setState( {
            questionImage : undefined, // Remove image file
            questionImageDataURL: undefined, // Remove converted Data URL
            // Also need to update questionData, flipping the boolean for imageforquestion to be true
            questionData: Object.assign({}, this.state.questionData, {
                imageforquestion : false,
                imageurl : null, // null so it is removed in the Firebase database when committed
            }),
        });
    }

    onDrop(accepted, rejected) {
        if(accepted.length > 0) { // If we have a valid accepted file

            // Firstly,
            let reader = new FileReader(); // create a new file reader to read our File (questionImage)
            let that = this;

            // Secondly, set the state to have the most recent information for the new image
            // Here we create a callback function to occur after the data is read in and successfully coverted
            reader.onload = function() {
                that.setState( {
                    questionImage : accepted[0], // Set the item that was dropped in as the image for the question. Since we disallow multiple files, this is always one file
                    questionImageDataURL : reader.result, // Set the completed, converted local URL for the image
                    // Also need to update questionData, flipping the boolean for imageforquestion to be true
                    questionData: Object.assign({}, that.state.questionData, {
                        imageforquestion : true,
                        imageurl : "images/questionimages/" + that.props.selectedQuestionForEditing + "/" + accepted[0].name,
                        // Since the url should be at the same location as when we actually upload it, we can assume the above gs:// location
                        // File is not actually uploaded yet! That comes during the submitQuestion step (we are just holding data locally right now)
                    }),
                });
                console.log(accepted[0].name);
            };

            reader.readAsDataURL(accepted[0]);
        }
    }

    render() {
        if(this.props.inEditMode && this.state.questionData !== undefined && this.state.answerData !== undefined) {
            return(
                <div>
                  <div className="row mb-4">
                    <div className="col-6 col-sm-4">
                      <button type="button" className="btn btn-light btn-lg" onClick={this.handleExitEditMode}> Go Back To Question Select </button>
                    </div>
                    <div className="col-6 col-sm-4">
                      <button className="btn btn-success btn-lg" onClick={this.submitQuestion}> Submit (PERMANENT)</button>
                    </div>
                    <div className="col-6 col-sm-4">
                      <button className="btn btn-danger btn-lg" onClick={this.deleteQuestion}> Delete (PERMANENT)</button>
                    </div>
                  </div>
                    <form className="mb-3" onSubmit={this.submitQuestion}>
                      <div className="row">

                        <div className="col-6 col-lg-4">
                            <div className="card mb-4 box-shadow">
                                <div className="card-header">
                                    <h4 className="my-0 font-weight-normal">Question Info</h4>
                                </div>
                                <div className="card-body">
                                    <p> Here, you can edit the Question Name, and the amount of points the question is worth</p>
                                    <div className="container">
                                      <div className="form-group row">
                                        <textarea
                                               name="existingQuestionText" className="form-control"
                                               value={this.state.questionData.name}
                                               placeholder="Enter Question Text Here" maxLength="200" rows="5"
                                               cols="60"
                                               onChange={(event) => this.handleTextStateChange(event, "name")}/>
                                      </div>
                                      <div className="form-group row">
                                        <input type="text" className="form-control"
                                               name="pointsRecievedOnCorrect"
                                               value={this.state.questionData.points}
                                               placeholder="Points gained on correct answer"
                                               onChange={(event) => this.handleTextStateChange(event, "points")}
                                               />
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
                                handleAddTagToData={this.addTagToQuestion}
                                handleRemoveTagFromData={this.removeTagFromQuestion}
                                specificData={this.state.questionData}
                                currentlySelectedTagToAdd={this.props.currentlySelectedTagToAdd}
                            />
                          </div>

                      </div>

                      <div className="row" >

                        <div className="col-6 col-lg-4">

                            <div className="card mb-4 box-shadow">
                                <div className="card-header">
                                    <h4 className="my-0 font-weight-normal">Question Image</h4>
                                </div>
                                <div className="card-body">
                                    <p> Here you can set a image to be displayed alongside (or in place of) the question, if you so desire.
                                    Please ensure your image is of a .jpeg or .png file type</p>
                                    <div className="container">
                                            {this.state.questionData.imageforquestion && this.state.questionImageDataURL && // Only show this image and button if image attached
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <img src={this.state.questionImageDataURL} alt="" className="img-fluid w-100" />
                                                    <button className="btn btn-danger" type="button" onClick={this.removeQuestionImage}>
                                                        Remove Image?
                                                    </button>
                                                </div>
                                            </div>
                                            || // Or, if no image currently on the question... let the user add one!
                                            <div className="row">
                                                <Dropzone
                                                    accept="image/jpeg, image/png"
                                                    multiple={false}
                                                    onDrop={(accepted, rejected) => this.onDrop(accepted, rejected) }>
                                                    <p>
                                                    </p>
                                                </Dropzone>
                                            </div>
                                            }
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-8">
                          <Answers
                          answerData ={this.state.answerData}
                          handleChange = {this.handleInStateChange}
                          handleChangeAnswerText = {this.handleChangeAnswerText}
                          handleChangeAnswerCorrectness = {this.handleChangeAnswerCorrectness}
                          deleteAnswerChoice = {this.deleteAnswerChoice}
                          addAnswerChoice = {this.addAnswerChoice}/>
                        </div>

                      </div>

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

        this.state = {
            currentlySelectedTagToAdd : "defaultOption",
            newQuestionText : "",
            newQuestionA1 : "",
            newQuestionA1check : false,
            newQuestionA2 : "",
            newQuestionA2check : false,
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleChangeAnswerCorrectnessNewQ = this.handleChangeAnswerCorrectnessNewQ.bind(this);
        this.handleChangeAnswerTextNewQ = this.handleChangeAnswerTextNewQ.bind(this);
        this.handleAddQuestionSubmit = this.handleAddQuestionSubmit.bind(this);
    }
    handleChange(event) {
        this.setState({[event.target.name]: event.target.value});
    }

    handleChangeAnswerCorrectnessNewQ(event, id) {
        // This is REALLY inefficient and we need another way of doing this without nested assigns
        this.setState({
            [id] : event.target.checked
        });
    }

    handleChangeAnswerTextNewQ(event, id) {
        this.setState({
            [id] : event.target.value
        })
    }

    handleAddQuestionSubmit(event) {
        event.preventDefault();

        let that = this;
        if (this.state.currentlySelectedTagToAdd !== "defaultOption" && this.state.newQuestionText !== "" &&
            this.state.newQuestionA1 !== "" && this.state.newQuestionA2 !== "") {
                console.log("Test Here");
                // Need to be sure this works well with the filters
                const quesRef = db.getQuestionReference();

                let currDate = new Date();
                let dateAdd = currDate.toISOString().split('T')[0];
                let timeAdd = currDate.toTimeString().split(' ')[0];

                // This push operation is all client-side. I.e., we can run it without worrying about asynchronous issues
                let newAddition = quesRef.push();
                let answer1ID = utils.generateAnswerID();
                let answer2ID = utils.generateAnswerID();

                let keyVal = newAddition.key;
                // This next section must utilize Promises to ensure that it all operates synchronously
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

                updates['choices/' + keyVal] = {
                    answers: {
                        [answer1ID] : this.state.newQuestionA1,
                        [answer2ID] : this.state.newQuestionA2
                    },
                    correctanswers: {
                        [answer1ID] : this.state.newQuestionA1check,
                        [answer2ID] : this.state.newQuestionA2check
                    }
                };

                updates['tag/' + this.state.currentlySelectedTagToAdd + '/questions/' + keyVal] = true;

                db.getFullDBReference().update(updates).then(function () {
                    // Reset state here
                    that.setState({
                        currentlySelectedTagToAdd : "defaultOption",
                        newQuestionText : "",
                        newQuestionA1 : "",
                        newQuestionA1check : false,
                        newQuestionA2 : "",
                        newQuestionA2check : false,
                    });

                    // Update state on main screen
                    that.props.updateState(event);
                });


        }
    }

    render() {
        if(!this.props.inEditMode) {
            return (
                <div className="card mb-4 box-shadow">
                    <div className="card-header">
                        <h4 className="my-0 font-weight-normal">Add New Question!</h4>
                    </div>
                    <div className="card-body">
                        <p> Want to add a new quiz to the QuizEdu system? Just click below! Be sure to select an initial tag for the quiz question</p>
                        <div className="container">
                            <form onSubmit={this.handleAddQuestionSubmit}>
                                <div className="form-group row">
                                    <input type="text" className="form-control"
                                           disabled={this.props.inEditMode}
                                           name="newQuestionText"
                                           placeholder="Please enter your question"
                                           value={this.state.newQuestionText}
                                           onChange={this.handleChange}
                                    />
                                </div>
                                <div className="form-group col-md-10">
                                    <select name="currentlySelectedTagToAdd" value={this.state.currentlySelectedTagToAdd} className="form-control"
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
                                <div className="form-group">
                                    <input type="text" className = "form-control" name="answersInSelection" placeholder="Enter Answer 1 Text Here" maxLength="70"
                                           value={this.state.newQuestionA1} onChange={(event) => this.handleChangeAnswerTextNewQ(event, "newQuestionA1")}/>
                                    <input  type="checkbox" checked={this.state.newQuestionA1check} onChange={(event) => this.handleChangeAnswerCorrectnessNewQ(event, "newQuestionA1check")}/>
                                    <label > Correct Answer? </label>
                                </div>

                                <div className="form-group">
                                    <input type="text" className = "form-control" name="answersInSelection" placeholder="Enter Answer 2 Text Here" maxLength="70"
                                           value={this.state.newQuestionA2} onChange={(event) => this.handleChangeAnswerTextNewQ(event, "newQuestionA2")}/>
                                    <input  type="checkbox" checked={this.state.newQuestionA2check} onChange={(event) => this.handleChangeAnswerCorrectnessNewQ(event, "newQuestionA2check")}/>
                                    <label > Correct Answer? </label>
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
          <div className="card mb-8 box-shadow">
              <div className="card-header">
                  <h4 className="my-0 font-weight-normal">Answers</h4>
              </div>
              <div className="card-body">
                  <p> Here is a list of all of the answers. Use the checkbox to indicate correct answer choices!</p>
                  <div className="container">
                {Object.keys(this.props.answerData.answers).map((answerID) => {
                    return (
                        <div className="form-group" key={answerID}>
                            <input type="text" className = "form-control" name="answersInSelection" placeholder="Enter Answer Text Here" maxLength="70" size="80"
                                   value={this.props.answerData.answers[answerID]} onChange={(event) => this.handleAnswerTextChange(event, answerID)}/>
                            <input type="checkbox" checked={this.props.answerData.correctanswers[answerID]} onChange={(event) => this.handleAnswerCorrectOrNot(event, answerID)}/>
                            <label > Correct Answer? </label>
                            <button type="button" className="btn btn-dark btn-block" onClick={(event) => this.deleteAnswerChoice(event, answerID)}> Delete </button>
                        </div>
                    )
                })}
                <button type ="button" className="btn btn-info" onClick={this.addNewAnswerChoice}> Add New Answer Choice </button>
              </div>
            </div>
          </div>
        )
    }
}

export default QuestionsPage;
