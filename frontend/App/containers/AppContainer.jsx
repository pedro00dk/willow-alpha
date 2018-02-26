import React from 'react'
import { connect } from 'react-redux'

import DebugBar from '../components/DebugBar'
import Header from '../components/Header'
import InputEditor from '../components/InputEditor'
import Inspector from '../components/Inspector'
import OutputEditor from '../components/OutputEditor'
import ScriptEditor from '../components/ScriptEditor'


@connect(state => ({ theme: state.theme }))
export default class AppContainer extends React.Component {

    render() {
        let { theme } = this.props

        return <div className='container-fluid p-0'>
            <Header style={{ height: '5vh' }} />
            <div className='row m-0'>
                <DebugBar style={{ height: '5vh' }} />
            </div>
            <div className='row m-0'>
                <div className={'col-5 border border-' + theme.theme + ' p-0'}>
                    <ScriptEditor style={{ width: '100%', height: '74.45vh' }} />
                </div>
                <div className={'col-7 border border-' + theme.theme + ' p-0'}>
                    <Inspector />
                </div>
            </div>
            <div className='row m-0'>
                <div className={'col-6 border border-' + theme.theme + ' p-0'}>
                    <InputEditor style={{ width: '100%', height: '15vh' }} />
                </div>
                <div className={'col-6 border border-' + theme.theme + ' p-0'}>
                    <OutputEditor style={{ width: '100%', height: '15vh' }} />
                </div>
            </div>
        </div>
    }
}