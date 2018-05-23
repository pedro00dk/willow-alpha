const initialState = {
    heapObjectsReferences: null,
    heapVariableReferences: null,
    stackVariableReferences: null,
    objectDrag: 0
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case INSPECTOR_SET_CONTEXT:
            return {
                ...state,
                heapObjectsReferences: action.heapObjectsReferences,
                heapVariableReferences: action.heapVariableReferences,
                stackVariableReferences: action.stackVariableReferences
            }
        case INSPECTOR_OBJECT_DRAG:
            return { ...state, objectDrag: state.objectDrag + 1 }
        default:
            return state

    }
}

// actions
const INSPECTOR_SET_CONTEXT = 'INSPECTOR_SET_CONTEXT'
const INSPECTOR_OBJECT_DRAG = 'INSPECTOR_OBJECT_DRAG'

// action creators
export function setObjectContext(heapObjectsReferences, heapVariableReferences, stackVariableReferences) {
    return {
        type: INSPECTOR_SET_CONTEXT,
        heapObjectsReferences: heapObjectsReferences,
        heapVariableReferences: heapVariableReferences,
        stackVariableReferences: stackVariableReferences
    }
}

export function objectDrag() {
    return { type: INSPECTOR_OBJECT_DRAG }
}