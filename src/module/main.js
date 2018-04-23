import { l, app } from "lapp"
import { MyButtonView, actions as MyButtonAction } from "../component/button/button"
import saveAs from "../util/saveAs"
import upload from "../util/upload"

import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import cxtmenu from 'cytoscape-cxtmenu';

cytoscape.use(edgehandles);
cytoscape.use(cxtmenu);

let state = {
    config: {
        container: document.getElementById('cy'),
        style: [{
            selector: 'node',
            style: {
                'content': 'data(name)'
            }
        }, {
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
        }, {
            selector: '.eh-hover',
            style: {
                'background-color': 'red'
            }
        }, {
            selector: '.evt',
            style: {
                'background-color': 'blue',
                'border-color': 'blue'
            }
        }, {
            selector: '.marked',
            style: {
                'background-color': 'purple',
                'border-color': 'purple'
            }
        }, {
            selector: '.eh-source',
            style: {
                'border-width': 2,
                'border-color': 'red'
            }
        }, {
            selector: '.eh-target',
            style: {
                'border-width': 2,
                'border-color': 'red'
            }
        }, {
            selector: '.eh-preview, .eh-ghost-edge',
            style: {
                'background-color': 'red',
                'line-color': 'red',
                'target-arrow-color': 'red',
                'source-arrow-color': 'red'
            }
        }]
    }
}

const actions = {
    init: (graph) => {
        //render nodes
        state.graph = graph;
        state.cy = cytoscape(state.config);
        state.eh = state.cy.edgehandles();
        state.cy.zoomingEnabled(false); //禁止缩放
        state.cy.add({
            nodes: actions.getNodes()
        });
        state.cy.add({
            edges: actions.getEdges()
        });
        actions.setNodeMenu()
        actions.setMenu()
        // state.layout = state.cy.layout({
        //     name: 'random'
        // })
        // state.layout.run()
    },
    setNodeMenu: () => {
        state.cy.cxtmenu({
            selector: 'node, edge',
            commands: [
                {
                    content: '删除',
                    select: function (ele) {
                        state.cy.remove(ele)
                    }
                },
                {
                    content: '标记',
                    select: function (ele) {
                        ele.addClass("marked")
                    }
                },
                {
                    content: '+节点',
                    select: function (ele) {
                        document.querySelector("#app").className += " dialog"
                        state.prevEle = ele
                    }
                }
            ]
        });
    },
    setMenu: () => {
        state.cy.cxtmenu({
            selector: 'core',
            commands: [
                {
                    content: '+节点',
                    select: function (ele) {
                        document.querySelector("#app").className += " dialog"
                    }
                }
            ]
        });
    },
    addNode: () => {
        document.querySelector("#app").className += document.querySelector("#app").className.replace(/dialog/g, '')
        state.cy.add({
            nodes: [{
                data: {
                    id: state.inputName,
                    name: state.inputName,
                    entry: state.inputEntry,
                    from: state.inputFrom,
                    param: state.inputParam
                },
                classes: state.inputType,
                position: {
                    "x": state.prevEle ? (state.prevEle.position().x + 50) : 600,
                    "y": state.prevEle ? (state.prevEle.position().y + 50) : 280,
                }
            }]
        })
    },
    getEvts: () => {
        let nodes = [];
        let evts = state.graph.events;
        evts.forEach((evt, i) => {
            nodes.push({
                data: {
                    id: evt.name,
                    name: evt.name,
                    entry: evt.entry,
                    from: evt.from
                },
                classes: "evt",
                position: {
                    "x": 200 + i * 300,
                    "y": 80
                }
            })
        })
        return nodes
    },
    getNodes: () => {
        let nodes = actions.getEvts();
        let acts = state.graph.actions;
        acts.forEach((act, i) => {
            let j = 0;
            for (let item in state.graph[act]) {
                nodes.push({
                    data: {
                        id: (act + '_' + item),
                        name: (act + '_' + item),
                        param: state.graph[act][item].param
                    },
                    position: state.graph[act][item].position || {
                        "x": 220 + i * 300,
                        "y": 200 + j * 100
                    }
                });
                j++;
            }
        })
        return nodes
    },
    getEdges: () => {
        let edges = [];
        let evts = state.graph.events;
        let actions = state.graph.actions;
        evts.forEach(evt => {
            evt.next && evt.next.forEach(ntm => {
                edges.push({ data: { source: evt.name, target: ntm }, classes: "evt" })
            })

        })
        actions.forEach(act => {
            for (let item in state.graph[act]) {
                state.graph[act][item].next && state.graph[act][item].next.forEach(ntm => {
                    edges.push({ data: { source: act + '_' + item, target: ntm } })
                    if (ntm.match(act))
                        state.cy.$("#" + ntm).position('x', +state.cy.$("#" + act + '_' + item).position('x') + 50)
                })
            }
        })
        return edges
    },
    //将cy的model转化成finite需要的model
    map2model: (model) => {
        let graph = { actions: [], events: [] };
        let nodes = model.elements.nodes;
        let edges = model.elements.edges;
        nodes.forEach(item => {
            if (item.classes == "evt") {
                graph.events.push({
                    entry: item.data.entry,
                    from: item.data.from,
                    name: item.data.id
                })
            } else {
                if (item.data.id.match("_")) {
                    let id = item.data.id.split("_")
                    if (graph.actions.indexOf(id[0]) < 0) {
                        graph.actions.push(id[0])
                        graph[id[0]] = {}
                    }
                    graph[id[0]][id[1]] = { param: item.data.param }
                    graph[id[0]][id[1]]["position"] = item.position

                }
            }
        })
        edges.forEach(item => {
            if (item.data.source) {
                if (item.classes == "evt") {
                    let evt = graph.events.find(ev => ev.name == item.data.source)
                    !evt.next && (evt.next = [])
                    evt.next.push(item.data.target)
                } else {
                    if (item.data.source.match("_")) {
                        let id = item.data.source.split("_")
                        !graph[id[0]][id[1]]["next"] && (graph[id[0]][id[1]]["next"] = [])
                        graph[id[0]][id[1]]["next"].push(item.data.target)
                    }
                }
            }
        })
        return graph;
    },
    updateValue: (key) => (e) => {
        console.log(e.target.value);
        state[key] = e.target.value
    },
    updateSelect: (key, val) => (e) => {
        state[key] = val
    },
    save: () => {
        var blob = new Blob([JSON.stringify(actions.map2model(state.cy.json()), null, 2)], {
            type: "text/plain;charset=utf-8"
        });
        saveAs(blob, "model.json");
    },
    import: () => {
        let input = document.createElement("input")
        input.type = "file"
        input.addEventListener("change", upload(data => {
            actions.init(data)
        }));
        input.click();
    }
}

const BoxView = ({ props, children }) => (
    <div class="overview">
        <div class="dom-load"></div>
        <div class="win-load"></div>
        <div class="evt-bg">
        </div>
        <div class="avs-bg">
        </div>
    </div>
);

const OperView = ({ props, children }) => (
    <div>
        <div class="type">
            <input type="radio" onClick={actions.updateSelect("inputType", 'evt')} /> Event
            <input type="radio" onClick={actions.updateSelect("inputType", '')} /> Action
        </div>
        <div>
            <input type="text" onInput={actions.updateValue("inputName")} placeholder="名称" />
            <div class="type">
                <input type="radio" onClick={actions.updateSelect("inputEntry", '1')} /> jsLoad
                <input type="radio" onClick={actions.updateSelect("inputEntry", '2')} /> DomLoad
                <input type="radio" onClick={actions.updateSelect("inputEntry", '3')} /> WindowLoad
            </div>
            <input type="text" onInput={actions.updateValue("inputFrom")} placeholder="事件源" /><br />
            <input type="text" onInput={actions.updateValue("inputParam")} placeholder="参数" />
            <button onClick={actions.addNode}>添加</button>
        </div>
        <div>
            <button onClick={actions.save}>保存</button>
            <button onClick={actions.export}>导出</button>
            <button onClick={actions.import}>导入</button>
        </div>
    </div>
)

//show back
app(document.querySelector("#app"), BoxView)
app(document.querySelector("#oper"), OperView)



