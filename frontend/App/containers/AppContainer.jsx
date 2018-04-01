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
                    {/*<nav>
                        <div className='nav nav-tabs' id='nav-tab' role='tablist'>
                            {tabs}
                        </div>
                    </nav>
                    <div className='tab-content' id='nav-tabContent'>
                        {contents}
                    </div>
                    */}
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
        </div>
    }
}
