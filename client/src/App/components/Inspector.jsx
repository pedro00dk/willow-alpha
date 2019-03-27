import React from 'react'
import { connect } from 'react-redux'
import Draggable from 'react-draggable'
import SplitPane from 'react-split-pane'

import { setObjectContext, objectDrag } from '../reducers/inspector'
import { isNullOrUndefined } from 'util';

class InspectorPathDrawer0 extends React.Component {

    componentWillMount() {
        this.updater = window.setInterval(
            () => {
                let { dispatch, inspector } = this.props

                if (dispatch && inspector) dispatch(objectDrag())
            },
            100
        )
    }

    componentWillUnmount() {
        window.clearInterval(this.updater)
    }

    render() {
        let { inspector } = this.props
        let { heapObjectsReferences, heapVariableReferences, stackVariableReferences } = inspector
        let pathsDs = this.generatePathsDs(heapObjectsReferences, heapVariableReferences, stackVariableReferences)

        return <svg className='position-fixed' style={{ left: 0, top: 0, zIndex: -1 }} width='100vw' height='100vh'>
            <defs>
                <marker id='Arrow'
                    markerWidth='5' markerHeight='5' viewBox='-6 -6 12 12'
                    refX='-2' refY='0'
                    markerUnits='strokeWidth'
                    orient='auto'>
                    <polygon points='-2,0 -5,5 5,0 -5,-5' fill='red' stroke='black' strokeWidth='1px' />
                </marker>
            </defs>
            {pathsDs.map((d, i) => <path strokeWidth='3' fill='none' stroke='black' d={d} marker-end='url(#Arrow)' />)}
        </svg >
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
            let toX = objBB.left + 10
            let toY = objBB.top + 15

            let middleX = (fromX + toX) / 2
            let middleY = (fromY + toY) / 2
            let crossX = (toY - fromY) / 5
            let crossY = -(toX - fromX) / 5
            if (crossY > 0) {
                crossX *= -1
                crossY *= -1
            }
            let controlX = middleX + crossX
            let controlY = middleY + crossY
            return `M${fromX},${fromY} Q${controlX},${controlY} ${toX},${toY}`
        })
    }
}
const InspectorPathDrawer = connect(state => ({ inspector: state.inspector }))(InspectorPathDrawer0)

class Inspector0 extends React.Component {

    componentDidUpdate() {
        let { dispatch } = this.props

        dispatch(
            setObjectContext(this.heapObjectsReferences, this.heapVariableReferences, this.stackVariableReferences)
        )
    }

    shouldComponentUpdate(nextProps, nextState) {
        let { debug } = nextProps

        return !debug.isFetching
    }

    render() {
        let { dispatch, debug } = this.props

        let frameResponses = debug.responses.filter(response => response.event === 'frame')
        let lastFrameResponse = frameResponses.slice(-1)[0]
        let {
            reactObjects, heapObjectsReferences, heapVariableReferences
        } = this.generateHeapObjectsAndReferences(lastFrameResponse ? lastFrameResponse.value.locals : undefined)
        let {
            reactFrames, stackVariableReferences
        } = this.generateStackFramesAndReferences(lastFrameResponse ? lastFrameResponse.value.locals : undefined)
        let referencedReactObjects = Object.keys(reactObjects)
            .filter(ref =>
                heapVariableReferences[ref] && heapVariableReferences[ref].count > 0 ||
                stackVariableReferences[ref] && stackVariableReferences[ref].count > 0
            )
            .map(ref => reactObjects[ref])
        this.heapObjectsReferences = heapObjectsReferences
        this.heapVariableReferences = heapVariableReferences
        this.stackVariableReferences = stackVariableReferences

        return <div>
            <SplitPane
                split={'vertical'}
                minSize={'5%'}
                maxSize={'95%'}
                defaultSize={'20%'}
                className={'border'}
                style={{ fontFamily: 'monospace', fontSize: 12, opacity: 0.75 }}
                resizerClassName={'border'}
            >
                {reactFrames}
                {
                    referencedReactObjects.map(object =>
                        <Draggable
                            onDrag={event => dispatch(objectDrag())}
                            bounds={'parent'}
                        >
                            {object}
                        </Draggable>
                    )
                }
            </SplitPane>
            <InspectorPathDrawer />
        </div>
    }

    generateHeapObjectsAndReferences(locals) {
        let reactObjects = {}
        let heapObjectsReferences = {}
        let heapVariableReferences = {}

        if (locals) {
            Object.keys(locals.objects)
                .forEach(ref =>
                    reactObjects[ref] = this.generateObject(
                        locals.objects[ref], locals, heapObjectsReferences, heapVariableReferences
                    )
                )
        }

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
                        isUserDefinedInstance ? { ..._varsStyle, ..._varStyle[this.generateVariableName(name)] } : null
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

        if (locals) {
            Object.values(locals.stack)
                .forEach(frame => reactFrames.push(this.generateFrame(frame, locals, stackVariableReferences)))
        }

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
                    value, locals, variableReferences, undefined, _varInside.indexOf(name) !== -1
                )
                return <tr>
                    <th scope='col'>{name}</th>
                    <th scope='col'>{varValue}</th>
                </tr>
            })

        return <table
            className='table table-sm table-hover table-striped table-bordered'
            style={_style}>
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
        variable = variable !== null ? variable.toString() : 'None'
        return variable.length > crop ? variable.substring(0, crop - 2) + '..' : variable
    }
}
const Inspector = connect(state => ({ debug: state.debug }))(Inspector0)
export default Inspector