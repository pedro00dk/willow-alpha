import Cookies from 'js-cookie'

export function execute_fetch(url, credentials = true, method = 'get', body = null,
    onResponse = null, onError = null) {
    let request_init = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }
    if (credentials) {
        request_init.credentials = 'same-origin'
        request_init.headers['X-CSRFToken'] = Cookies.get('csrftoken')
    }
    if (body !== null) request_init.body = JSON.stringify(body)
    return fetch(url, request_init).then(
        response => onResponse !== null ? onResponse(response) : {},
        error => onError !== null ? onError(error) : {}
    )
}