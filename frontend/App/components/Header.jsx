import React from 'react'
import { render } from 'react-dom'
import { connect } from 'react-redux'

import { fetchExercises, selectExercise } from '../reducers/exercise'
import { fetchUser, logoutUser } from '../reducers/user'


@connect(state => ({ exercise: state.exercise, user: state.user }))
export default class Header extends React.Component {

    componentDidMount() {
        let { dispatch, exercise, user } = this.props

        if (!exercise.isFetching && exercise.exercises.length === 0 && exercise.err === undefined)
            dispatch(fetchExercises())
        if (!user.isFetching) dispatch(fetchUser())
    }

    render() {
        let { dispatch } = this.props

        return <nav className='navbar navbar-expand-lg navbar-light bg-light'>
            <a className='navbar-brand' href='#' onClick={() => dispatch(selectExercise(null))}>
                Willow
            </a>
            <button className='navbar-toggler' type='button' data-toggle='collapse'
                data-target='#headerContent' aria-controls='headerContent' aria-expanded='false'
                aria-label='Toggle navigation'>
                <span className='navbar-toggler-icon'></span>
            </button>
            <div className='collapse navbar-collapse' id='headerContent'>
                <ul className='navbar-nav mr-auto'>
                    <li className='nav-item active dropdown'>
                        <a className='nav-link dropdown-toggle' href='#' id='navbarDropdown'
                            role='button' data-toggle='dropdown' aria-haspopup='true'
                            aria-expanded='false'>
                            Exercises
                        </a>
                        <div className='dropdown-menu' aria-labelledby='navbarDropdown'>
                            {this.renderExercisesOptions()}
                        </div>
                    </li >
                </ul>
                <ul className='navbar-nav ml-auto'>
                    {this.renderUserOptions()}
                </ul>
            </div>
        </nav>
    }

    renderExercisesOptions() {
        let { dispatch, exercise } = this.props

        if (exercise.isFetching)
            return <a className='dropdown-item' href='#'>
                Loading...
            </a>
        if (exercise.exercises === null)
            return <a className='dropdown-item' href='#'>
                Failed to load
            </a>
        if (exercise.exercises.length === 0)
            return <a className='dropdown-item' href='#'>
                No exercises found
            </a>
        return exercise.exercises.map(e =>
            <a className='dropdown-item' href='#' onClick={() => dispatch(selectExercise(e))}>
                {e.name}
            </a>
        )
    }

    renderUserOptions() {
        let { dispatch, user } = this.props

        if (user.isFetching)
            return <li className='nav-item'>
                Loading
            </li>
        if (user.id === null)
            return <li className='nav-item active'>
                <a className='nav-link' href={'auth/login/google-oauth2'}>
                    Log in
                </a>
            </li>
        return [
            <li className='nav-item'>
                <a className='nav-link'>
                    {user.email}
                </a>
            </li>,
            <li className='nav-item active'>
                <a className='nav-link' href='#' onClick={() => dispatch(logoutUser())}>
                    Log out
                </a>
            </li>
        ]
    }
}
