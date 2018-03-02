import classNames from 'classnames'
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
        return <TextEditor
            editor={{
                mode: 'python',
                value: script.script,
                readOnly: !script.editable,
                ...this.props.editor
            }}
            onChange={onChange}
            markers={script.markers.map(line => ({ ln: line, cls: classNames('bg-info', 'position-absolute') }))}
        />
    }
}
