import React from 'react'
import Radium from 'radium'
import { Grid, Row, Col, Tab, Tabs } from 'react-bootstrap'
import { connect } from 'react-redux'

import DebugBar from '../components/DebugBar'
import Header from '../components/Header'
import TextEditor from '../components/stateless/TextEditor'
import InputEditor from '../components/InputEditor'
import ScriptEditor from '../components/ScriptEditor'


@Radium
@connect(state => ({
    exercise: state.exercise
}))
export default class AppContainer extends React.Component {

    constructor(props) {
        super(props)
    }


    renderScriptEditor() {
        let { exercise } = this.props

        this.scriptEditor = <ScriptEditor mode='python' />
        let exerciseTabs = exercise.selected === null
            ? null
            : [
                <Tab eventKey={1} title={exercise.selected.name}>
                    <TextEditor value={exercise.selected.readme} readonly />
                </Tab>,
                <Tab eventKey={2} title='Input Example'>
                    <TextEditor value={exercise.selected.input_ex} readonly />
                </Tab>
            ]
        return (
            <Tabs animation={false}>
                <Tab eventKey={0} title='Script'>
                    {this.scriptEditor}
                </Tab>
                {exerciseTabs}
            </Tabs>
        )
    }

    render() {
        return (
            <Grid fluid>
                <Row>
                    <Col>
                        <Header />
                        <DebugBar />
                    </Col>
                </Row>
                <Row>
                    {this.renderScriptEditor()}
                </Row>
                <Row>
                    <InputEditor />
                </Row>
            </Grid>
        )
    }
}