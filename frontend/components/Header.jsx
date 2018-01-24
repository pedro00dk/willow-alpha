// #TODO Exercises dropdown

import React from 'react'
import { render } from 'react-dom'
import Radium from 'radium'

import logo from './header/logo.png'


export default class Header extends React.Component {

    constructor(props) {
        super(props)

        this.themes = ['dark', 'light']
        this.state = {
            theme: this.themes[0]
        }
    }

    render() {
        return (
            <nav className={'navbar navbar-expand navbar-' + this.state.theme + ' bg-' + this.state.theme}>
                <a className='navbar-brand' href='#'>
                    <img width='60px' height='45px' src={logo} />
                </a>
                <button className='navbar-toggler' type='button' dataToggle='collapse' dataTarget='#navbarNavAltMarkup' ariaControls='navbarNavAltMarkup' aria-expanded='false' aria-label='Toggle navigation'>
                    <span className='navbar-toggler-icon'></span>
                </button>
                <div className='collapse navbar-collapse' id='navbarNavAltMarkup'>
                    <div className='navbar-nav'>
                        <a className='nav-item nav-link active' href='#'>Willow <span className='sr-only'>(current)</span></a>
                        <li className='nav-item'>
                            <a className='nav-link dropdown-toggle' href='#' dataToggle='dropdown' ariaHaspopup='true' ariaExpanded='false'>
                                Exercises
                            </a>
                            <div className='dropdown-menu'>
                                <a className='dropdown-item' href='#'>Exercise 1</a>
                                <a className='dropdown-item' href='#'>Exercise 2</a>
                                <a className='dropdown-item' href='#'>Exercise 3</a>
                            </div>
                        </li>
                    </div>
                    <div className='navbar-nav ml-auto'>
                        <a className='nav-item nav-link disabled' href='#'>Log in</a>
                    </div>
                </div>
            </nav>
        )
    }
}