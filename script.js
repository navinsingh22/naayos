// Google Sheets API URL
const SHEET_ID = '2PACX-1vSNb-sN160plE95VvLO2-YNLez--vRTZINYB-OEPMidEEcN-XzVcs6-3PxJ01N2qOp2EkOMS_U3_sKn'; // Replace with your actual Sheet ID
const SHEET_URL = `https://spreadsheets.google.com/feeds/list/${SHEET_ID}/od6/public/values?alt=json`;

// Fetch the data from Google Sheets
async function fetchMovies() {
    const response = await fetch(SHEET_URL);
    const data = await response.json();

    // Extract movie entries from the fetched data
    const movies = data.feed.entry.map(entry => {
        return {
            title: entry.gsx$title.$t,
            description: entry.gsx$description.$t,
            image: entry.gsx$imageurl.$t,
            link: entry.gsx$watchurl.$t
        };
    });

    return movies;
}

// Render the movie data to the webpage
async function renderMovies() {
    const movieList = document.getElementById('movie-list');
    const movies = await fetchMovies();

    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');

        movieCard.innerHTML = `
            <img src="${movie.image}" alt="${movie.title} Poster">
            <h2>${movie.title}</h2>
            <p>${movie.description}</p>
            <a href="${movie.link}" target="_blank">Watch on Platform</a>
        `;

        movieList.appendChild(movieCard);
    });
}

// Call the render function when the page loads
renderMovies();
