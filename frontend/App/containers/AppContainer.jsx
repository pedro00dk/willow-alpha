import React from 'react'

import DebugBar from '../components/DebugBar'
import Header from '../components/Header'
import InputEditor from '../components/InputEditor'
import OutputEditor from '../components/OutputEditor'
import ScriptEditor from '../components/ScriptEditor'


export default class AppContainer extends React.Component {

    render() {
        return <div>
            <Header />
            <DebugBar />
            <ScriptEditor />
            <InputEditor />
            <OutputEditor />
        </div>
    }
}