import React from 'react'
import { connect } from 'react-redux'

import { setInput, setInputText } from '../reducers/output'

import TextEditor from './TextEditor'


@connect(state => ({ output: state.output }))
export default class OutputEditor extends React.Component {

    render() {
        let { output } = this.props

        let onChange = (change, editor) => {
            let { dispatch } = this.props

            editor.selection.moveCursorFileEnd()
            editor.scrollToLine(editor.selection.getCursor().row, true, true, () => { })
        }

        return <TextEditor
            editor={{
                mode: 'text',
                value: output.output,
                readOnly: true,
                showGutter: false,
                ...this.props.editor
            }}
            onChange={onChange}
        />
    }
}
