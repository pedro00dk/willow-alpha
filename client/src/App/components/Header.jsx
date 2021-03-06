import React from 'react'
import { connect } from 'react-redux'
import { fetchExercises } from '../reducers/exercise'
import { setScript } from '../reducers/script'


class Header0 extends React.Component {

    componentDidMount() {
        const { dispatch } = this.props

        dispatch(fetchExercises())
    }

    render() {
        const { style } = this.props

        return (
            <nav className='navbar navbar-expand navbar-light bg-light' style={style}>
                <a className='navbar-brand' href='#'>
                    Willow
                </a>
                <ul className='navbar-nav mr-auto'>
                    <li className='nav-item dropdown'>
                        <a className='nav-link dropdown-toggle' href='#' id='navbarDropdown' role='button'
                            data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>
                            Exercises
                        </a>
                        <div className='dropdown-menu' aria-labelledby='navbarDropdown'>
                            {this.renderExercisesOptions()}
                        </div>
                    </li>
                </ul>
            </nav>
        )
    }

    renderExercisesOptions() {
        const { dispatch, exercise } = this.props

        if (exercise.isFetching) return <a className='dropdown-item' href='#'>Loading...</a>
        if (!exercise.exercises) return <a className='dropdown-item' href='#'>Failed</a>
        if (exercise.exercises.length === 0) return <a className='dropdown-item' href='#'>Empty</a>
        return exercise.exercises
            .map(
                exercise => <a className='dropdown-item' href='#' onClick={() => dispatch(setScript(exercise.code))}>
                    {exercise.name}
                </a>
            )
    }
}
const Header = connect(state => ({ exercise: state.exercise }))(Header0)
export default Header