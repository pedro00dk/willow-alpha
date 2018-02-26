import React from 'react'
import { connect } from 'react-redux'

import DebugBar from '../components/DebugBar'
import Header from '../components/Header'
import InputEditor from '../components/InputEditor'
import Inspector from '../components/Inspector'
import OutputEditor from '../components/OutputEditor'
import ScriptEditor from '../components/ScriptEditor'
import TextEditor from '../components/stateless/TextEditor'


@connect(state => ({ exercise: state.exercise, theme: state.theme }))
export default class AppContainer extends React.Component {

    render() {
        let { exercise, theme } = this.props

        let tabs = [
            <a className={'nav-item nav-link active bg-' + theme.theme} id='nav-script-tab' data-toggle='tab'
                href='#nav-script' role='tab' aria-controls='nav-script' aria-selected='true'>Script</a>
        ]
        let contents = [
            <div className='tab-pane fade show active' id='nav-script' role='tabpanel' aria-labelledby='nav-script-tab'>
                <ScriptEditor style={{ width: '100%', height: '68.5vh' }} />
            </div>
        ]
        if (exercise.selected !== null) {
            let selectedExercise = exercise.exercises[exercise.selected]
            tabs.push(
                <a className={'nav-item nav-link bg-' + theme.theme} id='nav-readme-tab' data-toggle='tab'
                    href='#nav-readme' role='tab' aria-controls='nav-readme' aria-selected='false'>README</a>,
                <a className={'nav-item nav-link gb-' + theme.theme} id='nav-input-tab' data-toggle='tab'
                    href='#nav-input' role='tab' aria-controls='nav-input' aria-selected='false'>Input</a>
            )
            contents.push(
                <div className='tab-pane fade' id='nav-readme' role='tabpanel' aria-labelledby='nav-readme-tab'>
                    <TextEditor style={{ width: '100%', height: '68.5vh' }} value={exercise.selected.readme}
                        theme={theme.theme === 'light' ? 'chrome' : 'monokai'} />
                </div>,
                <div className='tab-pane fade' id='nav-input' role='tabpanel' aria-labelledby='nav-input-tab'>
                    <TextEditor style={{ width: '100%', height: '68.5vh' }} value={exercise.selected.input_ex}
                        theme={theme.theme === 'light' ? 'chrome' : 'monokai'} />
                </div>
            )
        }

        return <div className='container-fluid p-0'>
            <Header style={{ height: '5vh' }} />
            <div className='row m-0'>
                <DebugBar style={{ height: '5vh' }} />
            </div>
            <div className='row m-0'>
                <div className={'col-5 border border-' + theme.theme + ' p-0'} style={{ width: '100%', height: '74.45vh' }}>
                    <nav>
                        <div className={'nav nav-tabs bg-' + theme.theme} id='nav-tab' role='tablist'>
                            {tabs}
                        </div>
                    </nav>
                    <div className={'tab-content bg-' + theme.theme} id='nav-tabContent'>
                        {contents}
                    </div>

                </div>
                <div className={'col-7 border border-' + theme.theme + ' p-0'}>
                    <Inspector />
                </div>
            </div>
            <div className='row m-0'>
                <div className={'col-6 border border-' + theme.theme + ' p-0'}>
                    <InputEditor style={{ width: '100%', height: '15vh' }} />
                </div>
                <div className={'col-6 border border-' + theme.theme + ' p-0'}>
                    <OutputEditor style={{ width: '100%', height: '15vh' }} />
                </div>
            </div>
        </div>
    }
}