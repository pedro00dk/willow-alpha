import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { createStore, compose, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'

import AppContainer from './App/containers/AppContainer'

import * as reducers from './App/reducers'


let finalCreateStore = compose(applyMiddleware(thunk), window.devToolsExtension ? window.devToolsExtension() : f => f)
    (createStore)
let store = finalCreateStore(combineReducers(reducers))


class App extends React.Component {

    render() {
        return <Provider store={store}>
            <AppContainer />
        </Provider>
    }
}

render(<App />, document.getElementById('App'))
