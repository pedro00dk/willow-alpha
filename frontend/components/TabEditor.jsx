import React from 'react'
import { render } from 'react-dom'
import { Grid, Row, Col, Tab, Tabs } from 'react-bootstrap'
import { connect } from 'react-redux'

import Editor from './Editor'

import { updateScript } from '../reducers/script'

@connect(state => ({ exercise: state.exercise, selectExercise: state.selectExercise }))
export default class TabEditor extends React.Component {
    
    constructor(props) {
        super(props)

        // binds
        this.onScriptChangeCallback = this.onScriptChangeCallback.bind(this)
    }

    onScriptChangeCallback(value) {
        let { dispatch } = this.props
        dispatch(updateScript(value))
    }

    renderExerciseTabs() {
        let { exercise, selectExercise } = this.props
        if (selectExercise.selectedExercise === null) return

        let selectedExerciseData = exercise.exercises
            .find(e => e.id === selectExercise.selectedExercise)
        return [
            <Tab eventKey={1} title='README'>
                <Editor mode='text' theme='xcode' font={14} value={selectedExerciseData.readme} readonly />
            </Tab>,
            <Tab eventKey={2} title='Input Example'>
                <Editor mode='text' theme='xcode' font={14} value={selectedExerciseData.input_ex} readonly />
            </Tab>
        ]
    }

    render() {
        return (
            <Grid fluid>
                <Row>
                    <Col>
                        <Tabs animation={false} id={'uncontrolled-tab-example'}>
                            <Tab eventKey={0} title='Script'>
                                <Editor mode='python' theme='xcode' font={14} onValueChangeCallback={this.onScriptChangeCallback} />
                            </Tab>
                            {this.renderExerciseTabs()}
                        </Tabs>
                    </Col>
                </Row>
            </Grid>
        )
    }
}