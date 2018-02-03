import Cookies from 'js-cookie'

const initialState = {
    isFetching: false,
    exercises: []
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case FETCH_EXERCISES:
            return { isFetching: true, exercises: [] }
        case FETCH_EXERCISES_SUCCESS:
            return { isFetching: false, exercises: action.json }
        case FETCH_EXERCISES_ERROR:
            return { isFetching: false, exercises: [], err: action.err }
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
        return fetch(
            '/exercises/',
            {
                headers: {
                    'X-CSRFToken': Cookies.get('csrftoken'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
            }
        ).then(
            res => res.json().then(json => dispatch({ type: FETCH_EXERCISES_SUCCESS, json: json })),
            err => dispatch({ type: FETCH_EXERCISES_ERROR, err: err }))
    }
}
