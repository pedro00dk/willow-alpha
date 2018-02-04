import React from 'react'
import { render } from 'react-dom'
import { Grid, Row, Col, Image, Label } from 'react-bootstrap'
import { connect } from 'react-redux'

import { startDebug } from '../reducers/debug'

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
        this.startDebugger = this.startDebugger.bind(this)
        this.renderDebugInfo = this.renderDebugInfo.bind(this)
    }

    startDebugger() {
        let { dispatch, debug, script } = this.props
        dispatch(startDebug(script.script))
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
                        <Image style={button} src={playButton} onClick={() =>this.startDebugger()} />
                        <Image style={button} src={stepoverButton} />
                        <Image style={button} src={stepintoButton} />
                        <Image style={button} src={stepoutButton} />
                        <Image style={button} src={restartButton} />
                        <Image style={button} src={stopButton} />
                        {this.renderDebugInfo()}
                    </Col>
                </Row>
            </Grid>
        )
    }
}