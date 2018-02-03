import Cookies from 'js-cookie'

const initialState = {
    isFetching: false,
    isUserLogged: false,
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
                isUserLogged: true,
                id: action.json.id,
                username: action.json.username,
                email: action.json.email
            }
        case FETCH_USER_ERROR:
            return { ...state, isFetching: false, isUserLogged: false }
        case LOGOUT_USER:
        case LOGOUT_USER_SUCCESS:
        case LOGOUT_USER_ERROR:
            return { ...state, isFetching: false, isUserLogged: false }
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
        return fetch(
            '/user/',
            {
                method: 'post',
                credentials: 'same-origin',
                headers: {
                    'X-CSRFToken': Cookies.get('csrftoken'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ info: true })
            }
        ).then(
            res => {
                if (res.status === 200)
                    res.json().then(json => dispatch({ type: FETCH_USER_SUCCESS, json: json }))
                else dispatch({ type: FETCH_USER_ERROR })
            },
            err => dispatch({ type: FETCH_USER_ERROR }))
    }
}

export function logoutUser() {
    return dispatch => {
        dispatch({ type: LOGOUT_USER })
        return fetch(
            '/user/',
            {
                method: 'post',
                credentials: 'same-origin',
                headers: {
                    'X-CSRFToken': Cookies.get('csrftoken'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ logout: true })
            }
        ).then(
            res => {
                console.log(res.status)
                if (res.status === 200)
                    res.json().then(json => dispatch({ type: LOGOUT_USER_SUCCESS, json: json }))
                else dispatch({ type: LOGOUT_USER_ERROR })
            },
            err => dispatch({ type: LOGOUT_USER_ERROR }))
    }
}
