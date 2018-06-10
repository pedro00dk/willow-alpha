import { session_fetch } from '../../util'

const initialState = {
    isFetching: false,
    exercises: []
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case EXERCISE_FETCH:
            return { ...initialState, isFetching: true }
        case EXERCISE_FETCH_SUCCESS:
            return { ...initialState, exercises: action.json }
        case EXERCISE_FETCH_ERROR:
            return { ...initialState, exercises: null }
        default:
            return state
    }
}

// actions
const EXERCISE_FETCH = 'EXERCISE_FETCH'
const EXERCISE_FETCH_SUCCESS = 'EXERCISE_FETCH_SUCCESS'
const EXERCISE_FETCH_ERROR = 'EXERCISE_FETCH_ERROR'


// action creators
export function fetchExercises() {
    return dispatch => {
        dispatch({ type: EXERCISE_FETCH })
        return session_fetch({
            url: 'exercise/',
            on2XX: json => dispatch({ type: EXERCISE_FETCH_SUCCESS, json: json }),
            onNot2XX: json => dispatch({ type: EXERCISE_FETCH_ERROR, json: json }),
            onErr: err => dispatch({ type: EXERCISE_FETCH_ERROR })
        })
    }
}
