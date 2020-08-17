import React from 'react';
import PropTypes from 'prop-types';
import {
  Form, FormControl, FormGroup, ControlLabel, Button,
} from 'react-bootstrap';

export default class IssueAdd extends React.Component {
  // move in the timer and trigger the addition of a new issue from this component
  constructor() {
    super();
    // bind the the context to the window of the object
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // Method to receive the submit event from the form when the add button is clicked
  handleSubmit(e) {
    // Prevent the form from being submitted because we will handle the event ourselves
    e.preventDefault();
    // form handle to get the values of the text input fields
    const form = document.forms.issueAdd;
    const issue = {
      owner: form.owner.value,
      title: form.title.value,
      // set due date to 10 days from current date
      due: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 10),
    };
    // Call create issue() using the values in the owner and title fields
    const { createIssue } = this.props;
    createIssue(issue);
    // Keep the form ready for the next set of inputs
    form.owner.value = ''; form.title.value = '';
  }

  render() {
    return (
      // Event handling, click a button with two input text
      <Form inline name="issueAdd" onSubmit={this.handleSubmit}>
        <FormGroup>
          <ControlLabel>Owner:</ControlLabel>
          {' '}
          <FormControl type="text" name="owner" />
        </FormGroup>
        {' '}
        <FormGroup>
          <ControlLabel>Title:</ControlLabel>
          {' '}
          <FormControl type="text" name="title" />
        </FormGroup>
        {' '}
        <Button bsStyle="primary" type="submit">Add</Button>
      </Form>
    );
  }
}

IssueAdd.propTypes = {
  createIssue: PropTypes.func.isRequired,
};
