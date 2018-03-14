import React from 'react'
import { connect } from 'react-redux'

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
            <div className='row m-0'>
                <div className='col-5 border border-light p-0'>
                    <nav>
                        <div className='nav nav-tabs bg-light' id='nav-tab' role='tablist'>
                            {tabs}
                        </div>
                    </nav>
                    <div className='tab-content bg-light' id='nav-tabContent'>
                        {contents}
                    </div>

                </div>
                <div className='col-7 border border-light p-0' style={{height: '30em'}}>
                    <Inspector />
                </div>
            </div>
            <div className='row m-0'>
                <div className='col-6 border border-light p-0'>
                    <InputEditor editor={{ style: { width: '100%', height: '15em' } }} />
                </div>
                <div className='col-6 border border-light p-0'>
                    <OutputEditor editor={{ style: { width: '100%', height: '15em' } }} />
                </div>
            </div>
        </div>
    }
}