// API Base URL - use relative path since frontend is served by same server
const API_BASE_URL = window.location.origin;

// State
let allArticles = {};
let currentCategory = 'all';
let isSearchMode = false;
let searchResults = [];
let isLast24HoursFilter = false;
let weeklySummaryData = null;

// DOM Elements
const categoryTabsContainer = document.getElementById('categoryTabs');
const articlesGrid = document.getElementById('articlesGrid');
const articlesContainer = document.getElementById('articlesContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const emptyState = document.getElementById('emptyState');
const refreshBtn = document.getElementById('refreshBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const currentCategoryTitle = document.getElementById('currentCategory');
const articleCount = document.getElementById('articleCount');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const weeklySummarySection = document.getElementById('weeklySummarySection');
const statsGrid = document.getElementById('statsGrid');
const highlightsContainer = document.getElementById('highlightsContainer');
const filter24hBtn = document.getElementById('filter24hBtn');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeCategories();
    fetchArticles();
    fetchWeeklySummary();
    
    // Event listeners
    refreshBtn.addEventListener('click', () => {
        fetchArticles();
        fetchWeeklySummary();
    });
    
    downloadPdfBtn.addEventListener('click', () => {
        downloadNewsletter();
    });
    
    // Filter event listener
    filter24hBtn.addEventListener('click', () => {
        toggle24HourFilter();
    });
    
    // Search event listeners
    searchInput.addEventListener('input', (e) => {
        // Show/hide clear button based on input
        if (e.target.value.trim()) {
            clearSearchBtn.classList.remove('hidden');
        } else {
            clearSearchBtn.classList.add('hidden');
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch(searchInput.value.trim());
        }
    });
    
    searchBtn.addEventListener('click', () => {
        performSearch(searchInput.value.trim());
    });
    
    clearSearchBtn.addEventListener('click', () => {
        clearSearch();
    });
});

// Initialize category tabs
function initializeCategories() {
    const categories = [
        'LLMs & Foundation Models',
        'AI Tools & Platforms',
        'Open Source AI Projects',
        'AI Research & Papers',
        'AI Agents & Automation',
        'AI in Development',
        'Multimodal AI'
    ];
    
    // Add "All" tab
    const allTab = createCategoryTab('All', 'all', true);
    categoryTabsContainer.appendChild(allTab);
    
    // Add category tabs
    categories.forEach(category => {
        const tab = createCategoryTab(category, category, false);
        categoryTabsContainer.appendChild(tab);
    });
}

// Create category tab element
function createCategoryTab(name, value, isActive) {
    const tab = document.createElement('button');
    tab.className = `category-tab px-4 py-2 rounded-lg font-medium ${isActive ? 'active' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`;
    tab.textContent = name;
    tab.dataset.category = value;
    
    tab.addEventListener('click', () => {
        selectCategory(value);
    });
    
    return tab;
}

// Select category
function selectCategory(category) {
    currentCategory = category;
    
    // Update active tab
    const tabs = document.querySelectorAll('.category-tab');
    tabs.forEach(tab => {
        if (tab.dataset.category === category) {
            tab.className = 'category-tab px-4 py-2 rounded-lg font-medium active';
        } else {
            tab.className = 'category-tab px-4 py-2 rounded-lg font-medium bg-gray-700 text-gray-300 hover:bg-gray-600';
        }
    });
    
    // Display articles for selected category
    displayArticles();
}

// Fetch articles from API
async function fetchArticles() {
    showLoading();
    
    try {
        let url = `${API_BASE_URL}/api/feeds`;
        
        // Add filter parameter if 24h filter is active
        if (isLast24HoursFilter) {
            url += '?filter=24h';
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch articles');
        }
        
        const data = await response.json();
        allArticles = data.categories;
        
        displayArticles();
    } catch (error) {
        console.error('Error fetching articles:', error);
        showError('Failed to load articles. Please make sure the backend is running.');
    }
}

// Display articles
function displayArticles() {
    articlesGrid.innerHTML = '';
    
    let articlesToDisplay = [];
    
    if (currentCategory === 'all') {
        // Show all articles from all categories
        Object.values(allArticles).forEach(categoryArticles => {
            articlesToDisplay = articlesToDisplay.concat(categoryArticles);
        });
        currentCategoryTitle.textContent = 'All Articles';
    } else {
        // Show articles from selected category
        articlesToDisplay = allArticles[currentCategory] || [];
        currentCategoryTitle.textContent = currentCategory;
    }
    
    if (articlesToDisplay.length === 0) {
        showEmpty();
        return;
    }
    
    articleCount.textContent = `${articlesToDisplay.length} articles`;
    
    articlesToDisplay.forEach((article, index) => {
        const articleCard = createArticleCard(article, index);
        articlesGrid.appendChild(articleCard);
    });
    
    hideLoading();
    articlesContainer.classList.remove('hidden');
    emptyState.classList.add('hidden');
}

// Create article card element
function createArticleCard(article, index) {
    const card = document.createElement('div');
    card.className = 'article-card bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 fade-in';
    card.style.animationDelay = `${index * 0.05}s`;
    
    // Category badge
    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'inline-block bg-blue-900 text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded mb-3';
    categoryBadge.textContent = article.category || 'Uncategorized';
    
    // Title
    const title = document.createElement('h3');
    title.className = 'text-lg font-bold text-white mb-2 line-clamp-2';
    title.textContent = article.title;
    
    // Meta information
    const meta = document.createElement('div');
    meta.className = 'flex items-center space-x-2 text-sm text-gray-400 mb-3';
    meta.innerHTML = `
        <i class="fas fa-calendar-alt"></i>
        <span>${article.published_date || 'Unknown date'}</span>
        <span>•</span>
        <span class="font-medium">${article.source || 'Unknown source'}</span>
    `;
    
    // Summary
    const summary = document.createElement('p');
    summary.className = 'text-gray-300 text-sm mb-4 line-clamp-3';
    const cleanSummary = stripHtmlTags(article.summary || 'No summary available');
    summary.textContent = cleanSummary.length > 150 ? cleanSummary.substring(0, 150) + '...' : cleanSummary;
    
    // Read more link
    const link = document.createElement('a');
    link.href = article.link || '#';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'inline-flex items-center text-blue-400 hover:text-blue-300 font-medium text-sm';
    link.innerHTML = `
        Read more
        <i class="fas fa-arrow-right ml-2"></i>
    `;
    
    card.appendChild(categoryBadge);
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(summary);
    card.appendChild(link);
    
    return card;
}

// Download newsletter as PDF
async function downloadNewsletter() {
    const originalText = downloadPdfBtn.querySelector('span').textContent;
    downloadPdfBtn.querySelector('span').textContent = 'Generating...';
    downloadPdfBtn.disabled = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/newsletter/pdf`);
        
        if (!response.ok) {
            throw new Error('Failed to generate newsletter');
        }
        
        // Create blob from response
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AI_Scout_Newsletter_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        downloadPdfBtn.querySelector('span').textContent = originalText;
        downloadPdfBtn.disabled = false;
    } catch (error) {
        console.error('Error downloading newsletter:', error);
        alert('Failed to download newsletter. Please try again.');
        downloadPdfBtn.querySelector('span').textContent = originalText;
        downloadPdfBtn.disabled = false;
    }
}

// Utility functions
function showLoading() {
    loadingIndicator.classList.remove('hidden');
    articlesContainer.classList.add('hidden');
    emptyState.classList.add('hidden');
    // Hide footer during loading
    document.getElementById('footer').classList.add('hidden');
}

function hideLoading() {
    loadingIndicator.classList.add('hidden');
    // Show footer when content is loaded
    document.getElementById('footer').classList.remove('hidden');
}

function showEmpty() {
    loadingIndicator.classList.add('hidden');
    articlesContainer.classList.add('hidden');
    emptyState.classList.remove('hidden');
    // Show footer even in empty state
    document.getElementById('footer').classList.remove('hidden');
}

function showError(message) {
    hideLoading();
    alert(message);
}

function stripHtmlTags(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// Weekly Summary Functions

async function fetchWeeklySummary() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/weekly-summary`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch weekly summary');
        }
        
        const data = await response.json();
        weeklySummaryData = data.summary;
        
        displayWeeklySummary();
    } catch (error) {
        console.error('Error fetching weekly summary:', error);
        // Don't show error to user, just hide the section
        weeklySummarySection.classList.add('hidden');
    }
}

function displayWeeklySummary() {
    if (!weeklySummaryData) {
        weeklySummarySection.classList.add('hidden');
        return;
    }
    
    const stats = weeklySummaryData.statistics;
    const highlights = weeklySummaryData.highlights;
    
    // Display statistics
    statsGrid.innerHTML = '';
    
    // Total Articles
    const totalCard = createStatCard(
        'fas fa-newspaper',
        stats.total_articles || 0,
        'Total Articles',
        'bg-blue-700'
    );
    statsGrid.appendChild(totalCard);
    
    // Categories
    const categoriesCount = Object.keys(stats.category_breakdown || {}).length;
    const categoriesCard = createStatCard(
        'fas fa-layer-group',
        categoriesCount,
        'Categories',
        'bg-purple-700'
    );
    statsGrid.appendChild(categoriesCard);
    
    // Top Sources
    const sourcesCount = (stats.top_sources || []).length;
    const sourcesCard = createStatCard(
        'fas fa-rss',
        sourcesCount,
        'Sources',
        'bg-green-700'
    );
    statsGrid.appendChild(sourcesCard);
    
    // Display highlights
    highlightsContainer.innerHTML = '';
    
    if (highlights && highlights.length > 0) {
        highlights.slice(0, 3).forEach((article, index) => {
            const highlightCard = createHighlightCard(article, index + 1);
            highlightsContainer.appendChild(highlightCard);
        });
    } else {
        highlightsContainer.innerHTML = '<p class="text-blue-200 text-sm">No highlights available</p>';
    }
    
    // Show the section
    weeklySummarySection.classList.remove('hidden');
}

function createStatCard(icon, value, label, bgColor) {
    const card = document.createElement('div');
    card.className = `stat-card ${bgColor} rounded-lg p-4 text-center`;
    card.innerHTML = `
        <i class="${icon} text-3xl mb-2"></i>
        <div class="text-3xl font-bold">${value}</div>
        <div class="text-sm opacity-90">${label}</div>
    `;
    return card;
}

function createHighlightCard(article, index) {
    const card = document.createElement('div');
    card.className = 'highlight-card bg-white bg-opacity-10 rounded-lg p-4';
    
    const title = document.createElement('h4');
    title.className = 'font-semibold text-white mb-2 line-clamp-2';
    title.textContent = `${index}. ${article.title || 'No Title'}`;
    
    const meta = document.createElement('div');
    meta.className = 'text-sm text-blue-200 mb-2';
    meta.innerHTML = `
        <i class="fas fa-calendar-alt"></i> ${article.published_date || 'N/A'}
        <span class="mx-2">•</span>
        <i class="fas fa-tag"></i> ${article.category || 'Uncategorized'}
    `;
    
    const link = document.createElement('a');
    link.href = article.link || '#';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'text-blue-300 hover:text-blue-100 text-sm flex items-center mt-2';
    link.innerHTML = `
        Read article
        <i class="fas fa-external-link-alt ml-2 text-xs"></i>
    `;
    
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(link);
    
    return card;
}

// Filter Functions

function toggle24HourFilter() {
    isLast24HoursFilter = !isLast24HoursFilter;
    
    // Update button appearance
    if (isLast24HoursFilter) {
        filter24hBtn.classList.add('active');
    } else {
        filter24hBtn.classList.remove('active');
    }
    
    // Clear search mode when toggling filter
    if (isSearchMode) {
        clearSearch();
    }
    
    // Fetch articles with or without filter
    fetchArticles();
}

// Search Functions

async function performSearch(query) {
    if (!query) {
        clearSearch();
        return;
    }
    
    showLoading();
    isSearchMode = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error('Search failed');
        }
        
        const data = await response.json();
        searchResults = data.articles || [];
        
        displaySearchResults(data);
    } catch (error) {
        console.error('Error performing search:', error);
        showError('Search failed. Please try again.');
        hideLoading();
    }
}

function displaySearchResults(data) {
    articlesGrid.innerHTML = '';
    
    currentCategoryTitle.textContent = 'Search Results';
    
    if (searchResults.length === 0) {
        articleCount.textContent = 'No results found';
        showEmpty();
        return;
    }
    
    // Limit to top 5 most relevant results
    const topResults = searchResults.slice(0, 5);
    const totalResults = searchResults.length;
    
    articleCount.textContent = `Showing top ${topResults.length} of ${totalResults} results`;
    
    // Find max score for percentage calculation
    const maxScore = Math.max(...topResults.map(a => a.relevance_score || 0));
    
    topResults.forEach((article, index) => {
        const articleCard = createArticleCard(article, index);
        
        // Add relevance score indicator if available
        if (article.relevance_score && maxScore > 0) {
            const percentage = Math.round((article.relevance_score / maxScore) * 100);
            const scoreIndicator = document.createElement('div');
            scoreIndicator.className = 'relevance-score text-sm mt-3 flex items-center gap-1';
            scoreIndicator.innerHTML = `<i class="fas fa-star"></i> Relevance: ${percentage}%`;
            articleCard.appendChild(scoreIndicator);
        }
        
        articlesGrid.appendChild(articleCard);
    });
    
    hideLoading();
    articlesContainer.classList.remove('hidden');
    emptyState.classList.add('hidden');
}

function clearSearch() {
    isSearchMode = false;
    searchResults = [];
    searchInput.value = '';
    clearSearchBtn.classList.add('hidden');
    searchInput.classList.remove('search-active');
    
    // Clear 24h filter when clearing search
    if (isLast24HoursFilter) {
        isLast24HoursFilter = false;
        filter24hBtn.classList.remove('active');
    }
    
    // Return to current category view
    displayArticles();
}

