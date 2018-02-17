import { execute_fetch } from './util/util'

const initialState = {
    isFetching: false,
    isDebugging: false,
    events: [],
    eventIndex: null,
    json: null
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case DEBUG_START:
        console.log('start')
        return { ...initialState, isFetching: true, isDebugging: true }
        case DEBUG_STOP:
        return { ...initialState, isFetching: true }
        case DEBUG_ACTION_SUCCESS:
            console.log('start ok')
            if (action.action === 'start')
                return { ...state, isFetching: false, isDebugging: true, json: action.json }
            else return { ...initialState }
        case DEBUG_ACTION_FAIL:
            return { ...state, isFetching: false, isDebugging: false, json: action.json }

        case DEBUG_STEP_OVER:
        case DEBUG_STEP_INTO:
        case DEBUG_STEP_OUT:
            if (!state.isDebugging) return state
            return { ...state, isFetching: true, isDebugging: true }
        case DEBUG_STEP_SUCCESS:
            return { ...state, isFetching: false, events: state.events.slice().concat(action.events), json: action.json }
        case DEBUG_STEP_FAIL:
            return { ...initialState, json: action.json }

        case DEBUG_SEND_INPUT:
            if (!state.isDebugging) return state
            return { ...state, isFetching: true }
        case DEBUG_SEND_INPUT_SUCCESS:
            if (!state.isDebugging) return state
            return { ...state, isFetching: false, json: action.json }
        case DEBUG_SEND_INPUT_FAIL:
            return { ...initialState, json: action.json }

        default:
            return state
    }
}

// actions
const DEBUG_START = 'DEBUG_START'
const DEBUG_STOP = 'DEBUG_STOP'
const DEBUG_ACTION_SUCCESS = 'DEBUG_ACTION_SUCCESS'
const DEBUG_ACTION_FAIL = 'DEBUG_ACTION_FAIL'

const DEBUG_STEP_OVER = 'DEBUG_STEP_OVER'
const DEBUG_STEP_INTO = 'DEBUG_STEP_INTO'
const DEBUG_STEP_OUT = 'DEBUG_STEP_OUT'
const DEBUG_STEP_SUCCESS = 'DEBUG_STEP_SUCCESS'
const DEBUG_STEP_FAIL = 'DEBUG_STEP_FAIL'

const DEBUG_SEND_INPUT = 'DEBUG_SEND_INPUT'
const DEBUG_SEND_INPUT_SUCCESS = 'DEBUG_SEND_INPUT_SUCCESS'
const DEBUG_SEND_INPUT_FAIL = 'DEBUG_SEND_INPUT_FAIL'

// action creators
export function debugStart(script) {
    return dispatch => {
        dispatch({ type: DEBUG_START })
        return execute_fetch({
            url: '/tracer/', method: 'post', body: { option: 'start', script: script },
            on2XX: json => dispatch({ type: DEBUG_ACTION_SUCCESS, action: 'start', json: json }),
            onNot2XX: json => dispatch({ type: DEBUG_ACTION_FAIL, action: 'start', json: json }),
            onErr: err => dispatch({ type: DEBUG_ACTION_FAIL, action: 'start' })
        })
    }
}

export function debugStop() {
    return dispatch => {
        dispatch({ type: DEBUG_STOP })
        return execute_fetch({
            url: '/tracer/', method: 'post', body: { option: 'stop' },
            on2XX: json => dispatch({ type: DEBUG_ACTION_SUCCESS, action: 'stop', json: json }),
            onNot2XX: json => dispatch({ type: DEBUG_ACTION_FAIL, action: 'stop', json: json }),
            onErr: err => dispatch({ type: DEBUG_ACTION_FAIL, action: 'stop' })
        })
    }
}

export function stepOver() {
    return step(DEBUG_STEP_OVER)
}

export function stepInto() {
    return step(DEBUG_STEP_INTO)
}

export function stepOut() {
    return step(DEBUG_STEP_OUT)
}

function step(type) {
    return dispatch => {
        dispatch({ type: type })
        let option = type == DEBUG_STEP_OVER
            ? 'step_over'
            : type == DEBUG_STEP_INTO
                ? 'step_into'
                : 'step_out'
        return execute_fetch({
            url: '/tracer/', method: 'post', body: { option: option },
            on2XX: json => dispatch({ type: DEBUG_STEP_SUCCESS, events: json.events, json: json }),
            onNot2XX: json => dispatch({ type: DEBUG_STEP_FAIL, json: json }),
            onErr: err => dispatch({ type: DEBUG_STEP_FAIL })
        })
    }
}

export function send_input(input) {
    return dispatch => {
        dispatch({ type: DEBUG_SEND_INPUT })
        return execute_fetch({
            url: '/tracer/', method: 'post', body: { option: 'input', input: input },
            on2XX: json => dispatch({ type: DEBUG_SEND_INPUT_SUCCESS, json: json }),
            onNot2XX: json => dispatch({ type: DEBUG_SEND_INPUT_FAIL, json: json }),
            onErr: err => dispatch({ type: DEBUG_SEND_INPUT_FAIL })
        })
    }
}
