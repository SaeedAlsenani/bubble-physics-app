class UIComponents {
    constructor() {
        this.currentFilter = 'day';
        this.currentCategory = 'collections';
    }

    createTopBar(containerId) {
        const topBar = d3.select(containerId);
        
        // فلاتر الوقت
        const timeFilter = topBar.append("div").attr("class", "time-filter");
        
        ['Day', 'Week', 'Month'].forEach(period => {
            timeFilter.append("button")
                .attr("class", `time-btn ${period.toLowerCase() === this.currentFilter ? 'active' : ''}`)
                .attr("data-period", period.toLowerCase())
                .text(period)
                .on("click", (event) => this.handleTimeFilter(event, period.toLowerCase()));
        });

        // شريط البحث
        this.createSearchBar(topBar);
    }

    createSearchBar(container) {
        const searchContainer = container.append("div").attr("class", "search-container");
        
        searchContainer.append("input")
            .attr("type", "text")
            .attr("placeholder", "🔍 Search...")
            .attr("class", "search-input")
            .on("input", (event) => this.handleSearch(event.target.value));
    }

    createBottomBar(containerId) {
        const bottomBar = d3.select(containerId);
        const categoryNav = bottomBar.append("nav").attr("class", "category-nav");
        
        ['Collections', 'Models', 'Stickers', 'AI News', 'Portfolio'].forEach(cat => {
            categoryNav.append("button")
                .attr("class", `category-btn ${cat.toLowerCase() === this.currentCategory ? 'active' : ''}`)
                .text(cat)
                .on("click", () => this.handleCategoryChange(cat.toLowerCase()));
        });
    }

    handleTimeFilter(event, period) {
        this.currentFilter = period;
        d3.selectAll(".time-btn").classed("active", false);
        d3.select(event.currentTarget).classed("active", true);
        console.log("Filter changed to:", period);
    }

    handleCategoryChange(category) {
        this.currentCategory = category;
        d3.selectAll(".category-btn").classed("active", false);
        d3.select(`.category-btn:contains('${category}')`).classed("active", true);
        console.log("Category changed to:", category);
    }

    handleSearch(query) {
        console.log("Searching for:", query);
        // تطبيق البحث على الفقاعات
    }
}
