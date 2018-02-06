import { execute_fetch } from './util/util'

const initialState = {
    isFetching: false,
    exercises: []
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case FETCH_EXERCISES:
            return { ...state, isFetching: true, exercises: [] }
        case FETCH_EXERCISES_SUCCESS:
            return { ...state, isFetching: false, exercises: action.json }
        case FETCH_EXERCISES_ERROR:
            return { ...state, isFetching: false, exercises: null }
        default:
            return state
    }
}

// actions
const FETCH_EXERCISES = 'FETCH_EXERCISES'
const FETCH_EXERCISES_SUCCESS = 'FETCH_EXERCISES_SUCCESS'
const FETCH_EXERCISES_ERROR = 'FETCH_EXERCISES_ERROR'

// action creators
export function fetchExercises() {
    return dispatch => {
        dispatch({ type: FETCH_EXERCISES })
        return execute_fetch({
            url: '/exercises/',
            on2XX: json => dispatch({ type: FETCH_EXERCISES_SUCCESS, json: json }),
            onNot2XX: json => dispatch({ type: FETCH_EXERCISES_ERROR, json: json }),
            onErr: err => dispatch({ type: FETCH_EXERCISES_ERROR })
        })
    }
}
