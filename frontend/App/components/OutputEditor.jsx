import React from 'react'
import { connect } from 'react-redux'

import TextEditor from './stateless/TextEditor'

import { setInput, setInputText } from '../reducers/output'


@connect(state => ({ output: state.output }))
export default class OutputEditor extends React.Component {

    render() {
        let { output } = this.props

        return <TextEditor
            mode={'text'}
            showGutter={false}
            {...this.props}
            value={output.output}
            readOnly={true}
        />
    }
}