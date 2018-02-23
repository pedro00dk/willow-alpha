const initialState = {
    script: '',
    editable: true,
    markers: []
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case SET_SCRIPT:
            return { ...state, script: state.editable ? action.script : state.script }
        case SET_SCRIPT_EDITABLE:
            return { ...state, editable: action.editable }
        case SET_SCRIPT_MARKERS:
            return { ...state, markers: action.markers }
        default:
            return state
    }
}

// actions
const SET_SCRIPT = 'SET_SCRIPT'
const SET_SCRIPT_EDITABLE = 'SET_SCRIPT_EDITABLE'
const SET_SCRIPT_MARKERS = 'SET_SCRIPT_MARKERS'

// action creators
export function setScript(script) {
    return { type: SET_SCRIPT, script: script }
}

export function setEditable(editable) {
    return { type: SET_SCRIPT_EDITABLE, editable: editable }
}

export function setMarkers(markers) {
    return { type: SET_SCRIPT_MARKERS, markers: markers }
}
