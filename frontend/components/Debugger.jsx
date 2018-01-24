import React from 'react'
import { render } from 'react-dom'

import playButton from './debugger/playButton.png'
import stepoverButton from './debugger/stepoverButton.png'
import stepintoButton from './debugger/stepintoButton.png'
import stepoutButton from './debugger/stepoutButton.png'
import restartButton from './debugger/restartButton.png'
import stopButton from './debugger/stopButton.png'


export default class Debugger extends React.Component {

    render() {
        let buttonSize = { width: '35px', height: '35px' }
        return (
            <div className='row no-gutters' style={{ backgroundColor: '#222' }}>
                <div className='col-auto'>
                    <img style={buttonSize} src={playButton} />
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