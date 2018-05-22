import React from 'react'
import { connect } from 'react-redux'

import Draggable from 'react-draggable'
import FauxDOM from 'react-faux-dom'
import * as d3 from 'd3'

import { setObjectsContext } from '../reducers/inspector'


@connect(state => ({ debug: state.debug }))
export default class Inspector extends React.Component {

    render() {
        let { debug } = this.props

        let frameResponses = debug.responses.filter(response => response.event === 'frame')
        if (frameResponses.length === 0) return null

        let lastFrameResponse = frameResponses.slice(-1)[0]
        let { heapObjects, heapReferences } = this.generateHeapObjectsAndReferences(lastFrameResponse.value.locals)
        let { stackFrames, stackReferences } = this.generateStackFramesAndReferences(lastFrameResponse.value.locals)

        let referencedObjects = Object.keys(heapObjects)
            .filter(ref =>
                heapReferences[ref] && heapReferences[ref].count > 0 ||
                stackReferences[ref] && stackReferences[ref].count > 0
            )
            .map(ref => heapObjects[ref])
        //{stackFrames}
        return <div className='row m-0 p-0 h-100'>
            <div className='col-3 m-0 p-1 h-100 border'>
                {stackFrames}
            </div>
            <div className='col-9 m-0 p-1 h-100 border' style={{ overflow: 'auto', zoom: 0.75 }}>
                <div className='p-1' style={{ height: '1000px', width: '1000px' }}>
                    {referencedObjects}
                </div>
            </div>
        </div>
    }

    generateHeapObjectsAndReferences(locals) {
        let objects = {}
        let references = {}
        Object.keys(locals.objects)
            .forEach(ref => objects[ref] = this.generateObject(locals.objects[ref], locals, references))
        return { heapObjects: objects, heapReferences: references }
    }

    generateObject(object, locals, references) {
        let isUserDefinedInstance = locals.classes.indexOf(object.type) !== -1
        let isHorizontalListed = ['list', 'tuple', 'set'].indexOf(object.type) !== -1
        let isOnlyValueShowed = object.type == 'set'
        let {
            _style = {},
            _varsStyle = {},
            _varStyle = {},
            _varHides = [],
            _varInside = []
        } = object.injects

        let contents = Object.values(object.members)
            .filter(([name, _]) => !isUserDefinedInstance || _varHides.indexOf(this.generateVariableName(name)) === -1)
            .map(([name, value]) => {
                let varName = isUserDefinedInstance
                    ? this.generateVariableName(name)
                    : this.generateVariableValue(name, locals, references)
                let varValue = this.generateVariableValue(
                    value,
                    locals,
                    references,
                    undefined,
                    isUserDefinedInstance && _varInside.indexOf(varName) !== -1
                )
                return <div
                    className={(isHorizontalListed ? 'd-table-cell' : 'd-table-column') + ' align-top p-1'}
                    style={
                        isUserDefinedInstance
                            ? { ..._varsStyle, ..._varStyle[this.generateVariableName(name)] }
                            : null
                    }
                >
                    <span className='align-top'>{!isOnlyValueShowed ? varName + ': ' : null}</span>
                    <span>{varValue}</span>
                </div>
            })

        return <div
            className='d-inline-block border p-1 btn-primary'
            style={isUserDefinedInstance ? { ..._style } : null}
        >
            <h5>{object.type}</h5>
            {contents}
        </div>
    }

    generateStackFramesAndReferences(locals) {
        let frames = []
        let references = {}
        Object.values(locals.stack)
            .forEach(frame => frames.push(this.generateFrame(frame, locals, references)))
        return { stackFrames: frames, stackReferences: references }
    }

    generateFrame(frame, locals, references) {
        let {
            _style = {},
            _varsStyle = {},
            _varStyle = {},
            _varHides = [],
            _varInside = []
        } = frame.injects

        let contents = Object.values(frame.variables)
            .filter(([name, _]) => _varHides.indexOf(this.generateVariableName(name)) === -1)
            .map(([name, value]) => {
                let varValue = this.generateVariableValue(
                    value,
                    locals,
                    references,
                    undefined,
                    _varInside.indexOf(name) !== -1
                )
                return <tr>
                    <th scope='col'>{name}</th>
                    <th scope='col'>{varValue}</th>
                </tr>
            })

        return <table className='table table-sm table-hover table-striped table-bordered' style={{ ..._style }}>
            <thead className='thead-light'>
                <tr>
                    <th scope='col'>{frame.name}</th>
                    <th scope='col'>{'value'}</th>
                </tr>
            </thead>
            <tbody>
                {contents}
            </tbody>
        </table >
    }

    generateVariableName(name) {
        return name.substring(1, name.length - 1)
    }

    generateVariableValue(variable, locals, references, crop = 8, inside = false) {
        if (variable instanceof Array) {
            if (inside) {
                let object = locals.objects[variable[0]]
                let isUserDefinedInstance = locals.classes.indexOf(object.type) !== -1
                if (!isUserDefinedInstance) return this.generateObject(object, locals)
                // inside rendering only works with user objects containing python objects
            }
            // lazily puts spawn reference in references map
            if (references[variable[0]] === undefined) references[variable[0]] = { count: 0, spans: [] }
            references[variable[0]].count++
            return <span ref={ref => references[variable[0]].spans.push(ref)}>::</span>
        }
        variable = variable.toString()
        return variable.length > crop ? variable.substring(0, crop - 2) + '..' : variable
    }




    asdfrenderHeap() {
        let { debug } = this.props

        let frameResponses = debug.responses.filter(response => response.event === 'frame')
        if (frameResponses.length === 0) return null

        let lastFrameResponse = frameResponses.slice(-1)[0]
        let objects = Object.values(lastFrameResponse.value.locals.objects).map(
            object => this.renderHeapObject(object, lastFrameResponse.value.locals.usercls)
        )

        return <div className='w-100 h-100' style={{ overflow: 'auto' }}>
            <div className='p-1' style={{ height: '1000px', width: '1000px' }}>
                {objects}
            </div>
        </div>
    }

    rasdfenderHeapObject(object, userClasses) {
        if (object.type === 'tuple' || object.type === 'list') {
            return <Draggable bounds="parent">
                <div className="border p-2 btn-primary" style={{ display: "inline-block" }}>
                    <h5>{object.type}</h5>
                    <div>{
                        Object.values(object.members).map(
                            (value, i) => <div className='p-1' style={{ display: 'inline' }}>
                                <sup><small>{value[0] + ' '}</small></sup>{value[1] instanceof Array ? '::' : value[1]}
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
                                <small>{value[0] instanceof Array ? '::' : value[0] + ' '}</small>{value[1] instanceof Array ? '::' : value[1]}
                            </div>
                        )
                    }</div>
                </div>
            </Draggable>
        } else if (object.type === 'set') {
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
                                            ? object.members[(i * boxSide + j)][1] instanceof Array ? '::' : object.members[(i * boxSide + j)][1]
                                            : null
                                    } </div>
                                })
                            }</div>
                        })
                    }</div>
                </div>
            </Draggable>
        } else if (userClasses.indexOf(object.type) >= 0) {
            let style = object.members.filter(member => member[0] == '\'style\'')[0]
            return <Draggable bounds="parent">
                <div className="border p-2 btn-primary" style={{ ...style, display: "inline-block" }}>
                    <h5>{object.type}</h5>
                    <div>{
                        Object.values(object.members).filter(member => member[0] !== '\'style\'').map(
                            (value, i) => <div className='p-1' style={{ display: 'block' }}>
                                <small>{value[0].substring(1, value[0].length - 1) + ' '}</small>{value[1] instanceof Array ? '::' : value[1]}
                            </div>
                        )
                    }</div>
                </div>
            </Draggable>
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
        svg.append('path').attr('d', pathData).style('fill', null)

        return dom.toReact()
    }
}
