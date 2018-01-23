import React from 'react'
import Radium from 'radium'

import Debugger from '../components/Debugger'
import Editor from '../components/Editor'
import Header from '../components/Header'



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
            <div className='content'>
                <div className='row'>
                    <Header />
                    
                    <div className='col-sm-12'>
                        <Debugger />
                    </div>
                    <div className='col-sm-6'>
                        <div className='row'>
                            <Editor />
                        </div>
                    </div>

                    <div className='col-sm-6'>
                        <div className='row'>
                            <div className='col-sm-12'>hello</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}