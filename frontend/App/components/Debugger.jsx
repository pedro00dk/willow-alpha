import React from 'react'
import { connect } from 'react-redux'

import { startDebug, stopDebug, stepOver, stepInto, stepOut, sendInput } from '../reducers/debug'
import { setReadLines } from '../reducers/input'
import { setOutput, updateOutput } from '../reducers/output'
import { setEditable, setMarkers } from '../reducers/script'

import playBtn from './debugger/playBtn.png'
import restartBtn from './debugger/restartBtn.png'
import stepIntoBtn from './debugger/stepIntoBtn.png'
import stepOutBtn from './debugger/stepOutBtn.png'
import stepOverBtn from './debugger/stepOverBtn.png'
import stopBtn from './debugger/stopBtn.png'


@connect(state => ({
    debug: state.debug,
    exercise: state.exercise,
    input: state.input,
    output: state.output,
    script: state.script,
    user: state.user
}))
export default class Debugger extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            message: ''
        }

        // binds
        this.isPlayAvailable = this.isPlayAvailable.bind(this)
        this.isRestartOrStopAvailable = this.isRestartOrStopAvailable.bind(this)
        this.isStepAvailable = this.isStepAvailable.bind(this)
        this.play = this.play.bind(this)
        this.restart = this.restart.bind(this)
        this.stop = this.stop.bind(this)
        this.stepInto = this.stepInto.bind(this)
        this.stepOver = this.stepOver.bind(this)
        this.stepOut = this.stepOut.bind(this)
    }

    isPlayAvailable() {
        let { debug } = this.props

        return !debug.isFetching
    }

    isRestartOrStopAvailable() {
        let { debug } = this.props

        return debug.isDebugging
    }

    isStepAvailable() {
        let { debug } = this.props

        return debug.isDebugging && !debug.isFetching
    }

    play() {
        if (!this.isPlayAvailable()) {
            this.setState({ message: 'action not available' })
            return
        }
        let { dispatch, debug, script } = this.props

        if (!debug.isDebugging) {
            dispatch(setEditable(false))
            dispatch(setMarkers([]))
            dispatch(setReadLines(0))
            dispatch(setOutput(''))
            dispatch(startDebug(script.script))
        } else {
            // TODO continue
        }
    }

    restart() {
        if (!this.isRestartOrStopAvailable()) {
            this.setState({ message: 'action not available' })
            return
        }
        let { dispatch, debug, script } = this.props

        dispatch(setEditable(false))
        dispatch(setMarkers([]))
        dispatch(setReadLines(0))
        dispatch(setOutput(''))
        dispatch(startDebug(script.script))
    }

    stop() {
        if (!this.isRestartOrStopAvailable()) {
            this.setState({ message: 'action not available' })
            return
        }
        let { dispatch, debug } = this.props

        dispatch(setEditable(true))
        dispatch(setMarkers([]))
        dispatch(setReadLines(0))
        dispatch(stopDebug())
    }

    stepInto() {
        if (!this.isStepAvailable()) {
            this.setState({ message: 'action not available' })
            return
        }
        let { dispatch } = this.props

        dispatch(stepInto())
    }

    stepOver() {
        if (!this.isStepAvailable()) {
            this.setState({ message: 'action not available' })
            return
        }
        let { dispatch } = this.props

        dispatch(stepOver())
    }

    stepOut() {
        if (!this.isStepAvailable()) {
            this.setState({ message: 'action not available' })
            return
        }
        let { dispatch } = this.props

        dispatch(stepOut())
    }

    componentDidUpdate() {
        let { dispatch, debug, input, output, script } = this.props

        if (!debug.isDebugging || debug.newResponsesCount === 0) {
            this.setState({ message: 'debugger is not running' })
            return
        }
        let responses = debug.responses.slice(-debug.newResponsesCount)
        responses.forEach(response => {
            this.setState({ message: 'debugger running' })
            if (response.event === 'start') this.stepInto()
            else if (response.event === 'error') {
                this.setState({ message: 'script or internal error' })
                dispatch(updateOutput(
                    response.value.traceback
                        .filter((line, i) => i !== 1)
                        .join('')
                ))
                this.stop()
            } else if (response.event === 'frame') {
                dispatch(setMarkers(
                    [{
                        line: response.value.line,
                        type: response.value.event === 'exception' ? 'error' : undefined
                    }]
                ))
                this.raisedException = response.value.event === 'exception'
                    ? response.value.args
                    : response.value.event === 'return'
                        ? this.raisedException
                        : null
                if (response.value.end) {
                    if (this.raisedException !== null) {
                        dispatch(updateOutput(this.raisedException.traceback.join('')))
                    }
                    this.stop()
                }
            } else if (response.event === 'input' || response.event === 'require_input') {
                if (response.event === 'input') dispatch(updateOutput(response.value))
                if (input.input.length > input.readLines) {
                    let inputLine = input.input[input.input.length - 1]
                    dispatch(sendInput(inputLine))
                    dispatch(setReadLines(input.readLines + 1))
                } else {
                    this.setState({ message: 'input required' })
                    dispatch(setMarkers([{ line: script.markers.slice(-1)[0].line, type: 'warn' }]))
                }
            } else if (response.event === 'print') {
                dispatch(setMarkers([{ line: script.markers.slice(-1)[0].line }]))
                dispatch(updateOutput(response.value))
            }
        })
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return this.props.debug !== nextProps.debug || this.state.message !== nextState.message
    }

    render() {
        let { style } = this.props
        let { message } = this.state

        return <div style={style}>
            <img src={playBtn} className='h-100'
                style={{ cursor: 'pointer', filter: this.isPlayAvailable() ? null : 'grayscale(80%)' }}
                onClick={this.play} />
            <img src={stepOverBtn} className='h-100'
                style={{ cursor: 'pointer', filter: this.isStepAvailable() ? null : 'grayscale(80%)' }}
                onClick={this.stepOver} />
            <img src={stepIntoBtn} className='h-100'
                style={{ cursor: 'pointer', filter: this.isStepAvailable() ? null : 'grayscale(80%)' }}
                onClick={this.stepInto} />
            <img src={stepOutBtn} className='h-100'
                style={{ cursor: 'pointer', filter: this.isStepAvailable() ? null : 'grayscale(80%)' }}
                onClick={this.stepOut} />
            <img src={restartBtn} className='h-100'
                style={{ cursor: 'pointer', filter: this.isRestartOrStopAvailable() ? null : 'grayscale(80%)' }}
                onClick={this.restart} />
            <img src={stopBtn} className='h-100'
                style={{ cursor: 'pointer', filter: this.isRestartOrStopAvailable() ? null : 'grayscale(80%)' }}
                onClick={this.stop} />
            {message}
        </div>
    }
}
