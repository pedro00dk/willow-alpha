const initialState = {
    objectsContext: { objects: {}, references: {} }
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case INSPECTOR_SET_OBJECTS_CONTEXT:
            return { ...state, objectsContext: action.objectsContext }
        default:
            return state
    }
}

// actions
const INSPECTOR_SET_OBJECTS_CONTEXT = 'INSPECTOR_SET_OBJECTS_CONTEXT'

// action creators
export function setObjectsContext(objectsContext) {
    return { type: INSPECTOR_SET_OBJECTS_CONTEXT, objectsContext: objectsContext }
}
