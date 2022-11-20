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

const event_node_mousedown = function (event) {
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
};
const event_node_mouseup = function (event) {
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
};

let node_maker = new class {
    constructor() {
        this.next_node_id = 0;
    }

    make_new_node(name, color) {
        const node_id = "v" + this.next_node_id;
        let new_node = {
            group: 'nodes',
            data: { id: node_id, 'color': color },
        };
        if (name != '') new_node.data.name = name;
        cy.add(new_node);
        cy.$id(node_id).on('mousedown', event_node_mousedown);
        cy.$id(node_id).on('mouseup', event_node_mouseup);
        ++this.next_node_id;
    }

    reset() {
        this.next_node_id = 0;
    }
}();

$("#add-node-submit").click(function () {
    node_maker.make_new_node($("#add-node-label-input").val(), $("#add-node-color-input").val());
});

let edge_maker = new class {
    constructor() {
        this.next_edge_id = 0;
    }

    make_new_edge(label, src, dst, weight, color, directed) {
        if (weight === '') {
            weight = 0;
        }
        const edge_id = "e" + this.next_edge_id;
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
        ++this.next_edge_id;
    }

    reset() {
        this.next_edge_id = 0;
    }
}();

$("#add-edge-submit").click(function () {
    const label = $("#add-edge-label-input").val();
    const src = $("#add-edge-src-input").val();
    const dst = $("#add-edge-dst-input").val();
    const weight = $("#add-edge-weight-input").val();
    const color = $("#add-edge-color-input").val();
    const directed = $('input[name="add-edge-directed-input"]:checked').val();
    edge_maker.make_new_edge(label, src, dst, weight, color, directed);
});

const apply_layout = function (name) {
    cy.layout({ name: name }).run();
};
$("#change-layout-submit").click(function () {
    apply_layout($('input[name="change-layout-input"]:checked').val());
});

$("#save-submit").click(function () {
    const save_format = $('input[name="save-input"]:checked').val();
    if (save_format === 'json') {
        let elm = document.createElement('div');
        elm.textContent = JSON.stringify(cy.json());
        $("#output").append(elm);
    } else if (save_format === 'jpg') {
        let elm = document.createElement('img');
        elm.src = cy.jpg();
        $("#output").append(elm);
    } else if (save_format === 'png') {
        let elm = document.createElement('img');
        elm.src = cy.png();
        $("#output").append(elm);
    }
});

$("#clear-btn").click(function () {
    cy.remove('');
    cy.reset();
    node_maker.reset();
    edge_maker.reset();
});
