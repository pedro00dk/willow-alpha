import React from 'react'
import { render } from 'react-dom'
import { connect } from 'react-redux'

import TextEditor from './stateless/TextEditor'

import { setInput, setInputText } from '../reducers/output'


@connect(state => ({ output: state.output }))
export default class OutputEditor extends React.Component {

    render() {
        let { dispatch, output } = this.props

        return <TextEditor
            mode={'text'}
            showGutter={false}
            value={output.output}
            readOnly={true}
        />
    }
}
