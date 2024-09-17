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
            title: row['Title'],
            description: row['Description'],
            image: row['Image URL'],
            links: {
                'Netflix': row['Netflix Link'] || '',
                'Amazon Prime': row['Amazon Prime Link'] || '',
                'Hulu': row['Hulu Link'] || ''
            }
        }));

        return movies;
    } catch (error) {
        console.error("Error fetching movies:", error);
    }
}

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

            // Check data and handle cases where data might be missing
            const image = movie.image || 'https://via.placeholder.com/150'; // Default image if none provided
            const description = movie.description || 'No description available';
            const title = movie.title || 'No title available';

            // Generate HTML for OTT links
            const linksHTML = Object.entries(movie.links)
                .filter(([platform, link]) => link) // Exclude blank or undefined links
                .map(([platform, link]) => `<a href="${link}" target="_blank">Watch on ${platform}</a>`)
                .join('<br>');

            movieCard.innerHTML = `
                <img src="${image}" alt="${title} Poster">
                <h2>${title}</h2>
                <p>${description}</p>
                ${linksHTML || '<p>No links available</p>'} <!-- Display message if no links -->
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
