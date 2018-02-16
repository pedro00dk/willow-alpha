const initialState = {
    input: [],
    inputText: '',
    readLines: 0
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case SET_INPUT:
            return { ...state, input: action.input, inputText: action.inputText }
        case SET_READ_LINES:
            return { ...state, readLines: action.readLines }
        default:
            return state
    }
}

// actions
const SET_INPUT = 'SET_INPUT'
const SET_READ_LINES = 'SET_READ_LINES'

// action creators
export function setInput(input, inputText) {
    return { type: SET_INPUT, input: input, inputText: inputText }
}

export function setReadLines(readLines) {
    return { type: SET_READ_LINES, readLines: readLines }
}
