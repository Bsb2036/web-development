const newsForm = document.querySelector("#local-news-form");
const newsCity = document.querySelector("#news-city");
const newsStatus = document.querySelector("#news-status");
const newsFallback = document.querySelector("#news-fallback");
const newsResults = document.querySelector("#news-results");
const newsCard = document.querySelector(".news-card");
const newsButton = newsForm?.querySelector("button[type='submit']");

function formatNewsDate(value) {
    const match = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(value || "");
    if (!match) {
        return "Date unavailable";
    }

    const [, year, month, day, hour, minute, second] = match;
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function createNewsItem(article) {
    if (!article || typeof article.title !== "string" || typeof article.url !== "string") {
        return null;
    }

    let articleUrl;
    try {
        articleUrl = new URL(article.url);
    } catch {
        return null;
    }
    if (articleUrl.protocol !== "https:") {
        return null;
    }

    const item = document.createElement("li");
    const heading = document.createElement("h3");
    const link = document.createElement("a");
    link.href = articleUrl.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = article.title.trim();
    heading.append(link);
    item.append(heading);

    const details = [article.domain, formatNewsDate(article.seendate)]
        .filter((value) => typeof value === "string" && value.trim());
    if (details.length) {
        const metadata = document.createElement("p");
        metadata.className = "news-meta";
        metadata.textContent = details.join(" | ");
        item.append(metadata);
    }

    return item;
}

function showNewsFallback(city) {
    const query = new URLSearchParams({
        q: `${city} local news`,
        hl: "en-US",
        gl: "US",
        ceid: "US:en",
    });
    const link = document.createElement("a");
    link.href = `https://news.google.com/search?${query}`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `Search Google News for ${city}`;
    newsFallback.replaceChildren(link);
    newsFallback.hidden = false;
}

async function loadLocalNews(event) {
    event.preventDefault();
    if (!newsForm.reportValidity()) {
        return;
    }

    const city = newsCity.value.trim();
    if (!city) {
        newsCity.focus();
        return;
    }

    newsButton.disabled = true;
    newsCard.setAttribute("aria-busy", "true");
    newsResults.replaceChildren();
    newsFallback.hidden = true;
    newsStatus.textContent = `Searching recent headlines mentioning ${city}...`;

    const query = new URLSearchParams({
        query: `"${city.replace(/"/g, "")}" sourcelang:english`,
        mode: "ArtList",
        format: "json",
        maxrecords: "5",
        timespan: "7d",
        sort: "DateDesc",
    });

    try {
        const response = await fetch(`https://api.gdeltproject.org/api/v2/doc/doc?${query}`);
        if (!response.ok) {
            throw new Error(`News service returned ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }
        const items = (data.articles || [])
            .map(createNewsItem)
            .filter(Boolean)
            .slice(0, 5);

        if (items.length === 0) {
            newsStatus.textContent = `No recent headlines found for ${city}. Try another city or nearby region.`;
            showNewsFallback(city);
            return;
        }

        newsResults.append(...items);
        newsStatus.textContent = `Found ${items.length} recent ${items.length === 1 ? "headline" : "headlines"} mentioning ${city}.`;
    } catch (error) {
        console.error("Unable to load local news.", error);
        newsStatus.textContent = "Local news could not be loaded right now. Please try again later.";
        showNewsFallback(city);
    } finally {
        newsButton.disabled = false;
        newsCard.setAttribute("aria-busy", "false");
    }
}

if (newsForm && newsCity && newsStatus && newsFallback && newsResults && newsCard && newsButton) {
    newsForm.addEventListener("submit", loadLocalNews);
}
