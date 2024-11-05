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

// Fetch movies
async function fetchMovies(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
}

// Display movies in grid
function displayMovies(movies, container) {
    container.innerHTML = '';
    
    movies.forEach(movie => {
        const movieCard = document.createElement('div');
        movieCard.classList.add('movie-card');
        
        const movieImage = movie.poster_path 
            ? IMAGE_BASE_URL + movie.poster_path 
            : 'https://via.placeholder.com/300x450?text=No+Poster';

        const isFavorite = isFavorited(movie.id);

        movieCard.innerHTML = `
            <img src="${movieImage}" alt="${movie.title}">
            <button class="favorite-btn ${isFavorite ? 'active' : ''}" title="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}">
                <i class="${isFavorite ? 'fas' : 'far'} fa-heart"></i>
            </button>
            <div class="movie-info">
                <h3 class="movie-title">${movie.title}</h3>
                <span class="movie-rating">★ ${movie.vote_average.toFixed(1)}</span>
            </div>
        `;
        
        // Add favorite button click handler
        const favoriteBtn = movieCard.querySelector('.favorite-btn');
        favoriteBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card click event
            toggleFavorite(movie);
            
            // Update button appearance immediately
            favoriteBtn.classList.toggle('active');
            const icon = favoriteBtn.querySelector('i');
            icon.classList.toggle('far');
            icon.classList.toggle('fas');
        });
        
        container.appendChild(movieCard);
    });
}

// Update favorites section visibility
function updateFavoritesSection() {
    if (favorites.length > 0) {
        favoritesSection.style.display = 'block';
        displayMovies(favorites, favoriteMoviesGrid);
    } else {
        favoritesSection.style.display = 'none';
    }
}

// Load popular movies
async function loadPopularMovies() {
    const url = `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
    const movies = await fetchMovies(url);
    displayMovies(movies, moviesGrid);
}

// Handle search
searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
        const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&language=en-US&query=${searchTerm}&page=1`;
        const movies = await fetchMovies(url);
        displayMovies(movies, moviesGrid);
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadPopularMovies();
    updateFavoritesSection(); // Show any existing favorites
});