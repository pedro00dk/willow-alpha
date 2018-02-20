import React from 'react'
import { connect } from 'react-redux'

import playBtn from './debugBar/playBtn.png'
import stepOverBtn from './debugBar/stepOverBtn.png'
import stepIntoBtn from './debugBar/stepIntoBtn.png'
import stepOutBtn from './debugBar/stepOutBtn.png'
import restartBtn from './debugBar/restartBtn.png'
import stopBtn from './debugBar/stopBtn.png'

import { debugStart, debugStop, stepOver, stepInto, stepOut, send_input } from '../reducers/debug'
import { setReadLines } from '../reducers/input'
import { setScriptMarkers } from '../reducers/script'


@connect(state => ({
    debug: state.debug,
    user: state.user,
    exercise: state.exercise,
    script: state.script,
    input: state.input,
    output: state.output
}))
export default class DebugBar extends React.Component {

    constructor(props) {
        super(props)

        // binds
        this.play = this.play.bind(this)
        this.stepOver = this.stepOver.bind(this)
        this.stepInto = this.stepInto.bind(this)
        this.stepOut = this.stepOut.bind(this)
        this.stop = this.stop.bind(this)
    }

    play() {
        let { dispatch, debug, script } = this.props

        if (!debug.isDebugging) dispatch(debugStart(script.script))
        else dispatch(debugStart(script.script)) // # continue
    }

    stepOver() {
        let { dispatch, debug, script, input } = this.props

        // check if input needed
        if (debug.events.length !== 0 && debug.events[debug.events.length - 1][0] === 'input'
            && input.input.length > input.readLines) {
            dispatch(send_input(input.input[input.readLines]))
            dispatch(setReadLines(input.readLines + 1))
        }
        dispatch(stepOver())
    }

    stepInto() {
        let { dispatch, debug } = this.props

        // check if input needed
        if (debug.events.length !== 0 && debug.events[debug.events.length - 1][0] === 'input'
            && input.input.length > input.readLines) {
            dispatch(input(input.input[input.readLines]))
            dispatch(setReadLines(input.readLines + 1))
        }
        dispatch(stepInto())
    }

    stepOut() {
        let { dispatch, debug } = this.props

        // check if input needed
        if (debug.events.length !== 0 && debug.events[debug.events.length - 1][0] === 'input'
            && input.input.length > input.readLines) {
            dispatch(input(input.input[input.readLines]))
            dispatch(setReadLines(input.readLines + 1))
        }
        dispatch(stepOut())
    }

    stop() {
        let { dispatch, debug } = this.props

        dispatch(setReadLines(0))
        dispatch(debugStop(script.script))
    }

    render() {
        let { debug } = this.props

        let button = { width: '40px', height: '40px', cursor: 'pointer' }
        let disabledButton = { ...button, filter: 'grayscale(100%)' }
        return (
            <div className='row'>
                <div className='col'>
                    <img src={playBtn}
                        style={debug.isFetching ? disabledButton : button}
                        disabled={debug.isFetching}
                        onClick={this.play}
                    />
                    <img src={stepOverBtn}
                        style={debug.isFetching || !debug.isDebugging ? disabledButton : button}
                        disabled={debug.isFetching || !debug.isDebugging}
                        onClick={this.stepOver}
                    />
                    <img src={stepIntoBtn}
                        style={debug.isFetching || !debug.isDebugging ? disabledButton : button}
                        disabled={debug.isFetching || !debug.isDebugging}
                        onClick={this.stepInto}
                    />
                    <img src={stepOutBtn}
                        style={debug.isFetching || !debug.isDebugging ? disabledButton : button}
                        disabled={debug.isFetching || !debug.isDebugging}
                        onClick={this.stepOut}
                    />
                    <img src={restartBtn}
                        style={debug.isFetching || !debug.isDebugging ? disabledButton : button}
                        disabled={debug.isFetching || !debug.isDebugging}
                        onClick={this.start}
                    />
                    <img src={stopBtn}
                        style={debug.isFetching || !debug.isDebugging ? disabledButton : button}
                        disabled={debug.isFetching || !debug.isDebugging}
                        onClick={this.stop}
                    />
                    {debug.json !== null && debug.json.detail !== undefined ? debug.json.detail : null}
                </div>
            </div>
        )
    }
}
