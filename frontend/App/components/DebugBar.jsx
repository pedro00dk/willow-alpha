import React from 'react'
import { connect } from 'react-redux'

import playBtn from './debugBar/playBtn.png'
import stepOverBtn from './debugBar/stepOverBtn.png'
import stepIntoBtn from './debugBar/stepIntoBtn.png'
import stepOutBtn from './debugBar/stepOutBtn.png'
import restartBtn from './debugBar/restartBtn.png'
import stopBtn from './debugBar/stopBtn.png'

import { startDebug, stopDebug, stepOver, stepInto, stepOut, sendInput } from '../reducers/debug'
import { setReadLines } from '../reducers/input'
import { setOutput, updateOutput } from '../reducers/output'
import { setEditable, setMarkers } from '../reducers/script'


@connect(state => ({
    debug: state.debug,
    exercise: state.exercise,
    input: state.input,
    output: state.output,
    script: state.script,
    user: state.user
}))
export default class DebugBar extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            processedResponses: 0,
            savedException: null
        }

        // binds
        this.resetState = this.resetState.bind(this)
        this.play = this.play.bind(this)
        this.stop = this.stop.bind(this)
        this.stepInto = this.stepInto.bind(this)
        this.stepOver = this.stepOver.bind(this)
        this.stepOut = this.stepOut.bind(this)
    }

    resetState() {
        this.state = {
            processedResponses: 0,
            savedException: null
        }
    }

    play() {
        let { dispatch, script } = this.props

        this.resetState()
        dispatch(setEditable(false))
        dispatch(setMarkers([]))
        dispatch(setReadLines(0))
        dispatch(setOutput(''))

        dispatch(startDebug(script.script))
    }

    stop() {
        let { dispatch, debug } = this.props

        this.resetState()
        dispatch(setEditable(true))
        dispatch(setMarkers([]))
        dispatch(setReadLines(0))

        dispatch(stopDebug())
    }

    stepInto() {
        let { dispatch } = this.props

        dispatch(stepInto())
    }

    stepOver() {
        let { dispatch } = this.props

        dispatch(stepOver())
    }

    stepOut() {
        let { dispatch } = this.props

        dispatch(stepOut())
    }

    componentDidUpdate() {
        let { dispatch, debug, input, output, script } = this.props
        if (!debug.isDebugging) return
        let responsesToProcess = this.state.processedResponses - debug.responses.length !== 0
            ? debug.responses.slice(this.state.processedResponses - debug.responses.length) : []
        if (responsesToProcess.length === 0) return
        this.state.processedResponses = debug.responses.length
        responsesToProcess.forEach(response => {
            if (response.event === 'start') {
                this.stepInto()
            } else if (response.event === 'error') {
                dispatch(updateOutput(response.value.tb
                    .filter((line, i) => i !== 1)
                    .reduce((str1, str2) => str1 + str2)
                ))
                this.stop()
            } else if (response.event === 'frame') {
                dispatch(setMarkers([response.value.line]))
                if (response.value.end) {
                    if (this.state.savedException !== null) dispatch(updateOutput(
                        this.state.savedException.tb.reduce((str1, str2) => str1 + str2)
                    ))
                    this.stop()
                }
                this.state.savedException = response.value.event === 'exception' ? response.value.args : null
            } else if (response.event === 'input' || response.event === 'require_input') {
                dispatch(updateOutput(response.value))
                if (input.input.length > input.readLines) {
                    let inputLine = input.input[input.input.length - 1]
                    dispatch(sendInput(inputLine))
                    dispatch(setReadLines(input.readLines + 1))
                    dispatch(updateOutput(inputLine + '\n'))
                }
            } else if (response.event === 'print') {
                dispatch(updateOutput(response.value))
            }
        });

    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return this.props.debug !== nextProps.debug
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
                        style={button}
                        onClick={this.stop}
                    />
                </div>
            </div>
        )
    }
}
