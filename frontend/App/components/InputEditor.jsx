import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'

import { setInput, setInputText } from '../reducers/input'

import TextEditor from './stateless/TextEditor'


@connect(state => ({ input: state.input, theme: state.theme }))
export default class InputEditor extends React.Component {

    render() {
        let { input, theme } = this.props

        let onExec = (event, editor) => {
            let { input } = this.props

            let readLines = input.readLines
            let selFrom = editor.selection.getSelectionAnchor()
            let selTo = editor.selection.getSelectionLead()
            if (event.command.name === 'insertstring' || event.command.name === 'paste' ||
                event.command.name === 'backspace' || event.command.name === 'del' || event.command.name === 'cut') {
                if ((selFrom.row < readLines || selTo.row < readLines) ||
                    (event.command.name === 'backspace' && selFrom.row === readLines && selFrom.column === 0
                        && selFrom.row === selTo.row && selFrom.column === selTo.column)) {
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
            editor={{
                mode: 'text',
                theme: theme.theme === 'light' ? 'chrome' : 'monokai',
                value: input.inputText,
                showGutter: false,
                ...this.props.editor
            }}
            onExec={onExec}
            onChange={onChange}
            onUpdate={onUpdate}
            markers={Array(input.readLines).fill().map(
                (_, i) => ({ ln: i, cls: classNames('bg-info', 'position-absolute') })
            )}
        />
    }
}
