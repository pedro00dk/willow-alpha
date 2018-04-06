import React from 'react'
import { connect } from 'react-redux'

import Draggable from 'react-draggable'
import FauxDOM from 'react-faux-dom'
import * as d3 from 'd3'

@connect(state => ({ debug: state.debug }))
export default class Inspector extends React.Component {

    render() {
        return <div className='row m-0 p-0 h-100'>
            <div className='position-absolute w-100  h-100'>
                {this.renderPaths()}
            </div>
            <div className='col-3 m-0 p-0 h-100 border' style={{ overflow: 'auto' }}>
                {this.renderStack()}
            </div>
            <div className='col-9 m-0 p-1 h-100 border' style={{ overflow: 'auto' }}>
                {this.renderHeap()}
            </div>
        </div>
    }


    renderStack() {
        let { debug } = this.props

        let frameResponses = debug.responses.filter(response => response.event === 'frame')
        if (frameResponses.length === 0) return null

        let lastFrameResponse = frameResponses.slice(-1)[0]
        return lastFrameResponse.value.locals.stack.map(({ name, variables }) => this.renderStackFrame(name, variables))
    }

    renderStackFrame(name = 'frame', variables = []) {
        return <table className='table table-sm table-hover table-striped table-bordered'>
            <thead className='thead-light'>
                <tr>
                    <th scope='col'>{name.length > 10 ? name.substring(0, 8) + '..' : name}</th>
                    <th scope='col'>{'value'}</th>
                </tr>
            </thead>
            <tbody>{
                Object.keys(variables).map(name => {
                    return <tr>
                        <th scope='col'>{name.length > 10 ? name.substring(0, 8) + '..' : name}</th>
                        <th scope='col'>{
                            variables[name] instanceof Array
                                ? <span ref={variables[name][0]}>::</span>
                                : variables[name]
                        }
                        </th>
                    </tr>
                })
            }</tbody>
        </table >
    }

    renderHeap() {
        let { debug } = this.props

        let frameResponses = debug.responses.filter(response => response.event === 'frame')
        if (frameResponses.length === 0) return null

        let lastFrameResponse = frameResponses.slice(-1)[0]
        let objects = Object.values(lastFrameResponse.value.locals.objects).map(object => this.renderHeapObject(object))

        return <div className='w-100 h-100' style={{ overflow: 'auto' }}>
            <div className='p-1' style={{ height: '1000px', width: '1000px' }}>
                {objects}
            </div>
        </div>
    }

    renderHeapObject(object) {
        if (object.type === 'list') {
            return <Draggable bounds="parent">
                <div className="border p-2 btn-primary" style={{ display: "inline-block" }}>
                    <h5>{object.type}</h5>
                    <div>{
                        Object.values(object.members).map(
                            (value, i) => <div className='p-1' style={{ display: 'inline' }}>
                                <sup><small>{value[0] + ' '}</small></sup>{value[1]}
                            </div>
                        )
                    }</div>
                </div>
            </Draggable>
        } else if (object.type === 'dict') {
            return <Draggable bounds="parent">
                <div className="border p-2 btn-primary" style={{ display: "inline-block" }}>
                    <h5>{object.type}</h5>
                    <div>{
                        Object.values(object.members).map(
                            (value, i) => <div className='p-1' style={{ display: 'block' }}>
                                <small>{value[0] + ' '}</small>{value[1]}
                            </div>
                        )
                    }</div>
                </div>
            </Draggable>
        } else if (object.type === 'set' || object.type === 'frozenset') {
            let boxSide = Math.ceil(Math.sqrt(object.members.length))
            return <Draggable bounds="parent">
                <div className="border p-2 btn-primary" style={{ display: "inline-block" }}>
                    <h5>{object.type}</h5>
                    <div>{
                        Array(boxSide).fill().map((_, i) => {
                            return <div className='p-1' style={{ display: 'block' }}>{
                                Array(boxSide).fill().map((_, j) => {
                                    return <div className='p-1' style={{ display: 'inline' }}>{
                                        (i * boxSide + j) < object.members.length
                                            ? object.members[(i * boxSide + j)][1]
                                            : null
                                    } </div>
                                })
                            }</div>
                        })
                    }</div>
                </div>
            </Draggable>
        } else if (object.type) {

        }
    }

    renderPaths() {
        let dom = new FauxDOM.Element('div')
        let svg = d3.select(dom).append('svg')
            .attr('width', 200)
            .attr('height', 200)

        let lineGenerator = d3.line().curve(d3.curveCardinal)
        let points = [
            [0, 80],
            [100, 100],
            [200, 30]
        ]
        var pathData = lineGenerator(points)
        //svg.append('path').attr('d', pathData).style('fill', null)

        return dom.toReact()
    }
}
