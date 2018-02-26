import React from 'react'
import { connect } from 'react-redux'


@connect(state => ({ debug: state.debug }))
export default class Inspector extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return <div></div>
    }
}
