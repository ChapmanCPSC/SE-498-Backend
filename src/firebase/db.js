import { db } from './firebase';

// User API

export const doCreateUser = (id, email) =>
  db.ref(`users/${id}`).set({
    email,
  });

export const onceGetUsers = () =>
  db.ref('users').once('value');

export function getFullDBReference() {
    return db.ref()
}

export function getQuestionReference() {
    return db.ref('question')
}

export function getQuizReference() {
    return db.ref('quiz')
}

export function getQuestionWithID(ID) {
    return db.ref('question/' + ID)
}
export function getQuestionPoints(ID) {
    return db.ref('question/' + ID + '/points')
}

export function getQuizWithID(ID) {
    return db.ref('quiz/' + ID)
}

export function getQuestionAnswersWithID(ID) {
    return db.ref('choices/' + ID)
}
export function getAnswers() {
    return db.ref('choices')
}

export function getQuestionNamesWithID(ID) {
    return db.ref('question-name/' + ID)
}

export function getAllQuestionNames() {
    return db.ref('question-name')
}

export function getAllQuizNames() {
    return db.ref('quiz-name')
}
export function getTagReference() {
    return db.ref('tag')
}
export function getSpecificTagReference(tagID) {
    return db.ref('tag/' + tagID)
}
export function getFacultyName(facID){
    return db.ref('faculty/' + facID + "/name")
}
export function getFacultyCourses(facID){
    return db.ref('faculty/' + facID + "/courses")
}
export function getGames() {
    return db.ref('game')
}
