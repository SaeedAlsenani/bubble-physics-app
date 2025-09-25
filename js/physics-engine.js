class PhysicsEngine {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.simulation = null;
        this.nodes = [];
    }

    init() {
        this.simulation = d3.forceSimulation(this.nodes)
            .force("charge", d3.forceManyBody().strength(-50))
            .force("collision", d3.forceCollide().radius(d => d.radius + 2))
            .force("x", d3.forceX(this.width / 2).strength(0.05))
            .force("y", d3.forceY(this.height / 2).strength(0.05))
            .force("boundary", this.createBoundaryForce())
            .alphaDecay(0.02)
            .velocityDecay(0.4);
    }

    createBoundaryForce() {
        const width = this.width;
        const height = this.height;
        
        return function() {
            this.nodes.forEach(node => {
                const r = node.radius;
                // حدود أفقية
                if (node.x - r < 0) node.vx += (r - node.x) * 0.1;
                else if (node.x + r > width) node.vx += (width - r - node.x) * 0.1;
                
                // حدود عمودية
                if (node.y - r < 0) node.vy += (r - node.y) * 0.1;
                else if (node.y + r > height) node.vy += (height - r - node.y) * 0.1;
            });
        }.bind(this);
    }

    addNode(node) {
        this.nodes.push(node);
        this.simulation.nodes(this.nodes);
    }

    update() {
        this.simulation.alpha(0.3).restart();
    }
}
