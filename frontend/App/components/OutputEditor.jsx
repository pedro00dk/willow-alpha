import React from 'react'
import { connect } from 'react-redux'

import { setInput, setInputText } from '../reducers/output'

import TextEditor from './stateless/TextEditor'


@connect(state => ({ output: state.output, theme: state.theme }))
export default class OutputEditor extends React.Component {

    render() {
        let { output, theme } = this.props

        let onChange = (change, editor) => {
            let { dispatch } = this.props

            editor.selection.moveCursorFileEnd()
            editor.scrollToLine(editor.selection.getCursor().row, true, true, () => { })
        }

        return <TextEditor
            editor={{
                mode: 'text',
                theme: theme.theme === 'light' ? 'chrome' : 'monokai',
                value: output.output,
                readOnly: true,
                showGutter: false,
                ...this.props.editor
            }}
            onChange={onChange}
        />
    }
}
