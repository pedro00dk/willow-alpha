import React from 'react'

import DebugBar from '../components/DebugBar'
import Header from '../components/Header'
import InputEditor from '../components/InputEditor'
import Inspector from '../components/Inspector'
import OutputEditor from '../components/OutputEditor'
import ScriptEditor from '../components/ScriptEditor'


export default class AppContainer extends React.Component {

    render() {
        return <div className='container-fluid p-0'>
            <Header style={{ height: '8vh' }}/>
            <div className='row m-0'>
                <DebugBar style={{ height: '8vh' }}/>
            </div>
            <div className='row m-0'>
                <div className='col-6 border p-0'>
                    <ScriptEditor style={{ width: '100%', height: '60vh' }} />
                </div>
                <div className='col-6 border  p-0'>
                    <Inspector />
                </div>
            </div>
            <div className='row m-0'>
                <div className='col-6 border p-0'>
                    <InputEditor style={{ width: '100%', height: '23vh' }} />
                </div>
                <div className='col-6 border p-0'>
                    <OutputEditor style={{ width: '100%', height: '23vh' }} />
                </div>
            </div>
        </div>
    }
}