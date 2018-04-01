import React from 'react'
import { connect } from 'react-redux'

import { fetchExercises, selectExercise } from '../reducers/exercise'
import { fetchUser, fetchLoginAddress, logoutUser } from '../reducers/user'


@connect(state => ({ exercise: state.exercise, user: state.user }))
export default class Header extends React.Component {

    componentDidMount() {
        let { dispatch, exercise, user } = this.props

        if (!exercise.isFetching && exercise.exercises.length === 0 && exercise.err === undefined)
            dispatch(fetchExercises())
        if (!user.isFetching) dispatch(fetchUser())
        dispatch(fetchLoginAddress())
    }

    render() {
        let { dispatch } = this.props

        return <nav className='navbar navbar-expand navbar-light bg-light' {...this.props}>
            <a className='navbar-brand' href='#' onClick={() => dispatch(selectExercise(null))}>
                Willow
            </a>
            <button className='navbar-toggler' type='button' data-toggle='collapse' data-target='#headerContent'
                aria-controls='headerContent' aria-expanded='false' aria-label='Toggle navigation'>
                <span className='navbar-toggler-icon'></span>
            </button>
            <div className='collapse navbar-collapse' id='headerContent'>
                <ul className='navbar-nav mr-auto'>
                    <li className='nav-item active dropdown'>
                        <a className='nav-link dropdown-toggle' href='#' id='exercisesDropdown' role='button'
                            data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                            Exercises
                        </a>
                        <div className='dropdown-menu' aria-labelledby='exercisesDropdown'>
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
        if (!exercise.exercises)
            return <a className='dropdown-item' href='#'>
                Failed to load
            </a>
        if (exercise.exercises.length === 0)
            return <a className='dropdown-item' href='#'>
                No exercises found
            </a>
        return exercise.exercises.map((exercise, i) =>
            <a className='dropdown-item' href='#' onClick={() => dispatch(selectExercise(exercise.id))}>
                {exercise.name}
            </a>
        )
    }

    renderUserOptions() {
        let { dispatch, user } = this.props

        if (user.isFetching)
            return <li className='nav-item'>
                Loading
            </li>
        if (!user.id)
            return <li className='nav-item active'>
                <a className='nav-link' href={user.link ? user.link : '#'}>
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
