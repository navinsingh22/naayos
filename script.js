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

        filteredMovies = [...movies]; // Keep all movies in filteredMovies initially
        fuse = new Fuse(movies, { keys: ['title'], threshold: 0.3, includeScore: true });
        return movies;
    } catch (error) {
        console.error("Error fetching movies:", error);
        return [];
    }
}

// Renders a batch of movie cards
function renderMovies(startIndex, endIndex) {
    const movieList = document.getElementById('movie-list');
    const movieBatch = filteredMovies.slice(startIndex, endIndex);

    movieBatch.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');

        const linksHTML = Object.entries(movie.links)
            .filter(([platform, link]) => link) // Only show platforms with valid links
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

// Renders movies in the carousel
async function renderCarouselMovies() {
    const carouselSlides = document.getElementById('carousel-slides'); // Select the correct UL element
    const movies = await fetchMovies(); // Fetch movies if not done already

    // Clear any existing slides
    carouselSlides.innerHTML = '';

    movies.slice(0, 8).forEach(movie => {
        const movieItem = document.createElement('li');
        movieItem.classList.add('item');
        movieItem.style.backgroundImage = `url(${movie.image})`;

        movieItem.innerHTML = `
            <div class="content">
                <h2 class="title">${movie.title}</h2>
                <p class="description">${movie.description}</p>
                <button onclick="window.open('${movie.links['Amazon Prime']}', '_blank')">Watch on Amazon Prime</button>` : ''}
            </div>
        `;

        carouselSlides.appendChild(movieItem);
    });
}

// Handles the carousel controls for sliding next/prev
function activate(e) {
    const items = document.querySelectorAll('.item');
    const slider = document.querySelector('.slider');

    if (e.target.matches('.next')) {
        slider.append(items[0]); // Move the first item to the end
    } else if (e.target.matches('.prev')) {
        slider.prepend(items[items.length - 1]); // Move the last item to the front
    }
}

document.addEventListener('click', activate, false);

// Load more movies for infinite scroll
function loadMoreMovies() {
    renderMovies(currentIndex, currentIndex + batchSize);
    currentIndex += batchSize;
}

// Infinite scrolling event handler
function handleScroll() {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
        loadMoreMovies(); // Load more movies when scrolled near bottom
    }
}

// Handles the search functionality with Fuse.js
function handleSearch(event) {
    const searchTerm = event.target.value.trim();
    if (searchTerm === '') {
        filteredMovies = [...movies]; // Reset to all movies if search is empty
    } else {
        const results = fuse.search(searchTerm).map(result => result.item);
        filteredMovies = results;
    }
    document.getElementById('movie-list').innerHTML = ''; // Clear the current movie list
    currentIndex = 0; // Reset the index for infinite scroll
    loadMoreMovies(); // Render the new filtered movies
}

let currentSlideIndex = 0; // To track the current slide

function nextSlide() {
    const items = document.querySelectorAll('.item');
    if (items.length === 0) return; // Check if there are any items
    currentSlideIndex = (currentSlideIndex + 1) % items.length; // Move to the next slide
    updateCarousel();
}

function prevSlide() {
    const items = document.querySelectorAll('.item');
    if (items.length === 0) return; // Check if there are any items
    currentSlideIndex = (currentSlideIndex - 1 + items.length) % items.length; // Move to the previous slide
    updateCarousel();
}

function updateCarousel() {
    const items = document.querySelectorAll('.item');
    items.forEach((item, index) => {
        item.style.transform = `translateX(${(index - currentSlideIndex) * 100}%)`; // Adjust position
    });
}

// Initialize the page by fetching data and setting up scroll and search events
async function init() {
    await fetchMovies(); // Fetch the movie data once
    loadMoreMovies(); // Render the first batch of movies
    renderCarouselMovies(); // Render the movies in the carousel

    window.addEventListener('scroll', handleScroll); // Set up infinite scroll

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', handleSearch); // Set up search input event
}

init();
