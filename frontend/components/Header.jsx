import React from 'react'
import { render } from 'react-dom'
import { Navbar, NavbarBrand, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap'
import { connect } from 'react-redux'

import { fetchExercises } from '../reducers/exercise'
import { selectExercise } from '../reducers/selectExercise'
import { fetchUser } from '../reducers/user'


@connect(state => ({ exercise: state.exercise, user: state.user }))
export default class Header extends React.Component {

    componentDidMount() {
        let { dispatch, exercise, user } = this.props
        if (!exercise.isFetching && exercise.exercises.length === 0 && exercise.err === undefined)
            dispatch(fetchExercises())
        dispatch(fetchUser())
    }
    
    renderExercises() {
        let { dispatch, exercise } = this.props
        
        if (exercise.isFetching) return <MenuItem>Loading...</MenuItem>
        if (exercise.err !== undefined) return <MenuItem>Error</MenuItem>
        if (exercise.exercises.length === 0) return <MenuItem>Exercises empty</MenuItem>
        return exercise.exercises.map((exercise, i) => {
            return <MenuItem key={i} onClick={() => dispatch(selectExercise(exercise.id))}>{exercise.name}</MenuItem>
        })
    }
    
    renderUser() {
        let { user } = this.props
        if (!user.isUserLogged) return <NavItem href={'auth/login/google-oauth2'}>Log in</NavItem>
        return <NavItem>{user.email}</NavItem>
    }

    render() {
        let { dispatch } = this.props
        return (
            <Navbar fluid collapseOnSelect style={{ marginBottom: '0px' }}>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a onClick={() => dispatch(selectExercise(null))}>Willow</a>
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav>
                        <NavDropdown id={'header-dropdown-exercises'} title={'Exercises'}>
                            {this.renderExercises()}
                        </NavDropdown>
                    </Nav>
                    <Nav pullRight>
                        {this.renderUser()}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}