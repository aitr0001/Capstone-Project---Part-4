// DOM Elements
const searchForm = document.getElementById('searchForm');
const dateInput = document.getElementById('dateInput');
const loadingEl = document.getElementById('loading');
const resultSection = document.getElementById('result');
const titleEl = document.getElementById('title');
const dateEl = document.getElementById('date');
const imageEl = document.getElementById('image');
const descriptionEl = document.getElementById('description');
const hdLinkEl = document.getElementById('hdLink');
const saveBtn = document.getElementById('saveBtn');
const favoritesDiv = document.getElementById('favorites');

// State
let currentAPOD = null;
let favorites = [];

// API Configuration
const API_KEY = 'DEMO_KEY';
const API_URL = 'https://api.nasa.gov/planetary/apod';

// Fallback image (always works)
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200';
const FALLBACK_HD = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=2000';

// Initialize
function init() {
  // Set max date to today
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('max', today);
  dateInput.value = today; // Set default to today
  
  // Load favorites from localStorage
  loadFavorites();
  
  // Display favorites
  displayFavorites();
  
  // Load today's APOD on startup
  loadTodaysAPOD();
}

// Load today's APOD on page load
async function loadTodaysAPOD() {
  showLoading();
  
  try {
    const response = await fetch(`${API_URL}?api_key=${API_KEY}`);
    const data = await response.json();
    
    if (data.media_type === 'image') {
      displayAPOD(data);
    } else {
      useFallbackImage();
    }
  } catch (error) {
    useFallbackImage();
  }
  
  hideLoading();
}

// Display APOD data
function displayAPOD(data) {
  currentAPOD = data;
  
  titleEl.textContent = data.title;
  dateEl.textContent = data.date;
  descriptionEl.textContent = data.explanation;
  imageEl.src = data.url;
  imageEl.alt = data.title;
  hdLinkEl.href = data.hdurl || data.url;
}

// Use fallback image
function useFallbackImage() {
  const today = new Date().toISOString().split('T')[0];
  
  currentAPOD = {
    title: "Space Adventure (Demo Image)",
    date: today,
    explanation: "This is a demo image. The NASA API may be rate limited. Get your free API key from api.nasa.gov for unlimited access.",
    url: FALLBACK_IMAGE,
    hdurl: FALLBACK_HD,
    media_type: "image"
  };
  
  titleEl.textContent = currentAPOD.title;
  dateEl.textContent = currentAPOD.date;
  descriptionEl.textContent = currentAPOD.explanation;
  imageEl.src = currentAPOD.url;
  imageEl.alt = currentAPOD.title;
  hdLinkEl.href = currentAPOD.hdurl;
}

// Load favorites from localStorage
function loadFavorites() {
  const stored = localStorage.getItem('apodFavorites');
  favorites = stored ? JSON.parse(stored) : [];
}

// Save favorites to localStorage
function saveFavorites() {
  localStorage.setItem('apodFavorites', JSON.stringify(favorites));
}

// Display favorites
function displayFavorites() {
  favoritesDiv.innerHTML = '';
  
  if (favorites.length === 0) {
    favoritesDiv.innerHTML = '<p style="color: #94a3b8;">No favorites saved yet.</p>';
    return;
  }
  
  favorites.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'favorite-card';
    
    card.innerHTML = `
      <img src="${item.url}" alt="${item.title}" loading="lazy">
      <p>${item.date}</p>
      <button class="delete-fav" data-index="${index}">Delete</button>
    `;
    
    favoritesDiv.appendChild(card);
  });
}

// Show loading state
function showLoading() {
  loadingEl.classList.remove('hidden');
  resultSection.classList.add('hidden');
}

// Hide loading state
function hideLoading() {
  loadingEl.classList.add('hidden');
  resultSection.classList.remove('hidden');
}

// Search Form Handler
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const selectedDate = dateInput.value;
  if (!selectedDate) return;
  
  showLoading();
  
  try {
    const response = await fetch(`${API_URL}?api_key=${API_KEY}&date=${selectedDate}`);
    
    // If rate limited, use fallback
    if (!response.ok) {
      useFallbackImage();
      hideLoading();
      return;
    }
    
    const data = await response.json();
    
    if (data.media_type !== 'image') {
      alert('This date has a video. Showing demo image instead.');
      useFallbackImage();
    } else {
      displayAPOD(data);
    }
    
    hideLoading();
    
  } catch (error) {
    useFallbackImage();
    hideLoading();
  }
});

// Save to Favorites
saveBtn.addEventListener('click', () => {
  if (!currentAPOD) return;
  
  // Check if already in favorites
  const exists = favorites.some(fav => fav.date === currentAPOD.date);
  if (exists) {
    alert('This image is already in favorites!');
    return;
  }
  
  favorites.push(currentAPOD);
  saveFavorites();
  displayFavorites();
  alert('Added to favorites!');
});

// Delete from Favorites (Event Delegation)
favoritesDiv.addEventListener('click', (e) => {
  if (e.target.classList.contains('delete-fav')) {
    const index = e.target.dataset.index;
    favorites.splice(index, 1);
    saveFavorites();
    displayFavorites();
  }
});

// Image click handler for HD view
imageEl.addEventListener('click', () => {
  if (currentAPOD && currentAPOD.hdurl) {
    window.open(currentAPOD.hdurl, '_blank');
  }
});

// Initialize the app
init();