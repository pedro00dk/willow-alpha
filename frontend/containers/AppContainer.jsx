import React from 'react'
import Radium from 'radium'

import Debugger from '../components/Debugger'
import Editor from '../components/Editor'
import Header from '../components/Header'


@Radium
export default class AppContainer extends React.Component {

    render() {
        return (
            <div>
                <Header />
                <Debugger />
                <Editor />


            </div>
        )
    }
}