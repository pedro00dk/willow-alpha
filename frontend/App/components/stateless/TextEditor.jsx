import React from 'react'

import brace from 'brace'
import AceEditor from 'react-ace'

import 'brace/theme/chrome'
import 'brace/theme/monokai'
import 'brace/mode/text'
import 'brace/mode/python'
import 'brace/ext/searchbox'


export default class TextEditor extends React.Component {

    componentDidMount() {
        let ace = this.refs.race.editor
        if (this.props.onCommandExec !== undefined)
            ace.commands.on('exec', event => this.props.onCommandExec(event, ace))
        if (this.props.onTextChange !== undefined)
            ace.session.on('change', change => this.props.onTextChange(change, ace))
        this.componentDidUpdate()
    }

    componentDidUpdate() {
        let ace = this.refs.race.editor
        if (this.props.onAceUpdate !== undefined) this.props.onAceUpdate(ace)
        let markersToRemove = Object.values(ace.session.getMarkers(false))
            .filter(marker => marker.id > 2)
            .forEach(marker => ace.session.removeMarker(marker.id))
        if (this.props.markers === undefined) return
        this.props.markers.forEach(marker => ace.session.addMarker(
            new Range(marker, 0, marker, 1), 'bg-info position-absolute', 'screenLine', false
        ))
    }

    render() {
        return <AceEditor
            mode={'text'}
            theme={'chrome'}
            fontSize={14}
            editorProps={{ $blockScrolling: Infinity }}
            style={{ width: '100%' }}
            {...this.props}
            ref={'race'}
        />
    }
}

const { Range } = brace.acequire('ace/range')
