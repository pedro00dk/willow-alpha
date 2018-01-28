import React from 'react'
import { render } from 'react-dom'
import { Grid, Row, Col, DropdownButton, MenuItem } from 'react-bootstrap'

import brace from 'brace'
import AceEditor from 'react-ace'

const __modes = ['python', 'text']
__modes.forEach(mode => require('brace/mode/' + mode))
const __themes = ['xcode', 'github', 'monokai', 'terminal']
__themes.forEach(theme => require('brace/theme/' + theme))


var __editor_id_index = 0

export default class Editor extends React.Component {

    constructor(props) {
        super(props)

        this.modes = __modes
        this.themes = __themes
        this.fonts = [14, 16, 18, 20, 25, 30]

        this.state = {
            mode: this.props.mode !== undefined ? this.props.mode : this.modes[0],
            theme: this.props.theme !== undefined ? this.props.theme : this.themes[0],
            font: this.props.font !== undefined ? this.props.font : this.fonts[0]
        }
        this.value = this.props.value !== undefined ? this.props.value : ''

        // binds
        this.onValueChange = this.onValueChange.bind(this)
    }

    onValueChange(value) {
        this.value = value
    }

    render() {
        return (
            <Grid fluid>
                <Row>
                    <Col>
                        <AceEditor className='col-12' style={{ width: '100%' }}
                            name={'editor-' + __editor_id_index++}
                            mode={this.state.mode}
                            theme={this.state.theme}
                            fontSize={this.state.font}
                            value={this.value}
                            onChange={this.onValueChange}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <DropdownButton dropup title={'mode: ' + this.state.mode}>
                            {this.modes.map((mode, i) => {
                                if (mode === this.state.mode) return <MenuItem disabled key={i}>{mode}</MenuItem>
                                return <MenuItem key={i} onClick={() => this.setState({ mode: mode })}>{mode}</MenuItem>
                            })}
                        </DropdownButton>
                        <DropdownButton dropup title={'theme: ' + this.state.theme}>
                            {this.themes.map((theme, i) => {
                                if (theme === this.state.theme) return <MenuItem disabled key={i}>{theme}</MenuItem>
                                return <MenuItem key={i} onClick={() => this.setState({ theme: theme })}>{theme}</MenuItem>
                            })}
                        </DropdownButton>
                        <DropdownButton dropup title={'font: ' + this.state.font}>
                            {this.fonts.map((font, i) => {
                                if (font === this.state.font) return <MenuItem disabled key={i}>{font}</MenuItem>
                                return <MenuItem key={i} onClick={() => this.setState({ font: font })}>{font}</MenuItem>
                            })}
                        </DropdownButton>
                    </Col>
                </Row>
            </Grid>
        )
    }
}
