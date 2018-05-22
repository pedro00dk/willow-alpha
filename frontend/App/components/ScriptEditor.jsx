import React from 'react'
import { connect } from 'react-redux'

import TextEditor from './TextEditor'

import { setScript } from '../reducers/script'


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

            if (script.markers.length > 0) editor.scrollToLine(script.markers.slice(-1)[0], true, true, () => { })
        }

        return <TextEditor
            value={script.script}
            mode={'python'}
            readOnly={!script.editable}
            onChange={onChange}
            onUpdate={onUpdate}
            markers={script.markers.map(
                ({ line, type }) => ({
                    line: line,
                    css: 'position-absolute ' +
                        (type === 'warn' ? 'bg-warning' : type === 'error' ? 'bg-danger' : 'bg-info')
                })
            )}
        />
    }
}
