import { execute_fetch } from './util/util'

const initialState = {
    isFetching: false,
    isDebugging: false,
    events: [],
    inputs: {},
    eventIndex: 0
}

// reducer
export default function reduce(state = initialState, action = {}) {
    console.log('state:')
    console.log(state)
    console.log('action:')
    console.log(action)
    switch (action.type) {
        case START_DEBUG:
            return { ...state, isFetching: true, isDebugging: true, events: [], eventIndex: 0 }
        case STOP_DEBUG:
            return { ...state, isFetching: true, isDebugging: false, events: [], eventIndex: 0 }
        case SEND_INPUT:
            return state
        case DEBUG_STEP_INTO:
        case DEBUG_STEP_OVER:
        case DEBUG_STEP_OUT:
            return { ...state, isFetching: true, isDebugging: true }
        case DEBUG_ACTION_SUCCESS:
            if (action.stop !== undefined && action.stop)
                return { ...state, isFetching: false, isDebugging: false }
            if (action.events !== undefined) {
                let events = JSON.parse(JSON.stringify(state.events)).concat(action.events)
                return {
                    ...state,
                    isFetching: false,
                    events: JSON.parse(JSON.stringify(state.events)).concat(action.events),
                    eventIndex: events.length - 1
                }
            }
            return {
                ...state,
                isFetching: false,
            }
            return state
        case DEBUG_ACTION_FAIL:
            return { ...state, isFetching: false, isDebugging: false }
        default:
            return state
    }
}

// actions
const START_DEBUG = 'START_DEBUG'
const STOP_DEBUG = 'STOP_DEBUG'
const SEND_INPUT = 'SEND_INPUT'
const DEBUG_STEP_INTO = 'DEBUG_STEP_INTO'
const DEBUG_STEP_OVER = 'DEBUG_STEP_OVER'
const DEBUG_STEP_OUT = 'DEBUG_STEP_OUT'
const DEBUG_ACTION_SUCCESS = 'DEBUG_ACTION_SUCCESS'
const DEBUG_ACTION_FAIL = 'DEBUG_ACTION_FAIL'

// action creators
export function startDebug(script) {
    return dispatch => {
        dispatch({ type: START_DEBUG })
        return execute_fetch('/tracer/', true, 'post', { option: 'start', script: script },
            res => {
                if (res.status === 200)
                    res.json().then(json => dispatch({ type: DEBUG_ACTION_SUCCESS }))
                else dispatch({ type: DEBUG_ACTION_FAIL })
            },
            err => dispatch({ type: DEBUG_ACTION_FAIL })
        )
    }
}

export function stopDebug() {
    return dispatch => {
        dispatch({ type: DEBUG_STEP_OUT })
        return execute_fetch('/tracer/', true, 'post', { option: 'stop' },
            res => {
                if (res.status === 200)
                    res.json().then(json => dispatch({ type: DEBUG_ACTION_SUCCESS, stop: true }))
                else dispatch({ type: DEBUG_ACTION_FAIL })
            },
            err => dispatch({ type: DEBUG_ACTION_FAIL })
        )
    }
}

export function sendInput(input) {
    return dispatch => {
        dispatch({ type: DEBUG_STEP_OUT })
        return execute_fetch('/tracer/', true, 'post', { option: 'input', input: input },
            res => {
                if (res.status === 200)
                    res.json().then(json => dispatch({ type: DEBUG_ACTION_SUCCESS }))
                else dispatch({ type: DEBUG_ACTION_FAIL })
            },
            err => dispatch({ type: DEBUG_ACTION_FAIL })
        )
    }
}

export function stepInto() {
    return dispatch => {
        dispatch({ type: DEBUG_STEP_INTO })
        return execute_fetch('/tracer/', true, 'post', { option: 'stepinto' },
            res => {
                if (res.status === 200)
                    res.json().then(json => dispatch({ type: DEBUG_ACTION_SUCCESS, events: json.events }))
                else dispatch({ type: DEBUG_ACTION_FAIL })
            },
            err => dispatch({ type: DEBUG_ACTION_FAIL })
        )
    }
}

export function stepOver() {
    return dispatch => {
        dispatch({ type: DEBUG_STEP_OVER })
        return execute_fetch('/tracer/', true, 'post', { option: 'stepover' },
            res => {
                if (res.status === 200)
                    res.json().then(json => dispatch({ type: DEBUG_ACTION_SUCCESS, events: json.events }))
                else dispatch({ type: DEBUG_ACTION_FAIL })
            },
            err => dispatch({ type: DEBUG_ACTION_FAIL })
        )
    }
}

export function stepOut() {
    return dispatch => {
        dispatch({ type: DEBUG_STEP_OUT })
        return execute_fetch('/tracer/', true, 'post', { option: 'stepout' },
            res => {
                if (res.status === 200)
                    res.json().then(json => dispatch({ type: DEBUG_ACTION_SUCCESS, events: json.events }))
                else dispatch({ type: DEBUG_ACTION_FAIL })
            },
            err => dispatch({ type: DEBUG_ACTION_FAIL })
        )
    }
}
