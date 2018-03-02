import classNames from 'classnames'
import React from 'react'
import { connect } from 'react-redux'

import { setScript } from '../reducers/script'

import TextEditor from './stateless/TextEditor'


@connect(state => ({ script: state.script, theme: state.theme }))
export default class ScriptEditor extends React.Component {

    render() {
        let { script, theme } = this.props

        let onChange = (change, editor) => {
            let { dispatch } = this.props

            dispatch(setScript(editor.getValue()))
        }
        return <TextEditor
            editor={{
                mode: 'python',
                theme: theme.theme === 'light' ? 'chrome' : 'monokai',
                value: script.script,
                readOnly: !script.editable,
                ...this.props.editor
            }}
            onChange={onChange}
            markers={script.markers.map(line => ({ ln: line, cls: classNames('bg-info', 'position-absolute') }))}
        />
    }
}
