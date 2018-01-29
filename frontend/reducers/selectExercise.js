const initialState = {
    selectedExercise: null
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case SELECT_EXERCISE:
            return { selectedExercise: action.selectedExercise }
        default:
            return state
    }
}

// actions
const SELECT_EXERCISE = 'SELECT_EXERCISE'

// action creators
export function selectExercise(exercise) {
    return { type: SELECT_EXERCISE, selectedExercise: exercise }
}