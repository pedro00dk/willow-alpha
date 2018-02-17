import React from 'react'
import Radium from 'radium'
import { connect } from 'react-redux'

import DebugBar from '../components/DebugBar'
import Header from '../components/Header'
import TextEditor from '../components/stateless/TextEditor'
import InputEditor from '../components/InputEditor'
import ScriptEditor from '../components/ScriptEditor'


@Radium
@connect(state => ({
    exercise: state.exercise
}))
export default class AppContainer extends React.Component {

    render() {
        return (
            <div>
                <Header />
                <DebugBar/>
                <ScriptEditor />
                <InputEditor />
            </div>
        )
    }
}