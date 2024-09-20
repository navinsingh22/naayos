const XLSX_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSNb-sN160plE95VvLO2-YNLez--vRTZINYB-OEPMidEEcN-XzVcs6-3PxJ01N2qOp2EkOMS_U3_sKn/pub?output=xlsx';

let movies = [];
let currentIndex = 0;
const batchSize = 20;
let filteredMovies = [];
let fuse;

async function fetchMovies() {
    try {
        const response = await fetch(XLSX_URL);
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);

        movies = data.map(row => ({
            title: row['Title'] || 'No title available',
            image: row['Image URL'] || 'https://via.placeholder.com/150',
            description: row['Description'] || 'No description available',
            links: {
                'Netflix': row['Netflix Link'] || '',
                'Amazon Prime': row['Amazon Prime Link'] || ''
            }
        }));

        filteredMovies = [...movies];
        fuse = new Fuse(movies, { keys: ['title'], threshold: 0.3, includeScore: true });
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

async function renderCarouselMovies() {
    const carouselContainer = document.getElementById('carousel-container');
    const movies = await fetchMovies();

    movies.slice(0, 6).forEach(movie => {
        const movieItem = document.createElement('li');
        movieItem.classList.add('item');
        movieItem.style.backgroundImage = `url(${movie.image})`;

        movieItem.innerHTML = `
            <div class="content">
                <h2 class="title">${movie.title}</h2>
                <p class="description">${movie.description}</p>
            </div>
        `;

        carouselContainer.appendChild(movieItem);
    });
}

function activate(e) {
    const items = document.querySelectorAll('.item');
    const slider = document.querySelector('.slider');

    if (e.target.matches('.next')) {
        slider.append(items[0]);
    } else if (e.target.matches('.prev')) {
        slider.prepend(items[items.length - 1]);
    }
}

document.addEventListener('click', activate, false);

function loadMoreMovies() {
    renderMovies(currentIndex, currentIndex + batchSize);
    currentIndex += batchSize;
}

function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
        loadMoreMovies();
    }
}

function handleSearch(event) {
    const searchTerm = event.target.value.trim();
    if (searchTerm === '') {
        filteredMovies = [...movies];
    } else {
        const results = fuse.search(searchTerm).map(result => result.item);
        filteredMovies = results;
    }
    document.getElementById('movie-list').innerHTML = ''; // Clear existing content
    currentIndex = 0; // Reset index
    loadMoreMovies(); // Re-render filtered movies
}

async function init() {
    await fetchMovies();
    loadMoreMovies();
    renderCarouselMovies();

    window.addEventListener('scroll', handleScroll);

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', handleSearch);
}

init();
