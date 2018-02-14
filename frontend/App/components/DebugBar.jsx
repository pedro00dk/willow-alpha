import React from 'react'
import { render } from 'react-dom'
import { Grid, Row, Col, Image, Label } from 'react-bootstrap'
import { connect } from 'react-redux'

import { startDebug, stopDebug, stepInto, stepOver, stepOut, sendInput } from '../reducers/debug'

import playBtn from './debugBar/playBtn.png'
import stepOverBtn from './debugBar/stepOverBtn.png'
import stepIntoBtn from './debugBar/stepIntoBtn.png'
import stepOutBtn from './debugBar/stepOutBtn.png'
import restartBtn from './debugBar/restartBtn.png'
import stopBtn from './debugBar/stopBtn.png'


export default class DebugBar extends React.Component {

    render() {
        let button = { width: '35px', height: '35px', cursor: 'pointer' }
        return (
            <Grid fluid>
                <Row>
                    <Col>
                        <Image disabled style={button} src={playBtn}
                            onClick={() => this.props.onPlay !== undefined
                                ? this.props.onPlay()
                                : null}
                        />
                        <Image style={button} src={stepOverBtn}
                            onClick={() => this.props.onStepOver !== undefined
                                ? this.props.onStepOver()
                                : null}
                        />
                        <Image style={button} src={stepIntoBtn}
                            onClick={() => this.props.onStepInto !== undefined
                                ? this.props.onStepInto()
                                : null}
                        />
                        <Image style={button} src={stepOutBtn}
                            onClick={() => this.props.onStepOut !== undefined
                                ? this.props.onStepOut()
                                : null}
                        />
                        <Image style={button} src={restartBtn}
                            onClick={() => this.props.onRestart !== undefined
                                ? this.props.onRestart()
                                : null}
                        />
                        <Image style={button} src={stopBtn}
                            onClick={() => this.props.onStop !== undefined
                                ? this.props.onStop()
                                : null}
                        />
                        {() => this.props.debugInfo !== undefined
                            ? this.props.debugInfo()
                            : null}
                    </Col>
                </Row>
            </Grid>
        )
    }
}
