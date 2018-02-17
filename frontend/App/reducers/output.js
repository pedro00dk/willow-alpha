const initialState = {
    output: ''
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case SET_OUTPUT:
            return { ...state, output: action.output }
        case SET_OUTPUT:
            return { ...state, output: state.output + action.append }
        default:
            return state
    }
}

// actions
const SET_OUTPUT = 'SET_OUTPUT'
const UPDATE_OUTPUT = 'UPDATE_OUTPUT'

// action creators
export function setOutput(output) {
    return { type: SET_OUTPUT, output: output }
}

export function updateOutput(append) {
    return { type: UPDATE_OUTPUT, append: append }
}
