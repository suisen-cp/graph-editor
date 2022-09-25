// const make_options = function (option_name, id, options) {
//     const selector_html = `
//         <div>
//             <h6>${option_name}</h6>
//         </div>
//         ${Array.from({ length: options.length }, (_, i) => `
//             <div class="custom-control custom-radio">
//                 <input type="radio" id="${id}-${i}" name="${id}" class="custom-control-input" ${i == 0 ? 'checked' : ''}>
//                 <label class="custom-control-label" for="${id}-${i}">${options[i]}</label>
//             </div>
//         `).join('\n')}
//     `;
//     const new_selector_element = document.createElement('div');
//     new_selector_element.innerHTML = selector_html;
//     new_selector_element.classList.add('mt-1');
//     document.getElementById('options').appendChild(new_selector_element);
// };

// const graphTypeButtonId = 'graphTypeButton';
// const graphTypeList = ['Undirected', 'Directed'];
// const indexTypeButtonId = 'indexTypeButton';
// const indexTypeList = ['0-indexed', '1-indexed'];
// const weightTypeButtonId = 'weightTypeButton';
// const weightTypeList = ['Unweighted', 'Weighted'];
// const formatTypeButtonId = 'formatTypeButton';
// const formatTypeList = ['.txt (CP-Like)', '.json', '.png', '.jpg'];

// make_options("Edge", graphTypeButtonId, graphTypeList);
// make_options("Index", indexTypeButtonId, indexTypeList);
// make_options("Weight", weightTypeButtonId, weightTypeList);
// make_options("Saving Format", formatTypeButtonId, formatTypeList);

let cy = cytoscape({
    container: document.getElementById('cy'),
    style: [
        {
            selector: "node[color]",
            css: {
                "label": "data(id)",
                "background-color": "data(color)",
                "text-outline-color": "white"
            }
        },
        {
            selector: "node[name][color]",
            css: {
                "label": "data(name)",
                "background-color": "data(color)",
                "text-outline-color": "white"
            }
        },
        {
            selector: "edge[name][color][directed = 'undirected']",
            css: {
                "curve-style": "bezier",
                "label": "data(name)",
                "line-color": "data(color)",
                "text-outline-color": "white"
            }
        },
        {
            selector: "edge[name][color][directed = 'directed']",
            css: {
                "curve-style": "bezier",
                "label": "data(name)",
                "line-color": "data(color)",
                "text-outline-color": "white",
                "target-arrow-color": "data(color)",
                "target-arrow-shape": "triangle",
                "target-arrow-fill": "filled"
            }
        },
    ],
});

let next_node_id = 0;
const add_new_node = function (name, color) {
    const node_id = "v" + next_node_id;
    let new_node = {
        group: 'nodes',
        data: { id: node_id, 'color': color },
    };
    if (name != '') new_node.data.name = name;

    cy.add(new_node);

    cy.$id(node_id).on('mousedown', function (event) {
        const node_id = event.target.id();
        const node = cy.$id(node_id);
        node.css('background-color', 'magenta');
        for (edge of cy.edges(`[source = "${node_id}"]`)) {
            edge.css('line-color', 'magenta');
            if (edge.data('directed') === 'directed') {
                edge.css('target-arrow-color', 'magenta');
            }
        }
        for (edge of cy.edges(`[target = "${node_id}"]`)) {
            if (edge.data('directed') === 'undirected') {
                edge.css('line-color', 'magenta');
            }
        }
    });
    cy.$id(node_id).on('mouseup', function (event) {
        const node_id = event.target.id();
        const node = cy.$id(node_id);
        node.css('background-color', node.data('color'));
        for (edge of cy.edges(`[source = "${node_id}"]`)) {
            edge.css('line-color', edge.data('color'));
            if (edge.data('directed') === 'directed') {
                edge.css('target-arrow-color', edge.data('color'));
            }
        }
        for (edge of cy.edges(`[target = "${node_id}"]`)) {
            if (edge.data('directed') === 'undirected') {
                edge.css('line-color', edge.data('color'));
            }
        }
    });
    ++next_node_id;
};
document.getElementById("add-node-submit").addEventListener('click', function (event) {
    const name = document.getElementById("add-node-label-input").value;
    const color = document.getElementById("add-node-color-input").value;
    add_new_node(name, color);
});

let next_edge_id = 0;
const add_new_edge = function (label, src, dst, weight, color, directed) {
    if (weight === '') {
        weight = 0;
    }
    console.log(label, src, dst, weight, color, directed);
    const edge_id = "e" + next_edge_id;
    let new_edge = {
        group: 'edges',
        data: {
            id: edge_id,
            name: label,
            source: src,
            target: dst,
            color: color,
            directed: directed,
            weight: weight
        },
    };

    cy.add(new_edge);
    ++next_edge_id;
};

document.getElementById("add-edge-submit").addEventListener('click', function (event) {
    const label = document.getElementById("add-edge-label-input").value;
    const src = document.getElementById("add-edge-src-input").value;
    const dst = document.getElementById("add-edge-dst-input").value;
    const weight = document.getElementById("add-edge-weight-input").value;
    const color = document.getElementById("add-edge-color-input").value;
    const directed = document.querySelector('input[name="add-edge-directed-input"]:checked').value;
    add_new_edge(label, src, dst, weight, color, directed);
});

const apply_layout = function (name) {
    cy.layout({ name: name }).run();
};
document.getElementById("change-layout-submit").addEventListener('click', function (event) {
    const layout_name = document.querySelector('input[name="change-layout-input"]:checked').value;
    apply_layout(layout_name);
});

document.getElementById("save-submit").addEventListener('click', function () {
    const save_format = document.querySelector('input[name="save-input"]:checked').value;
    if (save_format === 'json') {
        let elm = document.createElement('div');
        elm.textContent = JSON.stringify(cy.json());
        document.getElementById("output").appendChild(elm);
    } else if (save_format === 'jpg') {
        let elm = document.createElement('img');
        elm.src = cy.jpg();
        document.getElementById("output").appendChild(elm);
    } else if (save_format === 'png') {
        const elm = document.createElement('img');
        elm.src = cy.png();
        document.getElementById("output").appendChild(elm);
    }
});

document.getElementById("clear-btn").addEventListener('click', function () {
    cy.remove('');
    cy.reset();
    next_node_id = next_edge_id = 0;
});
