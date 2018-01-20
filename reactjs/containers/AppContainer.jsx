import React from 'react'
import Radium from 'radium'

import Editor from '../components/Editor'



const styles = {
    button: {
        cursor: 'pointer',
    },
    counter: {
        color: 'blue',
        fontSize: '20px',
    }
}



@Radium
export default class AppContainer extends React.Component {

    render() {
        return (
            <div style={{width:'100vw', height: '100vh'}}>
                <Editor />
            </div>
        )
    }
}