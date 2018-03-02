const initialState = {
    script: '',
    editable: true,
    markers: [],
    error: false
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case SCRIPT_SET:
            return { ...state, script: state.editable ? action.script : state.script }
        case SCRIPT_EDITABLE:
            return { ...state, editable: action.editable }
        case SCRIPT_MARKERS:
            return { ...state, markers: action.markers, error: action.error }
        default:
            return state
    }
}

// actions
const SCRIPT_SET = 'SCRIPT_SET'
const SCRIPT_EDITABLE = 'SCRIPT_EDITABLE'
const SCRIPT_MARKERS = 'SCRIPT_MARKERS'

// action creators
export function setScript(script) {
    return { type: SCRIPT_SET, script: script }
}

export function setEditable(editable) {
    return { type: SCRIPT_EDITABLE, editable: editable }
}

export function setMarkers(markers, error = false) {
    return { type: SCRIPT_MARKERS, markers: markers, error: error }
}
