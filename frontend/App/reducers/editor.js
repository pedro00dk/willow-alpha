const initialState = {
    script: '',
    input: [],
    inputReadLines: 0
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case UPDATE_SCRIPT:
            return { ...state, script: action.script }
        case UPDATE_INPUT:
            return { ...state, input: action.input }
        case READ_INPUT_LINE:
            return { ...state, inputReadLines: inputReadLines + 1 }
        default:
            return state
    }
}

// actions
const UPDATE_SCRIPT = 'UPDATE_SCRIPT'
const UPDATE_INPUT = 'UPDATE_INPUT'
const READ_INPUT_LINE = 'READ_INPUT_LINE'

// action creators
export function updateScript(script) {
    return { type: UPDATE_SCRIPT, script: script }
}

export function updateInput(input) {
    return { type: UPDATE_INPUT, input: input }
}

export function readInputLine() {
    return { type: READ_INPUT_LINE }
}
