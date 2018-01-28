import React from 'react'
import { render } from 'react-dom'
import { Grid, Row, Col, Image } from 'react-bootstrap'

import playButton from './debugger/playButton.png'
import stepoverButton from './debugger/stepoverButton.png'
import stepintoButton from './debugger/stepintoButton.png'
import stepoutButton from './debugger/stepoutButton.png'
import restartButton from './debugger/restartButton.png'
import stopButton from './debugger/stopButton.png'


export default class Debugger extends React.Component {

    render() {
        let button = { width: '35px', height: '35px', cursor: 'pointer' }
        return (
            <Grid fluid>
                <Row>
                    <Col>
                        <Image style={button} src={playButton} />
                        <Image style={button} src={stepoverButton} />
                        <Image style={button} src={stepintoButton} />
                        <Image style={button} src={stepoutButton} />
                        <Image style={button} src={restartButton} />
                        <Image style={button} src={stopButton} />
                    </Col>
                </Row>
            </Grid>
        )
    }
}