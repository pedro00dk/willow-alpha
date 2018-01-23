import React from 'react'
import { render } from 'react-dom'
import Radium from 'radium'

import willowLogo from './header/willowLogo.png'



const styles = {
    header: {
        height: '75px',
        backgroundColor: '#222'
    },
    headerElement: {
        display: 'inline-block',
        height: '100%',
        marginLeft: '5px',
        marginRight: '5px',
        verticalAlign: 'middle',
        textAlign: 'center'
    },
    navegableHeaderElementOver: {
        display: 'inline-block',
        height: '100%',
        marginLeft: '5px',
        marginRight: '5px',
        verticalAlign: 'middle',
        textAlign: 'center',
        cursor: 'pointer',
        ':hover': 'background-color: #111'
    },
    headerLogo: {
        height: '100%',
        width: '100px'
    },
    headerText: {
        marginTop: '18px',
        marginBottom: '12px',
        color: '#AAA'
    },
    optionText: {
        marginTop: '22px',
        marginBottom: '8px',
        color: '#AAA'
    }

}



export default class Header extends React.Component {

    render() {
        return (
            <div className='col-sm-12' style={styles.header}>
                <div style={styles.navegableHeaderElement}>
                    <img style={styles.headerLogo}
                        src={willowLogo}
                    />
                </div>
                <div style={styles.headerElement}>
                    <h1 style={styles.headerText}>Willow</h1>
                </div>
                <div style={{ ...styles.navegableHeaderElementOver, float: 'right' }}>
                    <h2 style={styles.optionText}>Log in</h2>
                </div>
                <div style={{...styles.navegableHeaderElementOver, float: 'right' }}>
                    <h2 style={styles.optionText}>Exercises</h2>
                </div>
            </div>

        )
    }
}