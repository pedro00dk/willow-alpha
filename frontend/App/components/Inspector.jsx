import React from 'react'
import { connect } from 'react-redux'
import Draggable from 'react-draggable'

import { setObjectContext, objectDrag } from '../reducers/inspector'
import { isNullOrUndefined } from 'util';


@connect(state => ({ debug: state.debug }))
export default class Inspector extends React.Component {

    constructor(props) {
        super(props)
    }

    componentDidUpdate() {
        let { dispatch } = this.props

        dispatch(
            setObjectContext(
                this.heapObjectsReferences,
                this.heapVariableReferences,
                this.stackVariableReferences
            )
        )
    }

    render() {
        let { dispatch, debug } = this.props

        let frameResponses = debug.responses.filter(response => response.event === 'frame')
        if (frameResponses.length === 0) return null

        let lastFrameResponse = frameResponses.slice(-1)[0]
        let {
            reactObjects,
            heapObjectsReferences,
            heapVariableReferences
        } = this.generateHeapObjectsAndReferences(lastFrameResponse.value.locals)
        let {
            reactFrames,
            stackVariableReferences
        } = this.generateStackFramesAndReferences(lastFrameResponse.value.locals)

        let referencedReactObjects = Object.keys(reactObjects)
            .filter(ref =>
                heapVariableReferences[ref] && heapVariableReferences[ref].count > 0 ||
                stackVariableReferences[ref] && stackVariableReferences[ref].count > 0
            )
            .map(ref => reactObjects[ref])

        this.heapObjectsReferences = heapObjectsReferences
        this.heapVariableReferences = heapVariableReferences
        this.stackVariableReferences = stackVariableReferences

        return <div className='row m-0 p-0 h-100'>
            <div className='col-3 m-0 p-1 h-100 border'>
                {reactFrames}
            </div>
            <div className='col-9 m-0 p-1 h-100 border' style={{ overflow: 'auto', zoom: 0.75 }}>
                <div className='p-1' style={{ height: '1000px', width: '1000px' }}>
                    {
                        referencedReactObjects.map(object =>
                            <Draggable onDrag={event => dispatch(objectDrag())} bounds='parent'>
                                {object}
                            </Draggable>
                        )
                    }
                </div>
            </div>
            <div className='p-fixed' style={{position: 'fixed', top: 0, left: 0, zIndex: -1, pointerEvents: 'none' }}>
                <InspectorPathDrawer />
            </div>
        </div>
    }

    generateHeapObjectsAndReferences(locals) {
        let reactObjects = {}
        let heapObjectsReferences = {}
        let heapVariableReferences = {}
        Object.keys(locals.objects)
            .forEach(ref =>
                reactObjects[ref] = this.generateObject(
                    locals.objects[ref],
                    locals,
                    heapObjectsReferences,
                    heapVariableReferences
                )
            )
        return {
            reactObjects: reactObjects,
            heapObjectsReferences: heapObjectsReferences,
            heapVariableReferences: heapVariableReferences
        }
    }

    generateObject(object, locals, objectsReferences, variableReferences) {
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
                    : this.generateVariableValue(name, locals, variableReferences)
                let varValue = this.generateVariableValue(
                    value,
                    locals,
                    variableReferences,
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
            ref={ref => objectsReferences ? objectsReferences[object.ref] = ref : null}
        >
            <h5>{object.type}</h5>
            {contents}
        </div>
    }

    generateStackFramesAndReferences(locals) {
        let reactFrames = []
        let stackVariableReferences = {}
        Object.values(locals.stack)
            .forEach(frame => reactFrames.push(this.generateFrame(frame, locals, stackVariableReferences)))
        return { reactFrames: reactFrames, stackVariableReferences: stackVariableReferences }
    }

    generateFrame(frame, locals, variableReferences) {
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
                    variableReferences,
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

    generateVariableValue(variable, locals, variableReferences, crop = 8, inside = false) {
        if (variable instanceof Array) {
            if (inside) {
                let object = locals.objects[variable[0]]
                let isUserDefinedInstance = locals.classes.indexOf(object.type) !== -1
                if (!isUserDefinedInstance) return this.generateObject(object, locals, undefined, variableReferences)
                // inside rendering only works with user objects containing python objects
            }
            // lazily puts spawn reference in references map
            if (variableReferences[variable[0]] === undefined) variableReferences[variable[0]] = { count: 0, spans: [] }
            variableReferences[variable[0]].count++ // count can used before the lazy spans reference push 
            return <span ref={ref => variableReferences[variable[0]].spans.push(ref)}>::</span>
        }
        variable = variable.toString()
        return variable.length > crop ? variable.substring(0, crop - 2) + '..' : variable
    }
}


@connect(state => ({ inspector: state.inspector }))
class InspectorPathDrawer extends React.Component {

    render() {
        let { inspector } = this.props
        let {
            heapObjectsReferences,
            heapVariableReferences,
            stackVariableReferences
        } = inspector

        let pathsDs = this.generatePathsDs(heapObjectsReferences, heapVariableReferences, stackVariableReferences)
        console.log(pathsDs)

        return <svg width='1000' height='1000' viewBox='0 0 1000 1000'>
            {pathsDs.map(d => <path d={d} stroke='black' z="1" fill='transparent' />)}
        </svg>
    }

    generatePathsDs(heapObjectsReferences, heapVariableReferences, stackVariableReferences) {
        if (!heapObjectsReferences || !heapVariableReferences || !stackVariableReferences) return []
        let objectsBoundRects = {}
        Object.keys(heapObjectsReferences)
            .forEach(ref => objectsBoundRects[ref] = heapObjectsReferences[ref].getBoundingClientRect())

        let paths = []
        Object.keys(heapVariableReferences)
            .forEach(ref => {
                heapVariableReferences[ref].spans
                    .filter(span => !isNullOrUndefined(span))
                    .forEach(span => paths.push([span.getBoundingClientRect(), objectsBoundRects[ref]]))
            })
        Object.keys(stackVariableReferences)
            .forEach(ref => {
                stackVariableReferences[ref].spans
                    .filter(span => !isNullOrUndefined(span))
                    .forEach(span => paths.push([span.getBoundingClientRect(), objectsBoundRects[ref]]))
            })
        return paths.map(([refBB, objBB]) => {
            let fromX = (refBB.left + refBB.right) / 2
            let fromY = (refBB.top + refBB.bottom) / 2
            return `M ${fromX} ${fromY} L ${objBB.left} ${objBB.top}`
        })
    }
}
