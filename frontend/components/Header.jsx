import React from 'react'
import { render } from 'react-dom'
import { Navbar, NavbarBrand, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap'
import { connect } from 'react-redux'

import { fetchExercises } from '../reducers/exercise'


@connect(state => ({ exercise: state.exercise }))
export default class Header extends React.Component {

    componentDidMount() {
        let { dispatch, exercise } = this.props
        if (!exercise.isFetching && exercise.exercises.length === 0 && exercise.err === undefined)
        dispatch(fetchExercises())
    }

    renderExercises() {
        let { exercise } = this.props
        if (exercise.isFetching) return <MenuItem>Loading...</MenuItem>
        if (exercise.err !== undefined) return <MenuItem>Error</MenuItem>
        if (exercise.exercises.length === 0) return <MenuItem>Exercises empty</MenuItem>
        return exercise.exercises.map((exercise, i) => <MenuItem>{exercise.name}</MenuItem>)
    }

    render() {
        return (
            <Navbar fluid collapseOnSelect style={{ marginBottom: '0px' }}>
                <Navbar.Header>
                    <Navbar.Brand>
                        <a href='#'>Willow</a>
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
                        <NavItem href='#'>
                            Sign up
                        </NavItem>
                        <NavItem href='#'>
                            Log in
                        </NavItem>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}