import { l, app } from "lapp"
import { MyButtonView, actions as MyButtonAction } from "../component/button/button"
import graph from "./graph"

import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import cxtmenu from 'cytoscape-cxtmenu';

cytoscape.use( edgehandles );
cytoscape.use( cxtmenu );

let state = {
    aa: -1,
    bb: -1,
    checked: true,
    data: [{ name: "11", href: "22" }, { name: "33", href: "44" }]
}

const actions = {
    log: (e) => {
        console.log(e.target.value);
        state.inputVal = e.target.value
        MyButtonAction.addCount()
    },
    handleClick: () => {
        state.data.push({ name: "77", href: "88" })
        BoxView.$update()
    },
    handleCheck: (e) => {
        state.checked = !state.checked
        console.log(state.checked)
        BoxView.$update()
    },
    compute: (data) => {
        let dd = []
        state.data.forEach((item, index) => {
            dd.push(<div class="title">
                {item.name}
            </div>)
        })
        return dd
    }
}

const BoxView = ({ props, children }) => (<ul style="list-style: none;">
    &yen;
    <li className="item" onClick={() => alert('hi!')}>item 1</li>
    <li className="item">
        <input type="checkbox" checked={state.checked} onChange={actions.handleCheck} />
        <input type="text" style="border:1px solid #f40000;" onInput={actions.log} />
        <p>{state.inputVal}</p>
    </li>
    <li onClick={actions.handleClick} forceUpdate={true}>text</li>
    <MyButtonView className="button">hello, button</MyButtonView>
    {actions.compute(state.data)}
</ul>
);

//main
console.time("render virtual DOM with FP")
app(document.querySelector("#app"), BoxView, MyButtonView)
console.timeEnd("render virtual DOM with FP")



var cy = window.cy = cytoscape({
    container: document.getElementById('cy'),
    layout: {
        name: 'grid',
        rows: 2,
        cols: 2
    },
    style: [
        {
            selector: 'node',
            style: {
                'content': 'data(name)'
            }
        },
        {
            selector: 'edge',
            style: {
                'curve-style': 'bezier',
                'target-arrow-shape': 'triangle'
            }
        },
        // some style for the extension
        {
            selector: '.eh-handle',
            style: {
                'background-color': 'red',
                'width': 12,
                'height': 12,
                'shape': 'ellipse',
                'overlay-opacity': 0,
                'border-width': 12, // makes the handle easier to hit
                'border-opacity': 0
            }
        },
        {
            selector: '.eh-hover',
            style: {
                'background-color': 'red'
            }
        },
        {
            selector: '.eh-source',
            style: {
                'border-width': 2,
                'border-color': 'red'
            }
        },
        {
            selector: '.eh-target',
            style: {
                'border-width': 2,
                'border-color': 'red'
            }
        },
        {
            selector: '.eh-preview, .eh-ghost-edge',
            style: {
                'background-color': 'red',
                'line-color': 'red',
                'target-arrow-color': 'red',
                'source-arrow-color': 'red'
            }
        }
    ],
    elements: {
        nodes: [
            { data: { id: 'j', name: 'Jerry' } },
            { data: { id: 'e', name: 'Elaine' } },
            { data: { id: 'k', name: 'Kramer' } },
            { data: { id: 'g', name: 'George' } }
        ],
        edges: [
            { data: { source: 'j', target: 'e' } },
            { data: { source: 'j', target: 'k' } },
            { data: { source: 'j', target: 'g' } },
            { data: { source: 'e', target: 'j' } },
            { data: { source: 'e', target: 'k' } },
            { data: { source: 'k', target: 'j' } },
            { data: { source: 'k', target: 'e' } },
            { data: { source: 'k', target: 'g' } },
            { data: { source: 'g', target: 'j' } }
        ]
    }
});
var eh = cy.edgehandles();
document.querySelector('#draw-on').addEventListener('click', function() {
    eh.enableDrawMode();
});
document.querySelector('#draw-off').addEventListener('click', function() {
    eh.disableDrawMode();
});
document.querySelector('#start').addEventListener('click', function() {
    eh.start( cy.$('node:selected') );
});


cy.cxtmenu({
    selector: 'node, edge',
    commands: [
        {
            content: '<span class="fa fa-flash fa-2x"></span>',
            select: function(ele){
                console.log( ele.id() );
            }
        },
        {
            content: '<span class="fa fa-star fa-2x"></span>',
            select: function(ele){
                console.log( ele.data('name') );
            },
            disabled: true
        },
        {
            content: 'Text',
            select: function(ele){
                console.log( ele.position() );
            }
        }
    ]
});
cy.cxtmenu({
    selector: 'core',
    commands: [
        {
            content: 'bg1',
            select: function(){
                console.log( 'bg1' );
            }
        },
        {
            content: 'bg2',
            select: function(){
                console.log( 'bg2' );
            }
        }
    ]
});