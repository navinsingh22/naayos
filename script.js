const XLSX_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSNb-sN160plE95VvLO2-YNLez--vRTZINYB-OEPMidEEcN-XzVcs6-3PxJ01N2qOp2EkOMS_U3_sKn/pub?output=xlsx';

let movies = [];
let currentIndex = 0;
const batchSize = 20; // Number of movies to load at a time
let filteredMovies = [];
let fuse;

async function fetchMovies() {
    try {
        const response = await fetch(XLSX_URL);
        const arrayBuffer = await response.arrayBuffer();

        // Parse the XLSX file
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        console.log("Parsed data:", data);

        // Map data with proper keys
        movies = data.map(row => ({
            title: row['Title'] || 'No title available',
            image: row['Image URL'] || 'https://via.placeholder.com/150',
            links: {
                'Netflix': row['Netflix Link'] || '',
                'Amazon Prime': row['Amazon Prime Link'] || ''
            }
        }));

        filteredMovies = [...movies];

        // Initialize Fuse.js for fuzzy search with custom options
        fuse = new Fuse(movies, {
            keys: ['title'],  // Search by title
            threshold: 0.3, // Set how fuzzy the search is (lower is stricter)
            includeScore: true // Optional: Can include scores of matching
        });

        return movies;
    } catch (error) {
        console.error("Error fetching movies:", error);
        return [];
    }
}

function renderMovies(startIndex, endIndex) {
    const movieList = document.getElementById('movie-list');
    const movieBatch = filteredMovies.slice(startIndex, endIndex);

    movieBatch.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');

        const linksHTML = Object.entries(movie.links)
            .filter(([platform, link]) => link)
            .map(([platform, link]) => `<a href="${link}" target="_blank">Watch on ${platform}</a>`)
            .join('<br>');

        movieCard.innerHTML = `
            <img src="${movie.image}" alt="${movie.title} Poster" loading="lazy">
            <h2>${movie.title}</h2>
            ${linksHTML || '<p>No links available</p>'}
        `;

        movieList.appendChild(movieCard);
    });
}

async function loadMoreMovies() {
    if (currentIndex >= filteredMovies.length) return;
    const nextIndex = Math.min(currentIndex + batchSize, filteredMovies.length);
    renderMovies(currentIndex, nextIndex);
    currentIndex = nextIndex;
}

function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMoreMovies();
    }
}

// Update the handleSearch function to use Fuse.js for fuzzy search
function handleSearch(event) {
    const searchTerm = event.target.value.trim();

    if (!searchTerm) {
        filteredMovies = [...movies]; // Reset to full list if search is empty
    } else {
        const result = fuse.search(searchTerm);
        filteredMovies = result.map(r => r.item); // Extract matching items
    }

    // Reset current index and clear existing content
    currentIndex = 0;
    const movieList = document.getElementById('movie-list');
    movieList.innerHTML = '';

    loadMoreMovies(); // Load the filtered results
}

async function renderCarouselMovies(limit = 8) {
    const carouselWrapper = document.querySelector('.carousel-wrapper');
    try {
        const movies = await fetchMovies();

        if (movies.length === 0) {
            carouselWrapper.innerHTML = '<p>No movies found.</p>';
            return;
        }

        const limitedMovies = movies.slice(0, limit); // Get first 'limit' number of movies

        limitedMovies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');

            const linksHTML = Object.entries(movie.links)
                .filter(([platform, link]) => link) // Exclude blank or undefined links
                .map(([platform, link]) => `<a href="${link}" target="_blank">Watch on ${platform}</a>`)
                .join('<br>');

            movieCard.innerHTML = `
                <img src="${movie.image}" alt="${movie.title} Poster" loading="lazy">
                <h2>${movie.title}</h2>
                ${linksHTML || '<p>No links available</p>'}
            `;

            carouselWrapper.appendChild(movieCard);
        });
    } catch (error) {
        console.error("Error rendering movies:", error);
        carouselWrapper.innerHTML = '<p>Error loading movies. Please try again later.</p>';
    }
}

// Initialize
async function init() {
    await fetchMovies();
    loadMoreMovies();
    renderCarouselMovies(); // Call this function to load carousel movies
    window.addEventListener('scroll', handleScroll);

    // Add search functionality
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', handleSearch);
}

init();
