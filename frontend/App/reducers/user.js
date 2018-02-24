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
        case USER_FETCH:
            return { ...initialState, isFetching: true }
        case USER_FETCH_SUCCESS:
            return { ...initialState, ...action.json, isFetching: false }
        case USER_FETCH_ERROR:
        case USER_LOGOUT:
        case USER_LOGOUT_SUCCESS:
        case USER_LOGOUT_ERROR:
            return { ...initialState }
        default:
            return state
    }
}

// actions
const USER_FETCH = 'USER_FETCH'
const USER_FETCH_SUCCESS = 'USER_FETCH_SUCCESS'
const USER_FETCH_ERROR = 'USER_FETCH_ERROR'
const USER_LOGOUT = 'USER_LOGOUT'
const USER_LOGOUT_SUCCESS = 'USER_LOGOUT_SUCCESS'
const USER_LOGOUT_ERROR = 'USER_LOGOUT_ERROR'

// action creators
export function fetchUser() {
    return dispatch => {
        dispatch({ type: USER_FETCH })
        return execute_fetch({
            url: '/current_user/', method: 'post', body: { option: 'info' },
            on2XX: json => dispatch({ type: USER_FETCH_SUCCESS, json: json }),
            onNot2XX: json => dispatch({ type: USER_FETCH_ERROR, json: json }),
            onErr: err => dispatch({ type: USER_FETCH_ERROR })
        })
    }
}

export function logoutUser() {
    return dispatch => {
        dispatch({ type: USER_LOGOUT })
        return execute_fetch({
            url: '/current_user/', method: 'post', body: { option: 'logout' },
            on2XX: json => dispatch({ type: USER_LOGOUT_SUCCESS, json: json }),
            onNot2XX: json => dispatch({ type: USER_LOGOUT_ERROR, json: json }),
            onErr: err => dispatch({ type: USER_LOGOUT_ERROR })
        })
    }
}
