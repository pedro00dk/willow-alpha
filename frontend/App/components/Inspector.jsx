import React from 'react'
import { connect } from 'react-redux'

import Draggable from 'react-draggable'
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc'

@connect(state => ({ debug: state.debug }))
export default class Inspector extends React.Component {

    render() {
        return <div className='row m-0 p-0 h-100'>
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
        if (frameResponses.length === 0)
            return <table className='table table-sm table-hover table-striped'>
                <thead className='thead-light'>
                    <tr>
                        <th scope='col'>frame</th>
                        <th scope='col'>value</th>
                    </tr>
                </thead>
            </table>

        let lastFrameResponse = frameResponses.slice(-1)[0]
        return lastFrameResponse.value.locals.stack.map(
            ({ name, variables }) => <table className='table table-sm table-hover table-striped'>
                <thead className='thead-light'>
                    <tr>
                        <th scope='col'>{name.substring(0, 8)}</th>
                        <th scope='col'>value</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        Object.keys(variables).map(
                            name => <tr>
                                <th scope='col'>{name}</th>
                                <th scope='col'>{variables[name]}</th>
                            </tr>)
                    }
                </tbody>
            </table>
        )
    }

    renderHeap() {
        let { debug } = this.props

        let frameResponses = debug.responses.filter(response => response.event === 'frame')
        if (frameResponses.length === 0) return null

        let lastFrameResponse = frameResponses.slice(-1)[0]

        let objects = Object.values(lastFrameResponse.value.locals.objects).map(
            obj => <Draggable bounds="parent">
                <div className="border p-2 btn-primary" style={{ display: "inline-block" }}>
                    <h5>{obj.type}</h5>
                    <div>
                        {Object.values(obj.members).map(
                            (val, i) => <div className='p-1' style={{ display: 'inline' }}><sup><small>{i + ' '}</small></sup>{val[1]}</div>)}
                    </div>
                </div>
            </Draggable>
        )

        return <div className='w-100 h-100' style={{ overflow: 'auto' }}>
            <div className='p-1' style={{ height: '1000px', width: '1000px' }}>
                {objects}
            </div>
        </div>
    }
}
