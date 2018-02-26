import React from 'react'
import { connect } from 'react-redux'

import TextEditor from './stateless/TextEditor'

import { setScript } from '../reducers/script'


@connect(state => ({ script: state.script, theme: state.theme }))
export default class ScriptEditor extends React.Component {

    render() {
        let { dispatch, script, theme } = this.props

        let onAceUpdate = ace => {
            let { script } = this.props

            if (script.editable || script.markers.length === 0) return
            ace.scrollToLine(script.markers[script.markers.length - 1], true, false, () => { })
        }

        let onTextChange = (change, ace) => {
            let { dispatch } = this.props

            dispatch(setScript(ace.session.getValue()))
        }

        return <TextEditor
            mode={'python'}
            {...this.props}
            theme={theme.theme === 'light' ? 'chrome' : 'monokai'}
            value={script.script}
            readOnly={!script.editable}
            markers={script.markers}
            onAceUpdate={onAceUpdate}
            onTextChange={onTextChange}
        />
    }
}
