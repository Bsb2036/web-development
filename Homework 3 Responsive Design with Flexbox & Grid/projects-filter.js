const filterButtons = document.querySelectorAll("[data-project-filter]");
const projectCards = document.querySelectorAll("[data-project-category]");
const filterStatus = document.querySelector("[data-filter-status]");

filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const selectedCategory = button.dataset.projectFilter;
        let visibleCount = 0;

        filterButtons.forEach((filterButton) => {
            filterButton.setAttribute(
                "aria-pressed",
                String(filterButton === button),
            );
        });

        projectCards.forEach((card) => {
            const isVisible =
                selectedCategory === "all" ||
                card.dataset.projectCategory === selectedCategory;
            card.hidden = !isVisible;
            visibleCount += Number(isVisible);
        });

        filterStatus.textContent = `Showing ${visibleCount} ${visibleCount === 1 ? "project" : "projects"}.`;
    });
});
