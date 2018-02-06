import Cookies from 'js-cookie'

export function execute_fetch({url, crd = true, method = 'get', body = null, log = true,
    on2XX = null, onNot2XX = null, on3XX = null, on4XX = null, on5XX = null, onAny = null,
    onRes = null, onErr = null}) {
    let request_init = {
        method: method,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
    }
    if (crd) {
        request_init.credentials = 'same-origin'
        request_init.headers['X-CSRFToken'] = Cookies.get('csrftoken')
    }
    if (body !== null) request_init.body = JSON.stringify(body)
    return fetch(url, request_init).then(
        res => {
            if (onRes !== null) onRes(res)
            res.json().then(json => {
                if (log) console.log(json)
                if (onAny !== null) onAny(json)
                if (on2XX !== null && res.status >= 200 && res.status <= 299) on2XX(json)
                else {
                    if (onNot2XX !== null) onNot2XX(json)
                    if (on3XX !== null && res.status >= 300 && res.status <= 399) on3XX(json)
                    else if (on4XX !== null && res.status >= 400 && res.status <= 499) on4XX(json)
                    else if (on5XX !== null && res.status >= 500 && res.status <= 599) on5XX(json)
                }

            })
        },
        err => onErr !== null ? onErr(err) : null
    )
}