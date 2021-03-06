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


class Debugger0 extends React.Component {

    constructor(props) {
        super(props)

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
        const { debug } = this.props

        return !debug.isFetching
    }

    isRestartOrStopAvailable() {
        const { debug } = this.props

        return debug.isDebugging
    }

    isStepAvailable() {
        const { debug } = this.props

        return debug.isDebugging && !debug.isFetching
    }

    play() {
        if (!this.isPlayAvailable()) return this.message = 'action not available'
        const { dispatch, debug, script } = this.props

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
        if (!this.isRestartOrStopAvailable()) return this.message = 'action not available'
        const { dispatch, script } = this.props

        dispatch(setEditable(false))
        dispatch(setMarkers([]))
        dispatch(setReadLines(0))
        dispatch(setOutput(''))
        dispatch(startDebug(script.script))
    }

    stop() {
        if (!this.isRestartOrStopAvailable()) return this.message = 'action not available'
        const { dispatch } = this.props

        dispatch(setEditable(true))
        dispatch(setMarkers([]))
        dispatch(setReadLines(0))
        dispatch(stopDebug())
    }

    stepInto() {
        if (!this.isStepAvailable()) return this.message = 'action not available'
        const { dispatch } = this.props

        dispatch(stepInto())
    }

    stepOver() {
        if (!this.isStepAvailable()) return this.message = 'action not available'
        const { dispatch } = this.props

        dispatch(stepOver())
    }

    stepOut() {
        if (!this.isStepAvailable()) return this.message = 'action not available'
        const { dispatch } = this.props

        dispatch(stepOut())
    }

    componentDidMount() {
        this.componentDidUpdate()
    }

    componentDidUpdate() {
        const { dispatch, debug, input, script } = this.props

        if (debug.isDebugging) this.message = 'debugger running'
        else if (debug.isFetching) this.message = 'fetching'
        else this.message = 'debugger stopped'

        if (debug.responses.length === 0) {
            this.processedResponses = 0
            this.raisedException = null
        }

        if (!debug.isDebugging || debug.isFetching || debug.responses.length === this.processedResponses) return

        let nextResponses = debug.responses.slice(this.processedResponses - debug.responses.length)
        this.processedResponses = debug.responses.length

        nextResponses.forEach(response => {
            if (response.event === 'start') this.stepInto()
            else if (response.event === 'error') {
                this.message = 'script or internal error'
                dispatch(updateOutput(response.value.traceback.filter((line, i) => i !== 1).join('')))
                this.stop()
            } else if (response.event === 'frame') {
                let frame = response.value
                dispatch(setMarkers([{ line: frame.line, type: frame.event === 'exception' ? 'error' : undefined }]))
                this.raisedException =
                    frame.event === 'exception'
                        ? frame.exception
                        : frame.event === 'return'
                            ? this.raisedException
                            : null
                if (response.value.end) {
                    if (this.raisedException) dispatch(updateOutput(this.raisedException.traceback.join('')))
                    this.stop()
                }
            } else if (response.event === 'input' || response.event === 'require_input') {
                if (response.event === 'input') dispatch(updateOutput(response.value))
                if (input.input.length > input.readLines) {
                    let inputLine = input.input[input.input.length - 1]
                    dispatch(sendInput(inputLine))
                    dispatch(setReadLines(input.readLines + 1))
                } else {
                    this.message = 'input required'
                    dispatch(setMarkers([{ line: script.markers.slice(-1)[0].line, type: 'warn' }]))
                }
            } else if (response.event === 'print') {
                dispatch(setMarkers([{ line: script.markers.slice(-1)[0].line }]))
                dispatch(updateOutput(response.value))
            }
        })
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.props.debug !== nextProps.debug
    }

    render() {
        let { style } = this.props

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
            {this.message}
        </div>
    }
}
const Debugger = connect(state => {
    return ({ debug: state.debug, input: state.input, output: state.output, script: state.script })
})(Debugger0)
export default Debugger
