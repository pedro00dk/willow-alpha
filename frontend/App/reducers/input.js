const initialState = {
    input: [],
    inputText: '',
    readLines: 0
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case INPUT_SET:
            return { ...state, input: action.input, inputText: action.inputText }
        case INPUT_READ_LINES:
            return { ...state, readLines: action.readLines }
        default:
            return state
    }
}

// actions
const INPUT_SET = 'INPUT_SET'
const INPUT_READ_LINES = 'INPUT_READ_LINES'

// action creators
export function setInput(input, inputText) {
    return { type: INPUT_SET, input: input, inputText: inputText }
}

export function setReadLines(readLines) {
    return { type: INPUT_READ_LINES, readLines: readLines }
}
