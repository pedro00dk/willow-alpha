import React from 'react'
import { render } from 'react-dom'
import { connect } from 'react-redux'

import TextEditor from './stateless/TextEditor'

import { setScript } from '../reducers/script'


@connect(state => ({ script: state.script }))
export default class ScriptEditor extends React.Component {

    render() {
        let { dispatch, script } = this.props

        return <TextEditor markers={script.markers}
            mode={'python'}
            readonly={!script.editable}
            value={script.script}
            onTextChange={(change, ace) => dispatch(setScript(ace.session.getValue()))}
        />
    }
}
