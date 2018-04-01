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
        return <div className='container-fluid p-0'>
            <Header style={{ height: '3em' }} />
            <div className='row mx-0' style={{ height: '3em' }}>
                <div className='col-12'>
                    <DebugBar />
                </div>
            </div>
            <div className='row mx-0' style={{ height: '24em' }}>
                <div className='col-5'>
                    <div className='w-100 h-100 border'>
                        <ScriptEditor />
                    </div>
                </div>
                <div className='col-7'>
                    <div className='w-100 h-100 border'>
                        <Inspector />
                    </div>
                </div>
            </div>
            <div className='row mx-0' style={{ height: '10em' }}>
                <div className='col-5'>
                    <span className='ml-3 h6 text-dark'>Input</span>
                    <div className='w-100 h-100 border'>
                        <InputEditor />
                    </div>
                </div>
                <div className='col-7'>
                    <span className='ml-3 h6 text-dark'>Output</span>
                    <div className='w-100 h-100 border'>
                        <OutputEditor />
                    </div>
                </div>
            </div>
        </div >

        let { exercise } = this.props

        let contentEditorStyle = { width: '100%', height: '30em' }
        let tabs = [
            <a className='nav-item nav-link bg-light active' id='nav-script-tab' data-toggle='tab' href='#nav-script'
                role='tab' aria-controls='nav-script' aria-selected='true'>Script</a>
        ]
        let contents = [
            <div className='tab-pane fade show active' id='nav-script' role='tabpanel' aria-labelledby='nav-script-tab'>
                <ScriptEditor editor={{ style: contentEditorStyle }} />
            </div>
        ]
        if (exercise.selected) {
            let selectedExercise = exercise.exercises[exercise.selected]
            tabs.push(
                <a className='nav-item nav-link bg-light' id='nav-readme-tab' data-toggle='tab' href='#nav-readme' role='tab'
                    aria-controls='nav-readme' aria-selected='false'>README</a>,
                <a className='nav-item nav-link bg-light' id='nav-input-tab' data-toggle='tab' href='#nav-input' role='tab'
                    aria-controls='nav-input' aria-selected='false'>Input</a>
            )
            contents.push(
                <div className='tab-pane' id='nav-readme' role='tabpanel' aria-labelledby='nav-readme-tab'>
                    <TextEditor
                        editor={{
                            value: exercise.selected.readme,
                            style: contentEditorStyle
                        }}
                    />
                </div>,
                <div className='tab-pane fade' id='nav-input' role='tabpanel' aria-labelledby='nav-input-tab'>
                    <TextEditor
                        editor={{
                            value: exercise.selected.input_ex,
                            style: contentEditorStyle
                        }}
                    />
                </div>
            )
        }

        return <div className='container-fluid p-0'>
            <Header />
            <div className='row m-0'>
                <DebugBar style={{ height: '3em' }} />
            </div>
            <SplitPane split={'horizontal'}
                minSize={250} maxSize={-250} defaultSize={window.innerHeight * (3 / 4)}
                resizerClassName={'bg-secondary p-1'}
            >
                {this.renderScriptEditorInspector()}
                {this.renderInputOutputEditors()}
            </SplitPane>
        </div>
    }

    setScriptEditorIspectorSize(size) {
        this.setState({ scriptEditorSize: { width: size + 'px', height: window.innerHeight + 'px' } })

    }

    renderScriptEditorInspector() {
        return <SplitPane
            minSize={250} maxSize={-250} defaultSize={window.innerWidth * (5 / 12)}
            resizerClassName={'bg-secondary p-1'}
            onChange={size => this.setScriptEditorIspectorSize(size)}
        >
            <ScriptEditor editor={{ ...this.state.scriptEditorSize }} />
            <div></div>
        </SplitPane>
        //<Inspector editor={{ ...this.state.outputEditorSize }} />
    }

    setInputOutputSize(size) {
        this.setState({ inputEditorSize: { width: '100%', height: '100%' } })
        //this.setState({ outputEditorSize: { width: (window.innerWidth - size) + 'px', height: window.innerHeight + 'px' } })
    }

    renderInputOutputEditors() {
        return <SplitPane
            minSize={250} maxSize={-250} defaultSize={window.innerWidth / 2}
            resizerClassName={'bg-secondary p-1'}
            onChange={size => this.forceUpdate()}
        >

        </SplitPane>
    }
}
