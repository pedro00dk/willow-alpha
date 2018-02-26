const initialState = {
    theme: 'light'
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case THEME_SET:
            return { ...state, theme: action.theme }
        default:
            return state
    }
}

// actions
const THEME_SET = 'THEME_SET'

// action creators
export function setLightTheme(script) {
    return { type: THEME_SET, theme: 'light' }
}

export function setDarkTheme(editable) {
    return { type: THEME_SET, theme: 'dark' }
}
