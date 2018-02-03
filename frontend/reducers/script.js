const initialState = {
    script: ''
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case UPDATE_SCRIPT:
            return { script: action.script }
        default:
            return state
    }
}

// actions
const UPDATE_SCRIPT = 'UPDATE_SCRIPT'

// action creators
export function updateScript(script) {
    return { type: UPDATE_SCRIPT, script: script }
}