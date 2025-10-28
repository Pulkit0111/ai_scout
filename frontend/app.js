// API Base URL - use relative path since frontend is served by same server
const API_BASE_URL = window.location.origin;

// State
let allArticles = {};
let activeFilters = new Set(); // Set of active filter names
let activeTab = 'articles'; // 'articles' or 'weeklySummary'
let isSearchMode = false;
let searchResults = [];
let weeklySummaryData = null;
let weeklySummaryLoaded = false;

// DOM Elements
const articlesTab = document.getElementById('articlesTab');
const weeklySummaryTab = document.getElementById('weeklySummaryTab');
const articlesTabContent = document.getElementById('articlesTabContent');
const weeklySummaryTabContent = document.getElementById('weeklySummaryTabContent');
const categoryFilters = document.getElementById('categoryFilters');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
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
const weeklySummaryLoading = document.getElementById('weeklySummaryLoading');
const statsGrid = document.getElementById('statsGrid');
const highlightsContainer = document.getElementById('highlightsContainer');
const categoryBreakdown = document.getElementById('categoryBreakdown');
const topSources = document.getElementById('topSources');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeFilters();
    initializeTabs();
    fetchArticles();
    
    // Event listeners
    refreshBtn.addEventListener('click', () => {
        fetchArticles();
        if (weeklySummaryLoaded) {
            fetchWeeklySummary();
        }
    });
    
    downloadPdfBtn.addEventListener('click', () => {
        downloadNewsletter();
    });
    
    clearFiltersBtn.addEventListener('click', () => {
        clearAllFilters();
    });
    
    // Search event listeners
    searchInput.addEventListener('input', (e) => {
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

// Initialize tabs
function initializeTabs() {
    articlesTab.addEventListener('click', () => switchTab('articles'));
    weeklySummaryTab.addEventListener('click', () => switchTab('weeklySummary'));
}

// Switch between tabs
function switchTab(tab) {
    activeTab = tab;
    
    if (tab === 'articles') {
        // Show articles tab
        articlesTab.classList.add('active');
        weeklySummaryTab.classList.remove('active');
        articlesTabContent.classList.add('active');
        weeklySummaryTabContent.classList.remove('active');
    } else {
        // Show weekly summary tab
        articlesTab.classList.remove('active');
        weeklySummaryTab.classList.add('active');
        articlesTabContent.classList.remove('active');
        weeklySummaryTabContent.classList.add('active');
        
        // Lazy load weekly summary if not already loaded
        if (!weeklySummaryLoaded) {
            fetchWeeklySummary();
        }
    }
}

// Initialize filter tags
function initializeFilters() {
    const categories = [
        'LLMs & Foundation Models',
        'AI Tools & Platforms',
        'Open Source AI Projects',
        'AI Research & Papers',
        'AI Agents & Automation',
        'AI in Development',
        'Multimodal AI'
    ];
    
    // Add category filter tags
    categories.forEach(category => {
        const filterTag = createFilterTag(category, 'category');
        categoryFilters.appendChild(filterTag);
    });
    
    // Add event listeners to time filters (already in HTML)
    const timeFilterTags = document.querySelectorAll('.time-filter');
    timeFilterTags.forEach(tag => {
        tag.addEventListener('click', () => toggleFilter(tag.dataset.filter, 'time'));
    });
}

// Create filter tag element
function createFilterTag(name, type) {
    const tag = document.createElement('button');
    tag.className = 'filter-tag';
    tag.textContent = name;
    tag.dataset.filter = name;
    tag.dataset.type = type;
    
    tag.addEventListener('click', () => toggleFilter(name, type));
    
    return tag;
}

// Toggle filter on/off
function toggleFilter(filterName, filterType) {
    // If in search mode, clear it first
    if (isSearchMode) {
        clearSearch();
    }
    
    // Toggle the filter
    if (activeFilters.has(filterName)) {
        activeFilters.delete(filterName);
    } else {
        // For time filters, only allow one at a time
        if (filterType === 'time') {
            activeFilters.forEach(f => {
                if (f === '24h' || f === '7d' || f === '30d') {
                    activeFilters.delete(f);
                }
            });
        }
        activeFilters.add(filterName);
    }
    
    // Update UI
    updateFilterUI();
    
    // Fetch articles with new filters
    fetchArticles();
}

// Update filter UI to show active states
function updateFilterUI() {
    // Update category filters
    const categoryTags = categoryFilters.querySelectorAll('.filter-tag');
    categoryTags.forEach(tag => {
        if (activeFilters.has(tag.dataset.filter)) {
            tag.classList.add('active');
        } else {
            tag.classList.remove('active');
        }
    });
    
    // Update time filters
    const timeTags = document.querySelectorAll('.time-filter');
    timeTags.forEach(tag => {
        if (activeFilters.has(tag.dataset.filter)) {
            tag.classList.add('active');
        } else {
            tag.classList.remove('active');
        }
    });
}

// Clear all filters
function clearAllFilters() {
    activeFilters.clear();
    updateFilterUI();
    fetchArticles();
}

// Fetch articles from API
async function fetchArticles() {
    showLoading();
    
    try {
        let url = `${API_BASE_URL}/api/feeds`;
        
        // Build filters query parameter
        if (activeFilters.size > 0) {
            const filtersArray = Array.from(activeFilters);
            url += `?filters=${encodeURIComponent(filtersArray.join(','))}`;
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
    let categoryName = 'All Articles';
    
    // Get all articles from all categories
    Object.values(allArticles).forEach(categoryArticles => {
        articlesToDisplay = articlesToDisplay.concat(categoryArticles);
    });
    
    // Update title based on active filters
    if (activeFilters.size > 0) {
        const filterNames = Array.from(activeFilters);
        categoryName = `Filtered: ${filterNames.join(', ')}`;
    }
    
    currentCategoryTitle.textContent = categoryName;
    
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
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AI_Scout_Newsletter_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        
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
    document.getElementById('footer').classList.add('hidden');
}

function hideLoading() {
    loadingIndicator.classList.add('hidden');
    document.getElementById('footer').classList.remove('hidden');
}

function showEmpty() {
    loadingIndicator.classList.add('hidden');
    articlesContainer.classList.add('hidden');
    emptyState.classList.remove('hidden');
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
    weeklySummaryLoading.classList.remove('hidden');
    weeklySummarySection.classList.add('hidden');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/weekly-summary`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch weekly summary');
        }
        
        const data = await response.json();
        weeklySummaryData = data.summary;
        weeklySummaryLoaded = true;
        
        displayWeeklySummary();
    } catch (error) {
        console.error('Error fetching weekly summary:', error);
        weeklySummaryLoading.innerHTML = `
            <div class="text-center text-red-400">
                <i class="fas fa-exclamation-circle text-4xl mb-4"></i>
                <p>Failed to load weekly summary</p>
            </div>
        `;
    }
}

function displayWeeklySummary() {
    if (!weeklySummaryData) {
        return;
    }
    
    const stats = weeklySummaryData.statistics;
    const highlights = weeklySummaryData.highlights;
    
    // Display main statistics
    statsGrid.innerHTML = '';
    
    const totalCard = createStatCard(
        'fas fa-newspaper',
        stats.total_articles || 0,
        'Total Articles',
        'bg-blue-700'
    );
    statsGrid.appendChild(totalCard);
    
    const categoriesCount = Object.keys(stats.category_breakdown || {}).length;
    const categoriesCard = createStatCard(
        'fas fa-layer-group',
        categoriesCount,
        'Categories',
        'bg-purple-700'
    );
    statsGrid.appendChild(categoriesCard);
    
    const sourcesCount = (stats.top_sources || []).length;
    const sourcesCard = createStatCard(
        'fas fa-rss',
        sourcesCount,
        'Sources',
        'bg-green-700'
    );
    statsGrid.appendChild(sourcesCard);
    
    // Display category breakdown
    categoryBreakdown.innerHTML = '';
    if (stats.category_breakdown) {
        Object.entries(stats.category_breakdown).forEach(([category, count]) => {
            const breakdownCard = document.createElement('div');
            breakdownCard.className = 'bg-white bg-opacity-10 rounded-lg p-4';
            breakdownCard.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="text-sm">${category}</span>
                    <span class="text-xl font-bold">${count}</span>
                </div>
            `;
            categoryBreakdown.appendChild(breakdownCard);
        });
    }
    
    // Display top sources
    topSources.innerHTML = '';
    if (stats.top_sources) {
        stats.top_sources.forEach(source => {
            const sourceCard = document.createElement('div');
            sourceCard.className = 'bg-white bg-opacity-10 rounded-lg p-4 flex justify-between items-center';
            sourceCard.innerHTML = `
                <div class="flex items-center">
                    <i class="fas fa-rss mr-3 text-green-400"></i>
                    <span class="font-medium">${source.source}</span>
                </div>
                <span class="text-xl font-bold">${source.count}</span>
            `;
            topSources.appendChild(sourceCard);
        });
    }
    
    // Display highlights
    highlightsContainer.innerHTML = '';
    if (highlights && highlights.length > 0) {
        highlights.forEach((article, index) => {
            const highlightCard = createHighlightCard(article, index + 1);
            highlightsContainer.appendChild(highlightCard);
        });
    } else {
        highlightsContainer.innerHTML = '<p class="text-blue-200 text-sm">No highlights available</p>';
    }
    
    weeklySummaryLoading.classList.add('hidden');
    weeklySummarySection.classList.remove('hidden');
}

function createStatCard(icon, value, label, bgColor) {
    const card = document.createElement('div');
    card.className = `stat-card ${bgColor} rounded-lg p-6 text-center shadow-lg`;
    card.innerHTML = `
        <i class="${icon} text-4xl mb-3"></i>
        <div class="text-4xl font-bold mb-1">${value}</div>
        <div class="text-sm opacity-90 uppercase tracking-wide">${label}</div>
    `;
    return card;
}

function createHighlightCard(article, index) {
    const card = document.createElement('div');
    card.className = 'highlight-card bg-white bg-opacity-10 rounded-lg p-5 hover:bg-opacity-15 transition';
    
    const title = document.createElement('h4');
    title.className = 'font-semibold text-white mb-2 text-lg';
    title.textContent = `${index}. ${article.title || 'No Title'}`;
    
    const meta = document.createElement('div');
    meta.className = 'text-sm text-blue-200 mb-3 flex items-center flex-wrap gap-3';
    meta.innerHTML = `
        <span><i class="fas fa-calendar-alt mr-1"></i> ${article.published_date || 'N/A'}</span>
        <span><i class="fas fa-tag mr-1"></i> ${article.category || 'Uncategorized'}</span>
        <span><i class="fas fa-rss mr-1"></i> ${article.source || 'Unknown'}</span>
    `;
    
    const summary = document.createElement('p');
    summary.className = 'text-blue-100 text-sm mb-3 line-clamp-2';
    summary.textContent = stripHtmlTags(article.summary || 'No summary available');
    
    const link = document.createElement('a');
    link.href = article.link || '#';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'text-blue-300 hover:text-blue-100 text-sm flex items-center font-medium';
    link.innerHTML = `
        Read full article
        <i class="fas fa-external-link-alt ml-2 text-xs"></i>
    `;
    
    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(summary);
    card.appendChild(link);
    
    return card;
}

// Search Functions

async function performSearch(query) {
    if (!query) {
        clearSearch();
        return;
    }
    
    showLoading();
    isSearchMode = true;
    
    // Clear filters when searching
    activeFilters.clear();
    updateFilterUI();
    
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
    
    const topResults = searchResults.slice(0, 5);
    const totalResults = searchResults.length;
    
    articleCount.textContent = `Showing top ${topResults.length} of ${totalResults} results`;
    
    const maxScore = Math.max(...topResults.map(a => a.relevance_score || 0));
    
    topResults.forEach((article, index) => {
        const articleCard = createArticleCard(article, index);
        
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
    
    displayArticles();
}
