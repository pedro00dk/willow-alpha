import { execute_fetch } from './util/util'

const initialState = {
    isFetching: false,
    isDebugging: false,
    responses: []
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case DEBUG_START:
            return { ...initialState, isFetching: true, isDebugging: true }
        case DEBUG_START_SUCCESS:
            return {...state, isFetching: false, responses: [action.json.responses]}
        case DEBUG_START_FAIL:
            return {...initialState, responses: [action.json.responses]}
        case DEBUG_STOP:
            if (!state.isDebugging) return state
            return { ...initialState }
        case DEBUG_STOP_SUCCESS:
        case DEBUG_STOP_FAIL:
            return { ...initialState }
        case DEBUG_STEP_OVER:
        case DEBUG_STEP_INTO:
        case DEBUG_STEP_OUT:
            if (!state.isDebugging) return state
            return { ...state, isFetching: true }
        case DEBUG_STEP_SUCCESS:
            return { ...state, isFetching: false, responses: state.responses.slice().concat(action.json.responses) }
        case DEBUG_STEP_FAIL:
            return { ...initialState }
        case DEBUG_SEND_INPUT:
            if (!state.isDebugging) return state
            return { ...state, isFetching: true }
        case DEBUG_SEND_INPUT_SUCCESS:
            if (!state.isDebugging) return state
            return { ...state, isFetching: false }
        case DEBUG_SEND_INPUT_FAIL:
            return { ...initialState }
        default:
            return state
    }
}

// actions
const DEBUG_START = 'DEBUG_START'
const DEBUG_START_SUCCESS = 'DEBUG_START_SUCCESS'
const DEBUG_START_FAIL = 'DEBUG_START_FAIL'
const DEBUG_STOP = 'DEBUG_STOP'
const DEBUG_STOP_SUCCESS = 'DEBUG_STOP_SUCCESS'
const DEBUG_STOP_FAIL = 'DEBUG_STOP_FAIL'
const DEBUG_STEP_OVER = 'DEBUG_STEP_OVER'
const DEBUG_STEP_INTO = 'DEBUG_STEP_INTO'
const DEBUG_STEP_OUT = 'DEBUG_STEP_OUT'
const DEBUG_STEP_SUCCESS = 'DEBUG_STEP_SUCCESS'
const DEBUG_STEP_FAIL = 'DEBUG_STEP_FAIL'
const DEBUG_SEND_INPUT = 'DEBUG_SEND_INPUT'
const DEBUG_SEND_INPUT_SUCCESS = 'DEBUG_SEND_INPUT_SUCCESS'
const DEBUG_SEND_INPUT_FAIL = 'DEBUG_SEND_INPUT_FAIL'

// action creators
export function startDebug(script) {
    return dispatch => {
        dispatch({ type: DEBUG_START })
        return execute_fetch({
            url: '/tracer/', method: 'post', body: { option: 'start', script: script },
            on2XX: json => dispatch({ type: DEBUG_START_SUCCESS, action: 'start', json: json }),
            onNot2XX: json => dispatch({ type: DEBUG_START_FAIL, action: 'start', json: json }),
            onErr: err => dispatch({ type: DEBUG_START_FAIL, action: 'start' })
        })
    }
}

export function stopDebug() {
    return dispatch => {
        dispatch({ type: DEBUG_STOP })
        return execute_fetch({
            url: '/tracer/', method: 'post', body: { option: 'stop' },
            on2XX: json => dispatch({ type: DEBUG_STOP_SUCCESS, action: 'stop', json: json }),
            onNot2XX: json => dispatch({ type: DEBUG_STOP_FAIL, action: 'stop', json: json }),
            onErr: err => dispatch({ type: DEBUG_STOP_FAIL, action: 'stop' })
        })
    }
}

export function stepInto() {
    return step(DEBUG_STEP_INTO)
}

export function stepOver() {
    return step(DEBUG_STEP_OVER)
}

export function stepOut() {
    return step(DEBUG_STEP_OUT)
}

function step(type) {
    return dispatch => {
        dispatch({ type: type })
        let option = type == DEBUG_STEP_INTO ? 'step_into'
            : type == DEBUG_STEP_OVER ? 'step_over'
                : 'step_out'
        return execute_fetch({
            url: '/tracer/', method: 'post', body: { option: option },
            on2XX: json => dispatch({ type: DEBUG_STEP_SUCCESS, events: json.events, json: json }),
            onNot2XX: json => dispatch({ type: DEBUG_STEP_FAIL, json: json }),
            onErr: err => dispatch({ type: DEBUG_STEP_FAIL })
        })
    }
}

export function sendInput(input) {
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
