import React from 'react'
import { render } from 'react-dom'
import { connect } from 'react-redux'

import TextEditor, { Range } from './stateless/TextEditor'

import { updateInput } from '../reducers/editor'


@connect(state => ({ editor: state.editor }))
export default class InputEditor extends React.Component {

    constructor(props) {
        super(props)
    }
    
    componentDidUpdate() {
        let { editor } = this.props
        let ace = this.refs.textEditor.getAce()
        Object.getOwnPropertyNames(ace.session.getMarkers(false)).forEach(markerIdStr => {
            let markerId = parseInt(markerIdStr)
            if (markerId < 2) return
            ace.session.removeMarker(markerId)
        })
        Array(editor.inputReadLines).fill().forEach((_, line) => {
            this.ace.session.addMarker(new Range(i, 0, i, Infinity), 'bg-info', '', false)
        })
    }

    render() {
        return (
            <TextEditor ref={'textEditor'} {...this.props} mode={'text'} gutter={false}
                onExec={(event, ace) => {
                    let { editor } = this.props

                    let readLines = editor.inputReadLines
                    let selFrom = ace.selection.getSelectionAnchor()
                    let selTo = ace.selection.getSelectionLead()
                    if (event.command.name === 'insertstring' || event.command.name === 'paste' ||
                        event.command.name === 'backspace' || event.command.name === 'del' ||
                        event.command.name === 'cut') {
                        if (selFrom.row < readLines || selTo.row < readLines) {
                            event.preventDefault()
                            event.stopPropagation()
                        } else if (event.command.name === 'backspace'
                            && selFrom.row === selTo.row && selFrom.column === selTo.column
                            && selTo.column === 0) {
                            event.preventDefault()
                            event.stopPropagation()
                        }
                    }
                }}
                onChange={(change, ace) => {
                    let { dispatch } = this.props

                    dispatch(updateInput(ace.session.getLines(0, ace.session.getLength() - 2)))
                }}
            />
        )
    }
}
