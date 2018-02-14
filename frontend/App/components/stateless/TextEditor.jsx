import React from 'react'
import { render } from 'react-dom'
import { Grid, Row, Col, DropdownButton, MenuItem } from 'react-bootstrap'

import brace from 'brace'
import AceEditor from 'react-ace'

const __modes = ['text', 'python']
__modes.forEach(mode => require('brace/mode/' + mode))
const __themes = ['xcode', 'github', 'monokai', 'terminal']
__themes.forEach(theme => require('brace/theme/' + theme))
require('brace/ext/searchbox')


export default class TextEditor extends React.Component {

    constructor(props) {
        super(props)

        this.modes = __modes
        this.themes = __themes
        this.fonts = [14, 16, 18, 20, 25, 30]

        this.state = {
            mode: this.props.mode !== undefined ? this.props.mode : this.modes[0],
            theme: this.props.theme !== undefined ? this.props.theme : this.themes[0],
            font: this.props.font !== undefined ? this.props.font : this.fonts[0],
            gutter: this.props.gutter !== undefined ? this.props.gutter : true,
            readonly: this.props.readonly !== undefined ? this.props.readonly : false
        }
        this.value = this.props.value !== undefined ? this.props.value : ''
        this.onExec = this.props.onExec
        this.onChange = this.props.onChange

        // binds
        this.getAce = this.getAce.bind(this)
    }

    getAce() {
        return this.refs.aceEditor.editor
    }

    componentDidMount() {
        this.refs.aceEditor.editor.commands.on(
            'exec',
            event => {
                if (this.onExec instanceof Array)
                    this.onExec
                        .filter(onExec => onExec instanceof Function)
                        .forEach(onExec => onExec(event, this.getAce()))
                else if (this.onExec instanceof Function)
                    this.onExec(event, this.getAce())
            }
        )
        this.refs.aceEditor.editor.session.on(
            'change',
            change => {
                if (this.onChange instanceof Array)
                    this.onChange
                        .filter(onChange => onChange instanceof Function)
                        .forEach(onChange => onChange(change, this.getAce()))
                else if (this.onChange instanceof Function)
                    this.onChange(change, this.getAce())
            }
        )
    }

    render() {
        return (
            <AceEditor ref={'aceEditor'} className={'col-12'} style={{ width: '100%' }}
                name={'editor'}
                mode={this.state.mode}
                theme={this.state.theme}
                fontSize={this.state.font}
                showGutter={this.state.gutter}
                readOnly={this.state.readonly}
                value={this.value}
                onChange={value => this.value = value}
                editorProps={{ $blockScrolling: Infinity }}
            />
        )
    }
}

export var Range = brace.acequire('ace/range').Range
