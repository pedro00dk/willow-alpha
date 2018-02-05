import React from 'react'
import { render } from 'react-dom'
import { Grid, Row, Col, Image, Label } from 'react-bootstrap'
import { connect } from 'react-redux'

import { startDebug, stopDebug, stepInto, stepOver, stepOut, sendInput } from '../reducers/debug'

import playButton from './debugger/playButton.png'
import stepoverButton from './debugger/stepoverButton.png'
import stepintoButton from './debugger/stepintoButton.png'
import stepoutButton from './debugger/stepoutButton.png'
import restartButton from './debugger/restartButton.png'
import stopButton from './debugger/stopButton.png'

@connect(state => ({ script: state.script, debug: state.debug }))
export default class Debugger extends React.Component {

    constructor(props) {
        super(props)

        // binds
        this.startDebug = this.startDebug.bind(this)
        this.stopDebug = this.stopDebug.bind(this)
        this.sendInput = this.sendInput.bind(this)
        this.stepInto = this.stepInto.bind(this)
        this.stepOver = this.stepOver.bind(this)
        this.stepOut = this.stepOut.bind(this)
        this.renderDebugInfo = this.renderDebugInfo.bind(this)
    }

    startDebug() {
        let { dispatch, debug, script } = this.props
        dispatch(startDebug(script.script))
    }

    stopDebug() {
        let { dispatch, debug } = this.props
        dispatch(stopDebug())
    }

    sendInput() {
        let { dispatch, debug } = this.props
        dispatch(sendInput('input'))
    }

    stepInto() {
        let { dispatch, debug } = this.props
        dispatch(stepInto())
    }

    stepOver() {
        let { dispatch, debug } = this.props
        dispatch(stepOver())
    }

    stepOut() {
        let { dispatch, debug } = this.props
        dispatch(stepOut())
    }

    renderDebugInfo() {
        let { debug } = this.props
        if (debug.isFetching) return (<label>fetching</label>)
        if (debug.isDebugging) return (<label>debugging</label>)
        return null
    }

    render() {
        let button = { width: '35px', height: '35px', cursor: 'pointer' }
        return (
            <Grid fluid>
                <Row>
                    <Col>
                        <Image style={button} src={playButton} onClick={this.startDebug} />
                        <Image style={button} src={stepoverButton} onClick={this.stepOver} />
                        <Image style={button} src={stepintoButton} onClick={this.stepInto} />
                        <Image style={button} src={stepoutButton} onClick={this.stepOut} />
                        <Image style={button} src={restartButton} onClick={this.startDebug} />
                        <Image style={button} src={stopButton} onClick={this.stopDebug} />
                        {this.renderDebugInfo()}
                    </Col>
                </Row>
            </Grid>
        )
    }
}