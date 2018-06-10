import { apiAddress } from './config'

export function session_fetch({ url, method = 'get', body = null, on2XX = null, onNot2XX = null,
    on3XX = null, on4XX = null, on5XX = null, onAny = null, onRes = null, onErr = null }) {
    return fetch(
        apiAddress + url,
        {
            mode: 'cors',
            method: method,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: method.toLowerCase() !== 'get' ? JSON.stringify(body) : undefined
        }
    ).then(
        res => {
            if (onRes !== null) onRes(res)
            res.json().then(json => {
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