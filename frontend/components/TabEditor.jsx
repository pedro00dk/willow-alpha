import React from 'react'
import { render } from 'react-dom'
import { Grid, Row, Col, Tab, Tabs } from 'react-bootstrap'

import Editor from './Editor'


export default class TabEditor extends React.Component {

    render() {
        return (
            <Grid fluid>
                <Row>
                    <Col>
                        <Tabs defaultActiveKey={2} id="uncontrolled-tab-example">
                            <Tab eventKey={1} title="Tab 1">
                                <Editor mode='python' theme='monokai' font={14} value={'import itertools'}></Editor>
                            </Tab>
                            <Tab eventKey={2} title="Tab 2">
                                <Editor mode='python' theme='terminal' font={14} value={'import os'}></Editor>
                            </Tab>
                            <Tab eventKey={3} title="Tab 3" disabled>
                                <Editor mode='text' theme='xcode' font={12} value={'readme file'}></Editor>
                            </Tab>
                        </Tabs>
                    </Col>
                </Row>
            </Grid>
        )
    }
}