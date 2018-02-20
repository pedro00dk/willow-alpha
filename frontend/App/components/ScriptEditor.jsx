import React from 'react'
import { connect } from 'react-redux'

import TextEditor from './stateless/TextEditor'

import { setScript } from '../reducers/script'


@connect(state => ({ script: state.script }))
export default class ScriptEditor extends React.Component {

    render() {
        let { dispatch, script } = this.props

        return <TextEditor
            mode={'python'}
            {...this.props}
            value={script.script}
            readOnly={!script.editable}
            markers={script.markers}
            onTextChange={(change, ace) => dispatch(setScript(ace.session.getValue()))}
        />
    }
}
