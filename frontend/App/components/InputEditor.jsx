import React from 'react'
import { connect } from 'react-redux'

import TextEditor from './stateless/TextEditor'

import { setInput, setInputText } from '../reducers/input'


@connect(state => ({ input: state.input, theme: state.theme }))
export default class InputEditor extends React.Component {

    render() {
        let { input, theme } = this.props

        let onAceUpdate = ace => {
            let { input } = this.props

            if (input.readLines === 0) return
            ace.scrollToLine(input.readLines - 1, true, false, () => { })
        }

        let onCommandExec = (event, ace) => {
            let { input } = this.props

            let readLines = input.readLines
            let selFrom = ace.selection.getSelectionAnchor()
            let selTo = ace.selection.getSelectionLead()
            if (event.command.name === 'insertstring' || event.command.name === 'paste' ||
                event.command.name === 'backspace' || event.command.name === 'del' || event.command.name === 'cut') {
                if (selFrom.row < readLines || selTo.row < readLines) {
                    event.preventDefault()
                    event.stopPropagation()
                } else if (event.command.name === 'backspace' && selFrom.row === readLines && selFrom.column === 0
                    && selFrom.row === selTo.row && selFrom.column === selTo.column) {
                    event.preventDefault()
                    event.stopPropagation()
                }
            }
        }

        let onTextChange = (change, ace) => {
            let { dispatch } = this.props

            dispatch(setInput(ace.session.getLines(0, ace.session.getLength() - 2),ace.session.getValue()))
        }

        return <TextEditor
            mode={'text'}
            showGutter={false}
            {...this.props}
            theme={theme.theme === 'light' ? 'chrome' : 'monokai'}
            value={input.inputText}
            markers={Array(input.readLines).fill().map((_, i) => i)}
            onAceUpdate={onAceUpdate}
            onCommandExec={onCommandExec}
            onTextChange={onTextChange}
        />
    }
}
