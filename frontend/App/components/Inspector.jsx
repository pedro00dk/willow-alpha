import React from 'react'
import { connect } from 'react-redux'

import ReactFauxDOM from 'react-faux-dom'
import * as d3 from 'd3'

export default class Inspector extends React.Component {

    render() {
        let dom = ReactFauxDOM.createElement('div')
        let svg = d3.select(dom)
            .append('svg')
            .attr('width', 500)
            .attr('height', 200);
        let text = svg.append('text')
            .text('Hello world!')
            .attr('dy', '0.35em')
            .attr('transform', 'translate(100, 100)');
        let r = dom.toReact()
        return r
    }
}