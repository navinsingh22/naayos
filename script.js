const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSNb-sN160plE95VvLO2-YNLez--vRTZINYB-OEPMidEEcN-XzVcs6-3PxJ01N2qOp2EkOMS_U3_sKn/pub?output=csv';

// Fetch and parse CSV using PapaParse
async function fetchMovies() {
    try {
        const response = await fetch(SHEET_URL);
        const csvData = await response.text();

        // Parse CSV data using PapaParse
        const parsedData = Papa.parse(csvData, { header: true });
        console.log("Parsed data:", parsedData.data); // Check parsed data

        // Clean up any extra quotes around URLs
        const movies = parsedData.data.map(row => {
            return {
                title: row['title'],
                description: row['description'],
                image: row['image'].replace(/^""|""$/g, ''), // Remove extra double quotes
                link: row['link'].replace(/^""|""$/g, '') // Remove extra double quotes
            };
        });

        return movies;
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

// Render movies
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

// Call renderMovies to load on page load
renderMovies();
