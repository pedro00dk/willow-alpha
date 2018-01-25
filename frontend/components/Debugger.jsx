import React from 'react'
import { render } from 'react-dom'
import fetch from 'isomorphic-fetch'

import playButton from './debugger/playButton.png'
import stepoverButton from './debugger/stepoverButton.png'
import stepintoButton from './debugger/stepintoButton.png'
import stepoutButton from './debugger/stepoutButton.png'
import restartButton from './debugger/restartButton.png'
import stopButton from './debugger/stopButton.png'


export default class Debugger extends React.Component {

    constructor(props) {
        super(props)

        //binds
        this.run = this.run.bind(this)
    }

    run() {
        let script = {script: 'class X:\n    def __init__(self):\n        pass\n'}

        let scriptString = JSON.stringify(script)
        console.log(scriptString)

        fetch(
            '/run',
            {
                method: 'post',
                headers: {
                    'Content-type': 'application/json; charset=UTF-8'
                },
                body : scriptString
            }
        ).then(function(response) {
            console.log(response)
        })
    }

    render() {
        let buttonSize = { width: '35px', height: '35px' }
        return (
            <div className='row no-gutters' style={{ backgroundColor: '#222' }}>
                <div className='col-auto'>
                    <img onClick={this.run} style={buttonSize} src={playButton} />
                </div>
                <div className='col-auto'>
                    <img style={buttonSize} src={stepoverButton} />
                </div>
                <div className='col-auto'>
                    <img style={buttonSize} src={stepintoButton} />
                </div>
                <div className='col-auto'>
                    <img style={buttonSize} src={stepoutButton} />
                </div>
                <div className='col-auto'>
                    <img style={buttonSize} src={restartButton} />
                </div>
                <div className='col-auto'>
                    <img style={buttonSize} src={stopButton} />
                </div>
            </div>
        )
    }
}