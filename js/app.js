class BubbleApp {
    constructor() {
        this.canvas = null;
        this.physicsEngine = null;
        this.bubbleSystem = null;
        this.ui = null;
        
        this.init();
    }

    init() {
        // تهيئة الحاوية
        this.canvas = d3.select("#bubble-canvas");
        const width = window.innerWidth;
        const height = window.innerHeight - 120; // تعويض الشرائط
        
        this.canvas.attr("width", width).attr("height", height);

        // تهيئة المحركات
        this.physicsEngine = new PhysicsEngine(width, height);
        this.physicsEngine.init();

        this.bubbleSystem = new BubbleSystem("#bubble-canvas", this.physicsEngine);
        this.bubbleSystem.init();

        this.ui = new UIComponents();
        this.ui.createTopBar("#top-bar");
        this.ui.createBottomBar("#bottom-bar");

        // إضافة تفاعل السحب
        this.bubbleSystem.enableDrag();

        // إنشاء فقاعات مثال
        this.createSampleBubbles();

        // إعداد استجابة لحجم النافذة
        window.addEventListener("resize", () => this.handleResize());
    }

    createSampleBubbles() {
        const sampleData = [
            { title: "AI News", value: 100 },
            { title: "Crypto", value: -50 },
            { title: "Tech", value: 75 },
            { title: "Sports", value: 25 },
            { title: "Music", value: -30 }
        ];

        sampleData.forEach((data, i) => {
            setTimeout(() => {
                this.bubbleSystem.createBubble(data);
            }, i * 200);
        });
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight - 120;
        
        this.canvas.attr("width", width).attr("height", height);
        this.physicsEngine.width = width;
        this.physicsEngine.height = height;
        this.physicsEngine.init();
    }
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
    new BubbleApp();
});
