import React, { Component } from 'react';

import { db } from '../../firebase';
import * as utils from '../../utilities/utils.js'

export class TagModification extends Component {
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);

    }
    handleChange(event) {
        this.props.handleChange(event)
    }

    render() {
        return (
            <div className="card mb-4 box-shadow">
                <div className="card-header">
                    <h4 className="my-0 font-weight-normal">Add Tags to Quiz</h4>
                </div>
                <div className="card-body">
                    <p> Here, you can pick tags which you would like to add or remove from the quiz!</p>
                    <div className="container">
                        {/* IMPORTANT! - Right now (the below name) is the same name as the one we use for adding questions/quizzes*/}
                        <select name="currentlySelectedTagToAdd"
                            value={this.props.currentlySelectedTagToAdd}
                            onChange={this.handleChange}>
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
                        {/* Must implement the below function in a higher (containing) component (with state!)*/}
                        <button className="btn btn-info" onClick={this.props.handleAddTagToData}>
                            Add Tag!
                        </button>

                        {/* DISPLAYING TAGS*/}

                        <h4> Tags</h4>
                        {Object.keys(this.props.specificData.tags).map((tagID) => { {/*Here you can plug in either quiz or question data for specificData*/}
                            return (
                                <div key={tagID} className="d-inline">
                                <button className = "btn no-click" name="tagsInEditComponent" >
                                        {this.props.tags[tagID].name}
                                    </button> {/* Must implement this a higher component (with state!)*/}
                                    <button type="button" className=" btn btn-info"
                                            onClick={(event) => this.props.handleRemoveTagFromData(event, tagID)}> Delete
                                    </button> {/* Must implement the above function in a higher component (with state!)*/}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }
}