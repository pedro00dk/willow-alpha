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
        default:
            return state
    }
}

// actions
const FETCH_USER = 'FETCH_USER'
const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS'
const FETCH_USER_ERROR = 'FETCH_USER_ERROR'

// action creators
export function fetchUser() {
    return dispatch => {
        dispatch({ type: FETCH_USER })
        return fetch(
            '/current_user/',
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        ).then(
            res => res.json().then(json => {
                console.log('im hereeee')
                if (json.detail !== undefined) {
                    console.log('im hereeee  2')
                    console.log(json)
                    dispatch({ type: FETCH_USER_ERROR, json: json })
                }
                else dispatch({ type: FETCH_USER_SUCCESS, json: json })
            }),
            err => dispatch({ type: FETCH_USER_ERROR, err: err }))
    }
}
