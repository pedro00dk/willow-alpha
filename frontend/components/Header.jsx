import React from 'react'
import { render } from 'react-dom'
import { Navbar, NavbarBrand, Nav, NavItem, NavDropdown, MenuItem } from 'react-bootstrap'
import { connect } from 'react-redux'

import { fetchExercises } from '../reducers/exercise'
import { selectExercise } from '../reducers/selectExercise'
import { fetchUser, logoutUser } from '../reducers/user'


@connect(state => ({ exercise: state.exercise, user: state.user }))
export default class Header extends React.Component {

    componentDidMount() {
        let { dispatch, exercise, user } = this.props
        if (!exercise.isFetching && exercise.exercises.length === 0 && exercise.err === undefined)
            dispatch(fetchExercises())
        if (!user.isFetching) dispatch(fetchUser())
    }

    renderExercises() {
        let { dispatch, exercise } = this.props
        if (exercise.isFetching) return (<MenuItem>Loading...</MenuItem>)
        if (exercise.exercises === null) return (<MenuItem>Failed to load exercises</MenuItem>)
        if (exercise.exercises.length === 0) return (<MenuItem>No exercises registered</MenuItem>)
        return exercise.exercises.map((exercise, i) => {
            return (
                <MenuItem onClick={() => dispatch(selectExercise(exercise.id))}>
                    {exercise.name}
                </MenuItem>
            )
        })
    }

    renderLoginUser() {
        let { dispatch, user } = this.props
        if (user.isFetching) return (<NavItem>Loading</NavItem>)
        if (user.id === null) return (<NavItem href={'auth/login/google-oauth2'}>Log in</NavItem>)
        return [
            <NavItem>{user.email}</NavItem>,
            <NavItem onClick={() => dispatch(logoutUser())}>logout</NavItem>
        ]
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
                        <NavDropdown title={'Exercises'}>
                            {this.renderExercises()}
                        </NavDropdown>
                    </Nav>
                    <Nav pullRight>
                        {this.renderLoginUser()}
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        )
    }
}