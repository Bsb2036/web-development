const newsForm = document.querySelector("#local-news-form");
const newsCity = document.querySelector("#news-city");
const newsStatus = document.querySelector("#news-status");
const newsLinkContainer = document.querySelector("#news-link-container");
const newsLink = document.querySelector("#local-news-link");

function createGoogleNewsLink(event) {
    event.preventDefault();
    if (!newsForm.reportValidity()) {
        return;
    }

    const city = newsCity.value.trim();
    if (!city) {
        newsCity.focus();
        return;
    }

    const query = new URLSearchParams({
        q: `${city} local news`,
        hl: "en-US",
        gl: "US",
        ceid: "US:en",
    });

    newsLink.href = `https://news.google.com/search?${query}`;
    newsLink.textContent = `Open Google News local results for ${city}`;
    newsLinkContainer.hidden = false;
    newsStatus.textContent = `Your Google News search for ${city} is ready. Open the link to view local headlines.`;
}

if (newsForm && newsCity && newsStatus && newsLinkContainer && newsLink) {
    newsForm.addEventListener("submit", createGoogleNewsLink);
}
