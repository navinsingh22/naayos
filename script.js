const XLSX_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSNb-sN160plE95VvLO2-YNLez--vRTZINYB-OEPMidEEcN-XzVcs6-3PxJ01N2qOp2EkOMS_U3_sKn/pub?output=xlsx';

async function fetchMovies() {
    try {
        const response = await fetch(XLSX_URL);
        const arrayBuffer = await response.arrayBuffer();
        
        // Parse the XLSX file
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0]; // Get the first sheet
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        console.log("Parsed data:", data); // Debugging: check the data

        const movies = data.map(row => ({
            title: row['title'],
            description: row['description'],
            image: row['image'],
            link: row['link']
        }));

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
