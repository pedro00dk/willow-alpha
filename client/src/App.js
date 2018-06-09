import React from 'react'
import { Provider } from 'react-redux'
import { createStore, compose, applyMiddleware, combineReducers } from 'redux'
import thunk from 'redux-thunk'
import AppContainer from './App/containers/AppContainer'
import * as reducers from './App/reducers'


const reduxMiddleware = compose(applyMiddleware(thunk), window.devToolsExtension ? window.devToolsExtension() : f => f)
const storeCreator = reduxMiddleware(createStore)
const store = storeCreator(combineReducers(reducers))

export default class App extends React.Component {

    render() {
        return <Provider store={store}>
            <div style={{ width: '100vw', height: '100vh' }}>
                <AppContainer />
            </div>
        </Provider>
    }
}
