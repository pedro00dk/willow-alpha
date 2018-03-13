import React from 'react'
import { connect } from 'react-redux'

import Draggable from 'react-draggable'
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc'

export default class Inspector extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return <div><Heap /></div>
    }
}

@connect(state => ({ debug: state.debug }))
class Heap extends React.Component {

    constructor(props) {
        super(props)

        this.state = { lastLocals: { objects: {}, variables: {} } }
    }

    render() {
        let { debug } = this.props

        this.state.lastLocals = debug.responses.length > 0 && debug.responses.slice(-1)[0].event === 'frame'
            ? JSON.parse(debug.responses.slice(-1)[0].value.locals)
            : this.state.lastLocals

        console.log(this.state.lastLocals)
        let objData = Object.values(this.state.lastLocals.objects)
            .map(
                obj => {
                    console.log(obj)
                    return <Draggable bounds="parent">
                        <div className="border p-2 btn-primary" style={{ display: "inline-block" }}>
                            <h5>{obj.type}</h5>
                            <div>
                                {Object.values(obj.members).map(
                                    (val, i) => <div className='p-1' style={{ display: 'inline' }}><sup><small>{i + ' '}</small></sup>{val[1]}</div>)}
                            </div>
                        </div>
                    </Draggable>
                }
            )
        console.log(objData)

        return <div className='border' style={{ height: '90%', width: '100%', position: 'relative', overflow: 'auto' }}>
            <div style={{ height: '1000px', width: '1000px', padding: '10px' }}>
                {objData}
                <Draggable bounds="parent">
                    <div className="border" display="inline-block">
                        I can only be moved within my offsetParent
                    </div>
                </Draggable>
            </div>
        </div>
    }
}


const SortableItem = SortableElement(({ value }) => <li>{value}</li>)

const SortableList = SortableContainer(({ items }) => {
    return (
        <ul>
            {items.map((value, index) => (
                <SortableItem key={`item-${index}`} index={index} value={value} />
            ))}
        </ul>
    );
});



class Stack extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            items: ['var0', 'var1', 'var2', 'var3', 'var4']
        }
    }

    render() {

        return <SortableList items={this.state.items} onSortEnd={(o, n) => this.setState({ items: arrayMove(this.state.items, o, n) })} />
    }
}


var App = React.createClass({
    getInitialState() {
        return {
            activeDrags: 0,
            deltaPosition: {
                x: 0, y: 0
            },
            controlledPosition: {
                x: -400, y: 200
            }
        };
    },

    handleDrag(e, ui) {
        const { x, y } = this.state.deltaPosition;
        this.setState({
            deltaPosition: {
                x: x + ui.deltaX,
                y: y + ui.deltaY,
            }
        });
    },

    onStart() {
        this.setState({ activeDrags: ++this.state.activeDrags });
    },

    onStop() {
        this.setState({ activeDrags: --this.state.activeDrags });
    },

    // For controlled component
    adjustXPos(e) {
        e.preventDefault();
        e.stopPropagation();
        const { x, y } = this.state.controlledPosition;
        this.setState({ controlledPosition: { x: x - 10, y } });
    },

    adjustYPos(e) {
        e.preventDefault();
        e.stopPropagation();
        const { controlledPosition } = this.state;
        const { x, y } = controlledPosition;
        this.setState({ controlledPosition: { x, y: y - 10 } });
    },

    onControlledDrag(e, position) {
        const { x, y } = position;
        this.setState({ controlledPosition: { x, y } });
    },

    onControlledDragStop(e, position) {
        this.onControlledDrag(e, position);
        this.onStop();
    },

    render() {
        const dragHandlers = { onStart: this.onStart, onStop: this.onStop };
        const { deltaPosition, controlledPosition } = this.state;
        return (
            <div>
                <h1>React Draggable</h1>
                <p>Active DragHandlers: {this.state.activeDrags}</p>
                <p>
                    <a href="https://github.com/mzabriskie/react-draggable/blob/master/example/index.html">Demo Source</a>
                </p>
                <Draggable {...dragHandlers}>
                    <div className="box">I can be dragged anywhere</div>
                </Draggable>
                <Draggable axis="x" {...dragHandlers}>
                    <div className="box cursor-x">I can only be dragged horizonally (x axis)</div>
                </Draggable>
                <Draggable axis="y" {...dragHandlers}>
                    <div className="box cursor-y">I can only be dragged vertically (y axis)</div>
                </Draggable>
                <Draggable onStart={() => false}>
                    <div className="box">I don't want to be dragged</div>
                </Draggable>
                <Draggable onDrag={this.handleDrag} {...dragHandlers}>
                    <div className="box">
                        <div>I track my deltas</div>
                        <div>x: {deltaPosition.x.toFixed(0)}, y: {deltaPosition.y.toFixed(0)}</div>
                    </div>
                </Draggable>
                <Draggable handle="strong" {...dragHandlers}>
                    <div className="box no-cursor">
                        <strong className="cursor"><div>Drag here</div></strong>
                        <div>You must click my handle to drag me</div>
                    </div>
                </Draggable>
                <Draggable cancel="strong" {...dragHandlers}>
                    <div className="box">
                        <strong className="no-cursor">Can't drag here</strong>
                        <div>Dragging here works</div>
                    </div>
                </Draggable>
                <Draggable grid={[25, 25]} {...dragHandlers}>
                    <div className="box">I snap to a 25 x 25 grid</div>
                </Draggable>
                <Draggable grid={[50, 50]} {...dragHandlers}>
                    <div className="box">I snap to a 50 x 50 grid</div>
                </Draggable>
                <Draggable bounds={{ top: -100, left: -100, right: 100, bottom: 100 }} {...dragHandlers}>
                    <div className="box">I can only be moved 100px in any direction.</div>
                </Draggable>
                <div className="box" style={{ height: '500px', width: '500px', position: 'relative', overflow: 'auto', padding: '0' }}>
                    <div style={{ height: '1000px', width: '1000px', padding: '10px' }}>
                        <Draggable bounds="parent" {...dragHandlers}>
                            <div className="box">
                                I can only be moved within my offsetParent.<br /><br />
                                Both parent padding and child margin work properly.
              </div>
                        </Draggable>
                        <Draggable bounds="parent" {...dragHandlers}>
                            <div className="box">
                                I also can only be moved within my offsetParent.<br /><br />
                                Both parent padding and child margin work properly.
              </div>
                        </Draggable>
                    </div>
                </div>
                <Draggable bounds="body" {...dragHandlers}>
                    <div className="box">
                        I can only be moved within the confines of the body element.
          </div>
                </Draggable>
                <Draggable>
                    <div className="box" style={{ position: 'absolute', bottom: '100px', right: '100px' }} {...dragHandlers}>
                        I already have an absolute position.
          </div>
                </Draggable>
                <Draggable defaultPosition={{ x: 25, y: 25 }} {...dragHandlers}>
                    <div className="box">
                        {"I have a default position of {x: 25, y: 25}, so I'm slightly offset."}
                    </div>
                </Draggable>
                <Draggable position={controlledPosition} {...dragHandlers} onDrag={this.onControlledDrag}>
                    <div className="box">
                        My position can be changed programmatically. <br />
                        I have a drag handler to sync state.
            <p>
                            <a href="#" onClick={this.adjustXPos}>Adjust x ({controlledPosition.x})</a>
                        </p>
                        <p>
                            <a href="#" onClick={this.adjustYPos}>Adjust y ({controlledPosition.y})</a>
                        </p>
                    </div>
                </Draggable>
                <Draggable position={controlledPosition} {...dragHandlers} onStop={this.onControlledDragStop}>
                    <div className="box">
                        My position can be changed programmatically. <br />
                        I have a dragStop handler to sync state.
            <p>
                            <a href="#" onClick={this.adjustXPos}>Adjust x ({controlledPosition.x})</a>
                        </p>
                        <p>
                            <a href="#" onClick={this.adjustYPos}>Adjust y ({controlledPosition.y})</a>
                        </p>
                    </div>
                </Draggable>

            </div>
        );
    }
});