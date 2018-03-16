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
        case EXERCISE_PUBLIC_DATA_FETCH:
            return { ...state, isFetching: true, selected: null }
        case EXERCISE_PUBLIC_DATA_CLOSE:
            return { ...state, isFetching: false, selected: null }
        case EXERCISE_PUBLIC_DATA_FETCH_SUCCESS:
            return { ...state, isFetching: false, selected: action.json }
        case EXERCISE_PUBLIC_DATA_FETCH_ERROR:
            return { ...state, isFetching: false, selected: null }
        default:
            return state
    }
}

// actions
const EXERCISE_FETCH = 'EXERCISE_FETCH'
const EXERCISE_FETCH_SUCCESS = 'EXERCISE_FETCH_SUCCESS'
const EXERCISE_FETCH_ERROR = 'EXERCISE_FETCH_ERROR'
const EXERCISE_PUBLIC_DATA_FETCH = 'EXERCISE_PUBLIC_DATA_FETCH'
const EXERCISE_PUBLIC_DATA_CLOSE = 'EXERCISE_PUBLIC_DATA_CLOSE'
const EXERCISE_PUBLIC_DATA_FETCH_SUCCESS = 'EXERCISE_PUBLIC_DATA_FETCH_SUCCESS'
const EXERCISE_PUBLIC_DATA_FETCH_ERROR = 'EXERCISE_PUBLIC_DATA_FETCH_ERROR'

// action creators
export function fetchExercises() {
    return dispatch => {
        dispatch({ type: EXERCISE_FETCH })
        return execute_fetch({
            url: '/exercises_id_name/',
            on2XX: json => dispatch({ type: EXERCISE_FETCH_SUCCESS, json: json }),
            onNot2XX: json => dispatch({ type: EXERCISE_FETCH_ERROR, json: json }),
            onErr: err => dispatch({ type: EXERCISE_FETCH_ERROR })
        })
    }
}

export function selectExercise(exercise_id) {
    if (!exercise_id) return { type: EXERCISE_PUBLIC_DATA_CLOSE }
    return dispatch => {
        dispatch({ type: EXERCISE_PUBLIC_DATA_FETCH })
        return execute_fetch({
            url: '/exercises_public_data/' + exercise_id,
            on2XX: json => dispatch({ type: EXERCISE_PUBLIC_DATA_FETCH_SUCCESS, json: json }),
            onNot2XX: json => dispatch({ type: EXERCISE_PUBLIC_DATA_FETCH_ERROR, json: json }),
            onErr: err => dispatch({ type: EXERCISE_PUBLIC_DATA_FETCH_ERROR })
        })
    }
}
