import React, { Component } from 'react';

import { db } from '../../firebase';
import * as utils from '../../utilities/utils.js'

export class RemoveTag extends Component {
    constructor(props) {
        super(props);

        this.state = {
            tagToDelete : "defaultOption"
        };

        this.removeTag = this.removeTag.bind(this);
        this.handleChange = this.handleChange.bind(this);

    }

    handleChange(event) {
        this.setState({[event.target.name]: event.target.value})
    }
    removeTag(event) {
        event.preventDefault();

        let that = this;
        if (this.state.tagToDelete !== "defaultOption") {
            const tagRef = db.getTagReference();

            let deletes = {};
            deletes[this.state.tagToDelete] = null;

            tagRef.update(deletes).then(function () {
                that.setState({
                    tagToDelete : "defaultOption"
                })
            });
        }

    }

    render() {
        if(!this.props.inEditMode) {
            return (

                <div className="card mb-4 box-shadow">
                    <div className="card-header">
                        <h4 className="my-0 font-weight-normal">Remove Tag</h4>
                    </div>
                    <div className="card-body">
                        <p> Here, you can remove a tag from QuizEdu!</p>
                        <div className="container">
                            <select name="tagToDelete" className="form-control"
                                    value={this.state.tagToDelete}
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

                            <button onClick={this.removeTag} className="btn btn-warning btn-block"
                                    disabled={this.props.inEditMode}> Delete
                            </button>
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