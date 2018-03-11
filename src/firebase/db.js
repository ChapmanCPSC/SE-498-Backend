import { db } from './firebase';

// User API

export const doCreateUser = (id, email) =>
  db.ref(`users/${id}`).set({
    email,
  });

export const onceGetUsers = () =>
  db.ref('users').once('value');

export function getQuestionReference() {
    return db.ref('question')
}
export function getQuestionWithID(ID) {
    return db.ref('question/' + ID)
}

export function getQuestionAnswersWithID(ID) {
    return db.ref('choices/' + ID)
}

export function getQuestionNamesWithID(ID) {
    return db.ref('question-name/' + ID)
}

export function getAllQuestionNames() {
    return db.ref('question-name')
}

export function getTagReference() {
    return db.ref('tag')
}
export function getSpecificTagReference(tagID) {
    return db.ref('tag/' + tagID)
}

// Other db APIs ...
