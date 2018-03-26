import React from 'react'
import { connect } from 'react-redux'

import { setScript } from '../reducers/script'

import TextEditor from './TextEditor'


@connect(state => ({ script: state.script }))
export default class ScriptEditor extends React.Component {

    render() {
        let { script } = this.props

        let onChange = (change, editor) => {
            let { dispatch } = this.props

            dispatch(setScript(editor.getValue()))
        }

        let onUpdate = editor => {
            let { script } = this.props

            if (script.markers.length > 0) editor.scrollToLine(script.markers.slice(-1)[0], true, false, () => { })
        }

        return <TextEditor
            value={script.script}
            mode={'python'}
            readOnly={!script.editable}
            onChange={onChange}
            onUpdate={onUpdate}
            markers={script.markers.map(line => ({
                ln: line, cls: 'position-absolute ' + !script.error ? 'bg-info' : 'bg-danger'
            }))}
        />
    }
}
