import { execute_fetch } from './util/util'

const initialState = {
    isFetching: false,
    exercises: [],
    selected: null
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
        case EXERCISE_SELECT:
            return { ...state, selected: action.selected }
        default:
            return state
    }
}

// actions
const EXERCISE_FETCH = 'EXERCISE_FETCH'
const EXERCISE_FETCH_SUCCESS = 'EXERCISE_FETCH_SUCCESS'
const EXERCISE_FETCH_ERROR = 'EXERCISE_FETCH_ERROR'
const EXERCISE_SELECT = 'EXERCISE_SELECT'

// action creators
export function fetchExercises() {
    return dispatch => {
        dispatch({ type: EXERCISE_FETCH })
        return execute_fetch({
            url: '/exercises/',
            on2XX: json => dispatch({ type: EXERCISE_FETCH_SUCCESS, json: json }),
            onNot2XX: json => dispatch({ type: EXERCISE_FETCH_ERROR, json: json }),
            onErr: err => dispatch({ type: EXERCISE_FETCH_ERROR })
        })
    }
}

export function selectExercise(exercise) {
    return { type: EXERCISE_SELECT, selected: exercise }
}
