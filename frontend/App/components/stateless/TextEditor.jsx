import brace from 'brace'
import React from 'react'
import AceEditor from 'react-ace'

import 'brace/ext/searchbox'
import 'brace/mode/python'
import 'brace/mode/text'
import 'brace/theme/chrome'
import 'brace/theme/monokai'


const { Range } = brace.acequire('ace/range')

export default class TextEditor extends React.Component {

    componentDidMount() {
        this.editor = this.container.editor

        let { onExec, onChange, markers } = this.props

        if (onExec) this.editor.commands.on('exec', event => onExec(event, this.editor))
        if (onChange) this.editor.session.on('change', change => onChange(change, this.editor))
        this.componentDidUpdate()
    }
    
    componentDidUpdate() {
        let { onUpdate, markers } = this.props

        if (onUpdate) onUpdate(this.editor)
        if (markers) {
            Object.values(this.editor.session.getMarkers(false))
                .filter(marker => marker.id > 2)
                .forEach(marker => this.editor.session.removeMarker(marker.id))
            markers.forEach(
                ({ ln, cls }) => this.editor.session.addMarker(new Range(ln, 0, ln, 1), cls, 'screenLine', false)
            )
        }
    }

    render() {
        return <AceEditor
            mode={'text'}
            theme={'chrome'}
            fontSize={14}
            editorProps={{ $blockScrolling: Infinity }}
            {...this.props.editor}
            ref={reactAce => this.container = reactAce}
        />
    }
}

