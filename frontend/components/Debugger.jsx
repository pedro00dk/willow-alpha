import React from 'react'
import { render } from 'react-dom'

import playButton from './debugger/playButton.png'
import stepoverButton from './debugger/stepoverButton.png'
import stepintoButton from './debugger/stepintoButton.png'
import stepoutButton from './debugger/stepoutButton.png'
import restartButton from './debugger/restartButton.png'
import stopButton from './debugger/stopButton.png'



const styles = {
    bar: {
        height: '35px',
        backgroundColor: '#333'
    },
    button: {
        width: '35px',
        height: '35px'
    }
}



export default class Debugger extends React.Component {

    render() {
        return (
            <div className='col-md-12' style={styles.bar}>
                <img style={styles.button}
                    src={playButton}
                />
                <img style={styles.button}
                    src={stepoverButton}
                />
                <img style={styles.button}
                    src={stepintoButton}
                />
                <img style={styles.button}
                    src={stepoutButton}
                />
                <img style={styles.button}
                    src={restartButton}
                />
                <img style={styles.button}
                    src={stopButton}
                />
            </div>
        )
    }
}