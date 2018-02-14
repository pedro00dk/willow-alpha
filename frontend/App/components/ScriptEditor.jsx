import React from 'react'
import { render } from 'react-dom'
import { connect } from 'react-redux'

import TextEditor, { Range } from './stateless/TextEditor'

import { updateScript } from '../reducers/editor'


@connect(state => ({ debug: state.editor }))
export default class ScriptEditor extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        let { dispatch } = this.props
        return (
            <TextEditor {...this.props}
                onChange={(change, editor) => dispatch(updateScript(editor.session.getValue()))}
            />
        )
    }
}
