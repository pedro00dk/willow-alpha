import React from 'react'
import { connect } from 'react-redux'

import ReactFauxDOM from 'react-faux-dom'
import * as d3 from 'd3'


@connect(state => ({debug: state.debug}))
export default class Inspector extends React.Component {

    constructor(props) {
        super(props)

        this.dom = ReactFauxDOM.createElement('svg')
        this.svg = d3.select(this.dom)
            .attr('width', '100%')
            .attr('height', '100%')
    }

    render() {
        let text = this.svg.append('text')
            .text('Hello world!')
            .attr('dy', '0.35em')
            .attr('transform', 'translate(100, 100)');

        return this.dom.toReact()
    }
}