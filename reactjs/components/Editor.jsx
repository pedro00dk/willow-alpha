import React from 'react'
import { render } from 'react-dom'

import brace from 'brace'
import AceEditor from 'react-ace'

const __langs = ['python']
__langs.forEach((lang) => {
    require('brace/mode/' + lang)
    require('brace/snippets/' + lang)
})
const __themes = ['github', 'xcode', 'monokai', 'terminal']
__themes.forEach((theme) => {
    require('brace/theme/' + theme)
})



const styles = {
    editor: {
        width: '-1px'
    },
    infoBar: {
        height: '20px',
        backgroundColor: '#08B',
        color: '#FFF'
    },
    infoBarElement: {
        cursor: 'pointer',
        verticalAlign: 'middle'
    },
    rightInfoBarElement: {
        float: 'right',
        verticalAlign: 'middle'
    }
}



export default class Editor extends React.Component {

    constructor(props) {
        super(props)
        this.value = ''
        this.themes = ['github', 'xcode', 'monokai', 'terminal']
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
            <div className='col-md-12' >
                <AceEditor style={styles.editor}
                    name='editor'
                    mode='python'
                    value={this.value}
                    onChange={this.onValueChange}
                    theme={this.state.theme}
                    fontSize={this.state.fontSize}
                />
                <div className='col-md-12' style={styles.infoBar}
                >
                    <div style={styles.infoBarElement}
                        onClick={this.nextTheme}
                    >
                        {this.state.theme}
                    </div>
                    <div style={styles.infoBarElement}
                        onClick={this.nextFontSize}
                    >
                        {this.state.fontSize}
                    </div>
                </div>
            </div >
        )
    }
}
