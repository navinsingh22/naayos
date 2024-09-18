const XLSX_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSNb-sN160plE95VvLO2-YNLez--vRTZINYB-OEPMidEEcN-XzVcs6-3PxJ01N2qOp2EkOMS_U3_sKn/pub?output=xlsx';

let movies = [];
let currentIndex = 0;
const batchSize = 20; // Number of movies to load at a time

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

        // Map data with proper keys
        movies = data.map(row => ({
            title: row['Title'] || 'No title available',
            image: row['Image URL'] || 'https://via.placeholder.com/150', // Default image if none provided
            links: {
                'Netflix': row['Netflix Link'] || '',
                'Amazon Prime': row['Amazon Prime Link'] || ''
            }
        }));
        
        console.log("Total movies fetched:", movies.length); // Debugging: total movies fetched
    } catch (error) {
        console.error("Error fetching movies:", error);
        movies = []; // Clear movies in case of error
    }
}

function renderMovies(startIndex, endIndex) {
    const movieList = document.getElementById('movie-list');
    
    const movieBatch = movies.slice(startIndex, endIndex);
    
    movieBatch.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        
        // Generate HTML for OTT links
        const linksHTML = Object.entries(movie.links)
            .filter(([platform, link]) => link) // Exclude blank or undefined links
            .map(([platform, link]) => `<a href="${link}" target="_blank">Watch on ${platform}</a>`)
            .join('<br>');

        movieCard.innerHTML = `
            <img src="${movie.image}" alt="${movie.title} Poster" loading="lazy">
            <h2>${movie.title}</h2>
            ${linksHTML || '<p>No links available</p>'} <!-- Display message if no links -->
        `;

        movieList.appendChild(movieCard);
    });
}

async function loadMoreMovies() {
    if (currentIndex >= movies.length) return;
    const nextIndex = Math.min(currentIndex + batchSize, movies.length);
    renderMovies(currentIndex, nextIndex);
    currentIndex = nextIndex;
}

function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        loadMoreMovies();
    }
}

// Initialize
async function init() {
    await fetchMovies();
    loadMoreMovies();
    window.addEventListener('scroll', handleScroll);
}

init();
