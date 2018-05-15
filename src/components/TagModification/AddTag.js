import React, { Component } from 'react';

import { db } from '../../firebase';
import * as utils from '../../utilities/utils.js'

export class AddTag extends Component {
    constructor(props) {
        super(props);

        this.state = {
            newTagText : ""
        };

        this.addTag = this.addTag.bind(this);
        this.handleChange = this.handleChange.bind(this);

    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value})
    }
    addTag(event) {
        event.preventDefault();

        let that = this;
        if (this.state.newTagText !== "") {
            const tagRef = db.getTagReference();

            let tagObj = {
                name : this.state.newTagText
            };

            tagRef.push().set(tagObj).then(function () {
                that.setState({
                    newTagText : ""
                })
            });
        }

    }

    render() {
        if(!this.props.inEditMode) {
            return (

                <div className="card mb-4 box-shadow">
                    <div className="card-header">
                        <h4 className="my-0 font-weight-normal">Add New Tag!</h4>
                    </div>
                    <div className="card-body">
                        <p> Here, you can add a new tag to QuizEdu!</p>
                        <div className="container">
                            <form onSubmit={this.addTag}>
                                <div className="form-group row">
                                    <input type="text"
                                           className="form-control"
                                           id="tagNameLabel"
                                           disabled={this.props.inEditMode}
                                           name="newTagText"
                                           placeholder="Please enter your tag name"
                                           value={this.state.newTagText}
                                           onChange={this.handleChange}
                                    />
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