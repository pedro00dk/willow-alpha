import React from 'react'
import { render } from 'react-dom'
import { connect } from 'react-redux'

import TextEditor, { Range } from './stateless/TextEditor'

import { updateScript } from '../reducers/editor'


@connect(state => ({ editor: state.editor }))
export default class ScriptEditor extends React.Component {

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
        if (editor.scriptHighlightedLine !== null) {
            ace.session.addMarker(
                new Range(editor.scriptHighlightedLine, 0, editor.scriptHighlightedLine, Infinity),
                'bg-info',
                '',
                false
            )
        }
    }

    render() {
        let { dispatch } = this.props
        return (
            <TextEditor ref={'textEditor'} {...this.props}
                onChange={(change, editor) => dispatch(updateScript(editor.session.getValue()))}
            />
        )
    }
}
