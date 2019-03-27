import React from 'react'
import { connect } from 'react-redux'

import TextEditor from './TextEditor'

import { setInput, setInputText } from '../reducers/input'


 class InputEditor0 extends React.Component {

    render() {
        let { input } = this.props

        let onExec = (event, editor) => {
            let { input } = this.props

            let readLines = input.readLines
            let selectionAnchor = editor.selection.getSelectionAnchor()
            let selectionLead = editor.selection.getSelectionLead()
            if (event.command.name === 'insertstring' || event.command.name === 'paste' ||
                event.command.name === 'backspace' || event.command.name === 'del' || event.command.name === 'cut') {
                if (selectionAnchor.row < readLines || selectionLead.row < readLines ||
                    (
                        event.command.name === 'backspace' && selectionAnchor.row === readLines &&
                        selectionAnchor.column === 0 && selectionAnchor.row === selectionLead.row &&
                        selectionAnchor.column === selectionLead.column
                    )
                ) {
                    event.preventDefault()
                    event.stopPropagation()
                }
            }
        }

        let onChange = (change, editor) => {
            let { dispatch } = this.props

            dispatch(setInput(editor.session.getLines(0, editor.session.getLength() - 2), editor.session.getValue()))
        }

        let onUpdate = editor => {
            let { input } = this.props

            if (input.readLines > 0) editor.scrollToLine(input.readLines - 1, true, false, () => { })
        }

        return <TextEditor
            value={input.inputText}
            gutter={false}
            onExec={onExec}
            onChange={onChange}
            onUpdate={onUpdate}
            markers={Array(input.readLines).fill().map((_, i) => ({ line: i, css: 'bg-info position-absolute' }))}
        />
    }
}
const InputEditor = connect(state => ({ input: state.input }))(InputEditor0)
export default InputEditor