import React from 'react'
import { connect } from 'react-redux'
import SplitPane from 'react-split-pane'

import Debugger from '../components/Debugger'
import Header from '../components/Header'
import InputEditor from '../components/InputEditor'
import Inspector from '../components/Inspector'
import OutputEditor from '../components/OutputEditor'
import ScriptEditor from '../components/ScriptEditor'


class AppContainer0 extends React.Component {

    render() {
        return <div>
            <Header style={{ height: '7.5vh' }} />
            <Debugger style={{ height: '7.5vh' }} />
            <SplitPane
                split={'vertical'}
                minSize={'5%'}
                maxSize={'95%'}
                defaultSize={'30%'}
                className={'border'}
                resizerClassName={'border'}
                style={{ height: '85vh' }}
            >
                <ScriptEditor />
                <SplitPane
                    split={'horizontal'}
                    minSize={'5%'}
                    maxSize={'95%'}
                    defaultSize={'80%'}
                    className={'border'}
                    resizerClassName={'border'}
                >
                    <Inspector />
                    <SplitPane
                        split={'vertical'}
                        minSize={'5%'}
                        maxSize={'95%'}
                        defaultSize={'50%'}
                        className={'border'}
                        resizerClassName={'border'}
                    >
                        <InputEditor />
                        <OutputEditor />
                    </SplitPane>
                </SplitPane>
            </SplitPane>
        </div>
    }
}
const AppContainer = connect(state => ({ exercise: state.exercise }))(AppContainer0)
export default AppContainer