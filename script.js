// Google Sheets API URL
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSNb-sN160plE95VvLO2-YNLez--vRTZINYB-OEPMidEEcN-XzVcs6-3PxJ01N2qOp2EkOMS_U3_sKn/pub?output=csv';

// Fetch the CSV data from Google Sheets
async function fetchMovies() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        console.log("Fetched data:", data); // Debugging: check if data is fetched

        // Split CSV into rows and columns
        const rows = data.split('\n').map(row => row.split(','));
        console.log("Parsed rows:", rows); // Debugging: check parsed rows

        const movies = rows.slice(1).map(row => {
            return {
                title: row[0],
                description: row[1],
                image: row[2],
                link: row[3]
            };
        });

        console.log("Movies:", movies); // Debugging: check movie data
        return movies;
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

// Render the movie data to the webpage
async function renderMovies() {
    const movieList = document.getElementById('movie-list');
    try {
        const movies = await fetchMovies();

        if (movies.length === 0) {
            movieList.innerHTML = '<p>No movies found.</p>';
            return;
        }

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
    } catch (error) {
        console.error("Error rendering movies:", error);
        movieList.innerHTML = '<p>Error loading movies. Please try again later.</p>';
    }
}

// Call the render function when the page loads
renderMovies();
