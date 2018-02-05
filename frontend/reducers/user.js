import { execute_fetch } from './util/util'

const initialState = {
    isFetching: false,
    id: null,
    username: null,
    email: null
}

// reducer
export default function reduce(state = initialState, action = {}) {
    switch (action.type) {
        case FETCH_USER:
            return { ...state, isFetching: true }
        case FETCH_USER_SUCCESS:
            return {
                ...state,
                isFetching: false,
                id: action.json.id,
                username: action.json.username,
                email: action.json.email
            }
        case LOGOUT_USER:
            return { ...state, isFetching: true }
        case FETCH_USER_ERROR:
        case LOGOUT_USER_SUCCESS:
        case LOGOUT_USER_ERROR:
            return { ...state, isFetching: false, id: null, username: null, email: null }
        default:
            return state
    }
}

// actions
const FETCH_USER = 'FETCH_USER'
const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS'
const FETCH_USER_ERROR = 'FETCH_USER_ERROR'
const LOGOUT_USER = 'LOGOUT_USER'
const LOGOUT_USER_SUCCESS = 'LOGOUT_USER_SUCCESS'
const LOGOUT_USER_ERROR = 'LOGOUT_USER_ERROR'

// action creators
export function fetchUser() {
    return dispatch => {
        dispatch({ type: FETCH_USER })
        return execute_fetch('/user/', true, 'post', { option: 'info' },
            res => {
                if (res.status === 200)
                    res.json().then(json => dispatch({ type: FETCH_USER_SUCCESS, json: json }))
                else dispatch({ type: FETCH_USER_ERROR })
            },
            err => dispatch({ type: FETCH_USER_ERROR })
        )
    }
}

export function logoutUser() {
    return dispatch => {
        dispatch({ type: LOGOUT_USER })
        return execute_fetch('/user/', true, 'post', { option: 'logout' },
            res => {
                if (res.status === 200)
                    res.json().then(json => dispatch({ type: LOGOUT_USER_SUCCESS, json: json }))
                else dispatch({ type: LOGOUT_USER_ERROR })
            },
            err => dispatch({ type: LOGOUT_USER_ERROR })
        )
    }
}
