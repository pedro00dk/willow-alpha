import React from 'react'
import { render } from 'react-dom'

import brace from 'brace'
import AceEditor from 'react-ace'

const __langs = ['python']
__langs.forEach((lang) => {
    require('brace/mode/' + lang)
    require('brace/snippets/' + lang)
})
const __themes = ['monokai', 'github', 'terminal', 'xcode']
__themes.forEach((theme) => {
    require('brace/theme/' + theme)
})


export default class Editor extends React.Component {

    constructor(props) {
        super(props)
        this.value = ''

        this.themes = ['monokai', 'github', 'terminal', 'xcode']
        this.fontSizes = [12, 13, 14, 16, 18, 20, 25, 30]

        this.themeIndex = 0
        this.fontSizeIndex = 0

        this.state = {
            theme: this.themes[0],
            fontSize: this.fontSizes[0]
        }

        // binds
        this.onValueChange = this.onValueChange.bind(this)
        this.nextTheme = this.nextTheme.bind(this)
        this.nextFontSize = this.nextFontSize.bind(this)
    }

    onValueChange(value) {
        this.value = value
    }

    nextTheme() {
        this.themeIndex = (this.themeIndex + 1) % this.themes.length
        this.setState({ theme: this.themes[this.themeIndex] })
    }

    nextFontSize() {
        this.fontSizeIndex = (this.fontSizeIndex + 1) % this.fontSizes.length
        this.setState({ fontSize: this.fontSizes[this.fontSizeIndex] })
    }

    render() {
        return (
            <div className='row no-gutters'>
                <div className='col'>
                    <div className='row'>
                        <AceEditor className='col'
                            name='editor'
                            mode='python'
                            value={this.value}
                            onChange={this.onValueChange}
                            theme={this.state.theme}
                            fontSize={this.state.fontSize}
                        />
                    </div>
                    <div className='row justify-content-start text-light' style={{ height: '20px', backgroundColor: '#222' }}>
                        <div className='col-auto'>
                            <span style={{ cursor: 'pointer' }} onClick={this.nextTheme}>
                                Theme: {this.state.theme}
                            </span>
                        </div>
                        <div className='col-auto'>
                            <span style={{ cursor: 'pointer' }} onClick={this.nextFontSize}>
                                Font: {this.state.fontSize}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
