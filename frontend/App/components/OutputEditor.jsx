import React from 'react'
import { connect } from 'react-redux'

import TextEditor from './TextEditor'

import { setInput, setInputText } from '../reducers/output'


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
            value={output.output}
            readOnly={true}
            gutter={false}
            onChange={onChange}
        />
    }
}
