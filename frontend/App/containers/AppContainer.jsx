import React from 'react'
import { connect } from 'react-redux'
import SplitPane from 'react-split-pane'

import DebugBar from '../components/DebugBar'
import Header from '../components/Header'
import InputEditor from '../components/InputEditor'
import Inspector from '../components/Inspector'
import OutputEditor from '../components/OutputEditor'
import ScriptEditor from '../components/ScriptEditor'
import TextEditor from '../components/TextEditor'


@connect(state => ({ exercise: state.exercise }))
export default class AppContainer extends React.Component {

    render() {
        let { exercise } = this.props

        let tabs = [
            <a className='nav-item nav-link bg-light active' id='nav-script-tab' data-toggle='tab' href='#nav-script'
                role='tab' aria-controls='nav-script' aria-selected='true'>
                Script
            </a>
        ]
        let contents = [
            <div className='border tab-pane fade show active' id='nav-script' role='tabpanel'
                aria-labelledby='nav-script-tab'>
                <ScriptEditor />
            </div>
        ]
        if (exercise.selected) {
            tabs.push(
                <a className='nav-item nav-link bg-light' id='nav-readme-tab' data-toggle='tab' href='#nav-readme' role='tab'
                    aria-controls='nav-readme' aria-selected='false'>
                    README
                </a>,
                <a className='nav-item nav-link bg-light' id='nav-input-tab' data-toggle='tab' href='#nav-input' role='tab'
                    aria-controls='nav-input' aria-selected='false'>
                    Input
                </a>
            )
            contents.push(
                <div className='border tab-pane' id='nav-readme' role='tabpanel'
                    aria-labelledby='nav-readme-tab'>
                    <TextEditor value={exercise.selected.readme} />
                </div>,
                <div className='border tab-pane fade' id='nav-input' role='tabpanel'
                    aria-labelledby='nav-input-tab'>
                    <TextEditor value={exercise.selected.input_ex} />
                </div>
            )
        }

        return <div>
            <Header style={{ height: '7.5vh' }} />
            <DebugBar style={{ height: '7.5vh' }} />
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
