import React from 'react'
import Radium from 'radium'
import { Grid, Row, Col } from 'react-bootstrap'

import Header from '../components/Header'
import Debugger from '../components/Debugger'
import TabEditor from '../components/TabEditor'


@Radium
export default class AppContainer extends React.Component {

    render() {
        return (
            <Grid fluid>
                <Row>
                    <Col>
                        <Header />
                        <Debugger />
                        <TabEditor />
                    </Col>
                </Row>
            </Grid>
        )
    }
}