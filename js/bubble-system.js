class BubbleSystem {
    constructor(containerId, physicsEngine) {
        this.container = d3.select(containerId);
        this.physics = physicsEngine;
        this.bubblesGroup = null;
        this.bubbles = [];
    }

    init() {
        // إنشاء SVG group للفقاعات
        this.bubblesGroup = this.container.append("g");
        
        // ربط محرك الفيزياء مع العرض البصري
        this.physics.simulation.on("tick", () => this.updateVisuals());
    }

    createBubble(data, x, y) {
        const bubbleData = {
            id: Date.now() + Math.random(),
            x: x || Math.random() * this.physics.width,
            y: y || Math.random() * this.physics.height,
            radius: 25 + Math.random() * 15,
            vx: 0, vy: 0,
            ...data
        };

        // إنشاء العنصر البصري
        const bubbleElement = this.bubblesGroup.append("g")
            .attr("class", "bubble")
            .attr("transform", `translate(${bubbleData.x}, ${bubbleData.y})`);

        // الدائرة
        bubbleElement.append("circle")
            .attr("r", bubbleData.radius)
            .attr("fill", this.getBubbleColor(bubbleData));

        // النص
        bubbleElement.append("text")
            .text(bubbleData.title ? bubbleData.title.substring(0, 8) : "Bubble")
            .attr("text-anchor", "middle")
            .attr("dy", "0.3em")
            .attr("fill", "white")
            .attr("font-size", "10px");

        bubbleData.element = bubbleElement;
        this.bubbles.push(bubbleData);
        this.physics.addNode(bubbleData);

        return bubbleData;
    }

    getBubbleColor(data) {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    updateVisuals() {
        this.bubblesGroup.selectAll(".bubble")
            .attr("transform", d => `translate(${d.x}, ${d.y})`);
    }

    enableDrag() {
        const drag = d3.drag()
            .on("start", (event, d) => {
                if (!event.active) this.physics.simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on("drag", (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on("end", (event, d) => {
                if (!event.active) this.physics.simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });

        this.bubblesGroup.selectAll(".bubble").call(drag);
    }
}
