import Cookies from 'js-cookie'

const initialState = {
    isFetching: false,
    isDebugging: false,
    storedEvents: []
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case START_DEBUG:
            return { ...state, isFetching: true, isDebugging: true, exercises: [] }
        case DEBUG_ACTION_SUCCESS:
            return { ...state, isFetching: false, isDebugging: true }
        case DEBUG_ACTION_FAIL:
            return { ...state, isFetching: false, isDebugging: false }
        default:
            return state
    }
}

// actions
const START_DEBUG = 'START_DEBUG'
const DEBUG_STEP_INTO = 'DEBUG_STEP_INTO'
const DEBUG_STEP_OVER = 'DEBUG_STEP_OVER'
const DEBUG_STEP_OUT = 'DEBUG_STEP_OUT'
const RESTART_DEBUG = 'RESTART_DEBUG'
const STOP_DEBUG = 'STOP_DEBUG'
const DEBUG_ACTION_SUCCESS = 'DEBUG_ACTION_SUCCESS'
const DEBUG_ACTION_FAIL = 'DEBUG_ACTION_FAIL'

// action creators
export function startDebug(script) {

    return dispatch => {
        dispatch({ type: START_DEBUG })
        return fetch(
            '/tracer/',
            {
                method: 'post',
                credentials: 'same-origin',
                headers: {
                    'X-CSRFToken': Cookies.get('csrftoken'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ script: script })
            }
        ).then(
            res => res.json().then(json => dispatch({ type: DEBUG_ACTION_SUCCESS })),
            err => dispatch({ type: DEBUG_ACTION_FAIL }))
    }
}

export function stepInto() {

}

export function stepOver() {

}

export function stepOut() {

}

export function restartDebug() {

}

export function stopDebug() {

}