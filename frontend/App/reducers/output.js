const initialState = {
    output: ''
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case OUTPUT_SET:
            return { ...state, output: action.output }
        case OUTPUT_UPDATE:
            return { ...state, output: state.output + action.append }
        default:
            return state
    }
}

// actions
const OUTPUT_SET = 'OUTPUT_SET'
const OUTPUT_UPDATE = 'OUTPUT_UPDATE'

// action creators
export function setOutput(output) {
    return { type: OUTPUT_SET, output: output }
}

export function updateOutput(append) {
    return { type: OUTPUT_UPDATE, append: append }
}
