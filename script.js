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

        // Map data with proper keys
        const movies = data.map(row => ({
            title: row['Title'] || 'No title available',
            image: row['Image URL'] || 'https://via.placeholder.com/150', // Default image if none provided
            links: {
                'Netflix': row['Netflix Link'] || '',
                'Amazon Prime': row['Amazon Prime Link'] || ''
            }
        }));

        return movies;
    } catch (error) {
        console.error("Error fetching movies:", error);
        return []; // Return empty array in case of error
    }
}

function lazyLoadCards() {
    const movieCards = document.querySelectorAll('.movie-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const img = card.querySelector('img');
                
                // Set actual image source
                if (img && img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                }

                // Show the card content
                card.classList.add('loaded');

                // Stop observing once the card has been loaded
                observer.unobserve(card);
            }
        });
    }, {
        rootMargin: '0px',
        threshold: 0.1
    });

    movieCards.forEach(card => {
        observer.observe(card);
    });
}

async function renderMovies() {
    const movieList = document.getElementById('movie-list');
    try {
        const movies = await fetchMovies();

        if (movies.length === 0) {
            movieList.innerHTML = '<p>No movies found.</p>';
            return;
        }

        movieList.innerHTML = ''; // Clear existing content

        movies.forEach(movie => {
            const movieCard = document.createElement('div');
            movieCard.classList.add('movie-card');

            // Generate HTML for OTT links
            const linksHTML = Object.entries(movie.links)
                .filter(([platform, link]) => link) // Exclude blank or undefined links
                .map(([platform, link]) => `<a href="${link}" target="_blank">Watch on ${platform}</a>`)
                .join('<br>');


            movieCard.innerHTML = `
                <div class="movie-card-placeholder">
                    <p>Loading...</p>
                </div>
                <img data-src="${movie.image}" alt="${movie.title} Poster" class="lazy-img" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAhAQABAAAAAIAAAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==">
                <h2>${movie.title}</h2>
                ${linksHTML || '<p>No links available</p>'} <!-- Display message if no links -->
            `;

            movieList.appendChild(movieCard);
        });

        lazyLoadCards(); // Call lazyLoadCards after movies have been rendered
    } catch (error) {
        console.error("Error rendering movies:", error);
        movieList.innerHTML = '<p>Error loading movies. Please try again later.</p>';
    }
}

// Call renderMovies to load on page load
renderMovies();
