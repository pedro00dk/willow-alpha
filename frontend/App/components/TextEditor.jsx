import ace from 'brace'
import React from 'react'
import { connect } from 'react-redux'

import 'brace/ext/searchbox'
import 'brace/mode/python'
import 'brace/mode/text'
import 'brace/theme/chrome'


const { Range } = ace.acequire('ace/range')

export default class TextEditor extends React.Component {

    componentDidMount() {
        this.editor = ace.edit(this.ref)

        let { onExec, onChange } = this.props

        this.parentWidth = this.ref.parentElement.clientWidth
        this.parentHeight = this.ref.parentElement.clientHeigh
        this.tickSizeUpdater = window.setInterval(
            () => {
                if (this.ref.parentElement.clientWidth !== this.parentWidth ||
                    this.ref.parentElement.clientHeight !== this.parentHeight) {
                        this.parentWidth = this.ref.parentElement.clientWidth
                        this.parentHeight = this.ref.parentElement.clientHeight
                        this.editor.resize(true)
                }
            },
            1000
        )
        if (onExec) this.editor.commands.on('exec', event => onExec(event, this.editor))
        if (onChange) this.editor.session.on('change', change => onChange(change, this.editor))
        this.componentDidUpdate()
    }

    componentDidUpdate() {
        let {
            value = '',
            mode = 'text',
            theme = 'chrome',
            font = 14,
            gutter = true,
            readOnly = false,
            onUpdate,
            markers
        } = this.props

        if (this.editor.getValue() !== value) this.editor.setValue(value)
        this.editor.session.setMode('ace/mode/' + mode)
        this.editor.setTheme('ace/theme/' + theme)
        this.editor.setFontSize(font)
        this.editor.renderer.setShowGutter(gutter)
        this.editor.setReadOnly(readOnly)
        this.editor.$blockScrolling = Infinity

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

    componentWillUnmount() {
        window.clearInterval(this.tickSizeUpdater)
    }

    render() {
        return <div style={{ width: '100%', height: '100%' }} ref={ref => this.ref = ref} />
    }
}
