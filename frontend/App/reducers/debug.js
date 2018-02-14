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
        return execute_fetch({
            url: '/tracer/', method: 'post', body: { option: 'start', script: script },
            on2XX: json => dispatch({ type: DEBUG_ACTION_SUCCESS, json: json }),
            onNot2XX: json => dispatch({ type: DEBUG_ACTION_FAIL, json: json }),
            onErr: err => dispatch({ type: DEBUG_ACTION_FAIL })
        })
    }
}

export function stopDebug() {
    return dispatch => {
        dispatch({ type: DEBUG_STEP_OUT })
        return execute_fetch({
            url: '/tracer/', method: 'post', body: { option: 'stop' },
            on2XX: json => dispatch({ type: DEBUG_ACTION_SUCCESS, json: json, stop: true }),
            onNot2XX: json => dispatch({ type: DEBUG_ACTION_FAIL, json: json }),
            onErr: err => dispatch({ type: DEBUG_ACTION_FAIL })
        })
    }
}

export function sendInput(input) {
    return dispatch => {
        dispatch({ type: DEBUG_STEP_OUT })
        return execute_fetch({
            url: '/tracer/', method: 'post', body: { option: 'input', input: input },
            on2XX: json => dispatch({ type: DEBUG_ACTION_SUCCESS, json: json }),
            onNot2XX: json => dispatch({ type: DEBUG_ACTION_FAIL, json: json }),
            onErr: err => dispatch({ type: DEBUG_ACTION_FAIL })
        })
    }
}

export function stepInto() {
    return dispatch => {
        dispatch({ type: DEBUG_STEP_INTO })
        return execute_fetch({
            url: '/tracer/', method: 'post', body: { option: 'stepinto' },
            on2XX: json => dispatch({ type: DEBUG_ACTION_SUCCESS, json: json, events: json.events }),
            onNot2XX: json => dispatch({ type: DEBUG_ACTION_FAIL, json: json }),
            onErr: err => dispatch({ type: DEBUG_ACTION_FAIL })
        })
    }
}

export function stepOver() {
    return dispatch => {
        dispatch({ type: DEBUG_STEP_INTO })
        return execute_fetch({
            url: '/tracer/', method: 'post', body: { option: 'stepover' },
            on2XX: json => dispatch({ type: DEBUG_ACTION_SUCCESS, json: json, events: json.events }),
            onNot2XX: json => dispatch({ type: DEBUG_ACTION_FAIL, json: json }),
            onErr: err => dispatch({ type: DEBUG_ACTION_FAIL })
        })
    }
}

export function stepOut() {
    return dispatch => {
        dispatch({ type: DEBUG_STEP_INTO })
        return execute_fetch({
            url: '/tracer/', method: 'post', body: { option: 'stepout' },
            on2XX: json => dispatch({ type: DEBUG_ACTION_SUCCESS, json: json, events: json.events }),
            onNot2XX: json => dispatch({ type: DEBUG_ACTION_FAIL, json: json }),
            onErr: err => dispatch({ type: DEBUG_ACTION_FAIL })
        })
    }
}
