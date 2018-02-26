import React from 'react'
import { connect } from 'react-redux'

import TextEditor from './stateless/TextEditor'

import { setInput, setInputText } from '../reducers/output'


@connect(state => ({ output: state.output, theme: state.theme }))
export default class OutputEditor extends React.Component {

    render() {
        let { output, theme } = this.props

        let onTextChange = (change, ace) => {
            let { dispatch } = this.props

            ace.scrollToLine(ace.selection.getCursor().row, true, true, () => { })
        }

        return <TextEditor
            mode={'text'}
            showGutter={false}
            {...this.props}
            theme={theme.theme === 'light' ? 'chrome' : 'monokai'}
            value={output.output}
            readOnly={true}
            onTextChange={onTextChange}
        />
    }
}
