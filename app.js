const API_KEY = '02074b68de10c0bbdae114d46b091307';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Get DOM elements
const moviesGrid = document.getElementById('movies-grid');
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search');
const favoritesSection = document.getElementById('favorites-section');
const favoriteMoviesGrid = document.getElementById('favorite-movies');

// Initialize favorites from localStorage
let favorites = JSON.parse(localStorage.getItem('movieflix-favorites')) || [];

// Function to save favorites to localStorage
function saveFavorites() {
    localStorage.setItem('movieflix-favorites', JSON.stringify(favorites));
}

// Function to toggle favorite status
function toggleFavorite(movie) {
    const index = favorites.findIndex(favMovie => favMovie.id === movie.id);
    
    if (index === -1) {
        // Add to favorites
        favorites.push(movie);
    } else {
        // Remove from favorites
        favorites.splice(index, 1);
    }
    
    // Save to localStorage
    saveFavorites();
    
    // Update UI
    displayMovies(favorites, favoriteMoviesGrid);
    loadPopularMovies(); // Refresh main grid to update favorite buttons
    updateFavoritesSection();
}

// Function to check if a movie is favorited
function isFavorited(movieId) {
    return favorites.some(movie => movie.id === movieId);
}

// Add these variables at the top
let currentPage = 1;
let currentSearchTerm = '';
let isLoading = false;

// Update fetchMovies function
async function fetchMovies(url) {
    try {
        console.log('Fetching URL:', url); // Debug log
        const response = await fetch(url);
        const data = await response.json();
        console.log('Fetched data:', data); // Debug log
        return data;
    } catch (error) {
        console.error('Error fetching movies:', error);
        return { results: [], total_pages: 0 };
    }
}

// Update displayMovies function to handle appending
function displayMovies(movies, container, append = false) {
    if (!append) {
        container.innerHTML = '';
    }
    
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        
        const movieImage = movie.poster_path 
            ? IMAGE_BASE_URL + movie.poster_path 
            : 'https://via.placeholder.com/300x450?text=No+Poster';

        const isFavorite = favorites.some(favMovie => favMovie.id === movie.id);

        movieCard.innerHTML = `
            <img src="${movieImage}" alt="${movie.title}">
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" title="Add to favorites">
                <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
            </button>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <span class="movie-rating">★ ${movie.vote_average.toFixed(1)}</span>
            </div>
        `;
        
        const favoriteBtn = movieCard.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleFavorite(movie);
        });
        
        container.appendChild(movieCard);
    });

    // Show/hide load more button based on results
    const loadMoreBtn = document.getElementById('load-more');
    if (movies.length === 0) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

// Add loadMovies function
async function loadMovies(searchTerm = '', page = 1) {
    if (isLoading) return;
    
    isLoading = true;
    const loadMoreBtn = document.getElementById('load-more');
    loadMoreBtn.textContent = 'Loading...';
    loadMoreBtn.disabled = true;

    try {
        const url = searchTerm
            ? `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${searchTerm}&page=${page}`
            : `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=${page}`;

        const data = await fetchMovies(url);
        
        if (data.results && data.results.length > 0) {
            displayMovies(data.results, moviesGrid, page > 1);
            
            // Enable load more button if there are more pages
            if (page < data.total_pages) {
                loadMoreBtn.style.display = 'block';
            } else {
                loadMoreBtn.style.display = 'none';
            }
        } else {
            if (page === 1) {
                moviesGrid.innerHTML = '<p>No movies found</p>';
            }
            loadMoreBtn.style.display = 'none';
        }

    } catch (error) {
        console.error('Error loading movies:', error);
        moviesGrid.innerHTML += '<p>Error loading movies</p>';
    } finally {
        isLoading = false;
        loadMoreBtn.textContent = 'Load More';
        loadMoreBtn.disabled = false;
    }
}

// Update loadPopularMovies function
async function loadPopularMovies() {
    currentPage = 1;
    currentSearchTerm = '';
    await loadMovies();
}

// Update search handler
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        currentPage = 1;
        currentSearchTerm = searchTerm;
        await loadMovies(searchTerm, currentPage);
    }
});

// Add load more button click handler
document.getElementById('load-more').addEventListener('click', async () => {
    currentPage++;
    console.log('Loading more movies, page:', currentPage); // Debug log
    await loadMovies(currentSearchTerm, currentPage);
});

// Update favorites section visibility
function updateFavoritesSection() {
    if (favorites.length > 0) {
        favoritesSection.style.display = 'block';
        displayMovies(favorites, favoriteMoviesGrid);
    } else {
        favoritesSection.style.display = 'none';
    }
}

// Add these at the top with your other constants
const themeToggle = document.getElementById('theme-toggle');
const rootElement = document.documentElement;

// Function to toggle theme
function toggleTheme() {
    const currentTheme = rootElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Update theme attribute
    rootElement.setAttribute('data-theme', newTheme);
    
    // Update toggle button icon
    const icon = themeToggle.querySelector('i');
    icon.classList.remove(newTheme === 'light' ? 'fa-sun' : 'fa-moon');
    icon.classList.add(newTheme === 'light' ? 'fa-moon' : 'fa-sun');
    
    // Save preference to localStorage
    localStorage.setItem('movieflix-theme', newTheme);
}

// Function to initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('movieflix-theme');
    if (savedTheme) {
        rootElement.setAttribute('data-theme', savedTheme);
        const icon = themeToggle.querySelector('i');
        icon.classList.remove(savedTheme === 'light' ? 'fa-moon' : 'fa-sun');
        icon.classList.add(savedTheme === 'light' ? 'fa-sun' : 'fa-moon');
    }
}

// Add event listener for theme toggle
themeToggle.addEventListener('click', toggleTheme);

// Update initialization
async function initializeApp() {
    currentPage = 1;
    currentSearchTerm = '';
    await loadMovies('', currentPage);
    updateFavoritesSection();
}

// Initialize the app
document.addEventListener('DOMContentLoaded', initializeApp);