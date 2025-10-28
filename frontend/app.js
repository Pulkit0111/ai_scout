// API Base URL - use relative path since frontend is served by same server
const API_BASE_URL = window.location.origin;

// State - Store ALL articles client-side for filtering
let allArticlesRaw = []; // Flat list of all articles
let allArticlesByCategory = {}; // Articles grouped by category
let activeTab = 'articles'; // 'articles' or 'weeklySummary'
let isSearchMode = false;
let searchResults = [];
let weeklySummaryData = null;
let weeklySummaryLoaded = false;

// Current filter state
let currentFilters = {
    category: '',
    timeRange: '',
    source: ''
};

// Pagination state
const ARTICLES_PER_PAGE = 9;
let currentPage = 1;
let totalPages = 1;

// DOM Elements
const articlesTab = document.getElementById('articlesTab');
const weeklySummaryTab = document.getElementById('weeklySummaryTab');
const articlesTabContent = document.getElementById('articlesTabContent');
const weeklySummaryTabContent = document.getElementById('weeklySummaryTabContent');
const categoryFilter = document.getElementById('categoryFilter');
const timeRangeFilter = document.getElementById('timeRangeFilter');
const sourceFilter = document.getElementById('sourceFilter');
const clearFiltersBtn = document.getElementById('clearFiltersBtn');
const activeFiltersDisplay = document.getElementById('activeFiltersDisplay');
const activeFilterTags = document.getElementById('activeFilterTags');
const articlesGrid = document.getElementById('articlesGrid');
const articlesContainer = document.getElementById('articlesContainer');
const loadingIndicator = document.getElementById('loadingIndicator');
const emptyState = document.getElementById('emptyState');
const currentCategoryTitle = document.getElementById('currentCategory');
const articleCount = document.getElementById('articleCount');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const paginationContainer = document.getElementById('paginationContainer');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageNumbers = document.getElementById('pageNumbers');
const weeklySummarySection = document.getElementById('weeklySummarySection');
const weeklySummaryLoading = document.getElementById('weeklySummaryLoading');
const statsGrid = document.getElementById('statsGrid');
const highlightsContainer = document.getElementById('highlightsContainer');
const categoryBreakdown = document.getElementById('categoryBreakdown');
const topSources = document.getElementById('topSources');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeFilterListeners();
    initializePagination();
    fetchArticles(); // Fetch once and store
    
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
        articlesTab.classList.add('active');
        weeklySummaryTab.classList.remove('active');
        articlesTabContent.classList.add('active');
        weeklySummaryTabContent.classList.remove('active');
    } else {
        articlesTab.classList.remove('active');
        weeklySummaryTab.classList.add('active');
        articlesTabContent.classList.remove('active');
        weeklySummaryTabContent.classList.add('active');
        
        if (!weeklySummaryLoaded) {
            fetchWeeklySummary();
        }
    }
}

// Initialize filter dropdown listeners
function initializeFilterListeners() {
    categoryFilter.addEventListener('change', () => {
        currentFilters.category = categoryFilter.value;
        applyFiltersClientSide();
    });
    
    timeRangeFilter.addEventListener('change', () => {
        currentFilters.timeRange = timeRangeFilter.value;
        applyFiltersClientSide();
    });
    
    sourceFilter.addEventListener('change', () => {
        currentFilters.source = sourceFilter.value;
        applyFiltersClientSide();
    });
    
    clearFiltersBtn.addEventListener('click', () => {
        clearAllFilters();
    });
}

// Initialize pagination
function initializePagination() {
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateArticlesDisplay();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateArticlesDisplay();
        }
    });
}

// Update pagination controls
function updatePaginationControls(totalArticles) {
    totalPages = Math.ceil(totalArticles / ARTICLES_PER_PAGE);
    
    // Show/hide pagination based on article count
    if (totalArticles > ARTICLES_PER_PAGE) {
        paginationContainer.classList.remove('hidden');
    } else {
        paginationContainer.classList.add('hidden');
        return;
    }
    
    // Update button states
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    
    // Generate page numbers
    generatePageNumbers();
}

// Generate page number buttons
function generatePageNumbers() {
    pageNumbers.innerHTML = '';
    
    // Show max 5 page numbers at a time
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    // First page
    if (startPage > 1) {
        const firstBtn = createPageButton(1);
        pageNumbers.appendChild(firstBtn);
        
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.className = 'px-2 text-gray-400';
            pageNumbers.appendChild(dots);
        }
    }
    
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        const btn = createPageButton(i);
        pageNumbers.appendChild(btn);
    }
    
    // Last page
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.className = 'px-2 text-gray-400';
            pageNumbers.appendChild(dots);
        }
        
        const lastBtn = createPageButton(totalPages);
        pageNumbers.appendChild(lastBtn);
    }
}

// Create a page number button
function createPageButton(pageNum) {
    const btn = document.createElement('button');
    btn.textContent = pageNum;
    btn.className = pageNum === currentPage 
        ? 'px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold'
        : 'px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition';
    
    btn.addEventListener('click', () => {
        currentPage = pageNum;
        updateArticlesDisplay();
    });
    
    return btn;
}

// Go to specific page
function goToPage(pageNum) {
    if (pageNum >= 1 && pageNum <= totalPages) {
        currentPage = pageNum;
        updateArticlesDisplay();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Update display based on current state (filters, search, pagination)
function updateArticlesDisplay() {
    if (isSearchMode) {
        displaySearchResults({ articles: searchResults, total_results: searchResults.length });
    } else {
        displayArticles();
    }
}

// Display articles (wrapper for filtered display)
function displayArticles() {
    applyFiltersClientSide();
}

// Populate filter dropdowns dynamically
function populateFilterDropdowns() {
    // Populate category dropdown
    const categories = Object.keys(allArticlesByCategory);
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });
    
    // Populate source dropdown from actual articles
    const sources = [...new Set(allArticlesRaw.map(a => a.source))].sort();
    sourceFilter.innerHTML = '<option value="">All Sources</option>';
    sources.forEach(source => {
        const option = document.createElement('option');
        option.value = source;
        option.textContent = source;
        sourceFilter.appendChild(option);
    });
}

// Clear all filters
function clearAllFilters() {
    currentFilters = {
        category: '',
        timeRange: '',
        source: ''
    };
    
    categoryFilter.value = '';
    timeRangeFilter.value = '';
    sourceFilter.value = '';
    
    applyFiltersClientSide();
}

// Apply filters client-side (no API call!)
function applyFiltersClientSide() {
    // Reset to page 1 when filters change
    currentPage = 1;
    
    let filteredArticles = [...allArticlesRaw];
    
    // Apply category filter
    if (currentFilters.category) {
        filteredArticles = filteredArticles.filter(a => a.category === currentFilters.category);
    }
    
    // Apply time range filter
    if (currentFilters.timeRange) {
        const now = new Date();
        const cutoffDate = new Date();
        
        if (currentFilters.timeRange === '24h') {
            cutoffDate.setDate(now.getDate() - 1);
        } else if (currentFilters.timeRange === '7d') {
            cutoffDate.setDate(now.getDate() - 7);
        } else if (currentFilters.timeRange === '30d') {
            cutoffDate.setDate(now.getDate() - 30);
        }
        
        filteredArticles = filteredArticles.filter(article => {
            try {
                const articleDate = new Date(article.published_date);
                return articleDate >= cutoffDate;
            } catch {
                return true; // Include if date parsing fails
            }
        });
    }
    
    // Apply source filter
    if (currentFilters.source) {
        filteredArticles = filteredArticles.filter(a => a.source === currentFilters.source);
    }
    
    // Update active filters display
    updateActiveFiltersDisplay();
    
    // Display filtered articles
    displayFilteredArticles(filteredArticles);
}

// Update active filters display
function updateActiveFiltersDisplay() {
    const hasFilters = currentFilters.category || currentFilters.timeRange || currentFilters.source;
    
    if (hasFilters) {
        activeFiltersDisplay.classList.remove('hidden');
        activeFilterTags.innerHTML = '';
        
        if (currentFilters.category) {
            const tag = createActiveFilterTag('Category', currentFilters.category);
            activeFilterTags.appendChild(tag);
        }
        
        if (currentFilters.timeRange) {
            const timeLabels = {
                '24h': 'Today',
                '7d': 'Recent (7 days)',
                '30d': 'Last Month'
            };
            const tag = createActiveFilterTag('Time', timeLabels[currentFilters.timeRange]);
            activeFilterTags.appendChild(tag);
        }
        
        if (currentFilters.source) {
            const tag = createActiveFilterTag('Source', currentFilters.source);
            activeFilterTags.appendChild(tag);
        }
    } else {
        activeFiltersDisplay.classList.add('hidden');
    }
}

// Create active filter tag element
function createActiveFilterTag(type, value) {
    const tag = document.createElement('span');
    tag.className = 'inline-flex items-center bg-blue-900 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full';
    tag.innerHTML = `<strong>${type}:</strong>&nbsp;${value}`;
    return tag;
}

// Fetch articles from API (only once, or on refresh)
async function fetchArticles() {
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/feeds`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch articles');
        }
        
        const data = await response.json();
        allArticlesByCategory = data.categories;
        
        // Flatten into a single array for easier filtering
        allArticlesRaw = [];
        for (const [category, articles] of Object.entries(allArticlesByCategory)) {
            articles.forEach(article => {
                article.category = category; // Ensure category is set
                allArticlesRaw.push(article);
            });
        }
        
        // Populate dropdowns with available options
        populateFilterDropdowns();
        
        // Display all articles initially
        applyFiltersClientSide();
        
    } catch (error) {
        console.error('Error fetching articles:', error);
        showError('Failed to load articles. Please make sure the backend is running.');
    }
}

// Display filtered articles
function displayFilteredArticles(articlesToDisplay) {
    articlesGrid.innerHTML = '';
    
    // Update title
    let titleText = 'All Articles';
    if (currentFilters.category) {
        titleText = currentFilters.category;
    } else if (currentFilters.timeRange || currentFilters.source) {
        titleText = 'Filtered Articles';
    }
    currentCategoryTitle.textContent = titleText;
    
    if (articlesToDisplay.length === 0) {
        showEmpty();
        paginationContainer.classList.add('hidden');
        return;
    }
    
    // Calculate pagination
    const totalArticles = articlesToDisplay.length;
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    const currentPageArticles = articlesToDisplay.slice(startIndex, endIndex);
    
    // Update article count to show pagination info
    if (totalArticles > ARTICLES_PER_PAGE) {
        const startNum = startIndex + 1;
        const endNum = Math.min(endIndex, totalArticles);
        articleCount.textContent = `Showing ${startNum}-${endNum} of ${totalArticles} curated articles`;
    } else {
        articleCount.textContent = `${totalArticles} curated articles`;
    }
    
    // Display only current page articles
    currentPageArticles.forEach((article, index) => {
        const articleCard = createArticleCard(article, index);
        articlesGrid.appendChild(articleCard);
    });
    
    // Update pagination controls
    updatePaginationControls(totalArticles);
    
    hideLoading();
    articlesContainer.classList.remove('hidden');
    emptyState.classList.add('hidden');
}

// Create article card element
function createArticleCard(article, index) {
    const card = document.createElement('div');
    card.className = 'article-card bg-gray-800 border border-gray-700 rounded-lg shadow-xl p-6 fade-in';
    card.style.animationDelay = `${index * 0.05}s`;
    
    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'inline-block bg-blue-900 text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded mb-3';
    categoryBadge.textContent = article.category || 'Uncategorized';
    
    const title = document.createElement('h3');
    title.className = 'text-lg font-bold text-white mb-2 line-clamp-2';
    title.textContent = article.title;
    
    const meta = document.createElement('div');
    meta.className = 'flex items-center space-x-2 text-sm text-gray-400 mb-3';
    meta.innerHTML = `
        <i class="fas fa-calendar-alt"></i>
        <span>${article.published_date || 'Unknown date'}</span>
        <span>•</span>
        <span class="font-medium">${article.source || 'Unknown source'}</span>
    `;
    
    const summary = document.createElement('p');
    summary.className = 'text-gray-300 text-sm mb-4 line-clamp-3';
    const cleanSummary = stripHtmlTags(article.summary || 'No summary available');
    summary.textContent = cleanSummary.length > 150 ? cleanSummary.substring(0, 150) + '...' : cleanSummary;
    
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

// Content Overview Functions

async function fetchWeeklySummary() {
    weeklySummaryLoading.classList.remove('hidden');
    weeklySummarySection.classList.add('hidden');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/content-overview`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch content overview');
        }
        
        const data = await response.json();
        weeklySummaryData = data.summary;
        weeklySummaryLoaded = true;
        
        displayWeeklySummary();
    } catch (error) {
        console.error('Error fetching content overview:', error);
        weeklySummaryLoading.innerHTML = `
            <div class="text-center text-red-400">
                <i class="fas fa-exclamation-circle text-4xl mb-4"></i>
                <p>Failed to load content overview</p>
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
    
    // Reset to page 1 for new search
    currentPage = 1;
    
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
        paginationContainer.classList.add('hidden');
        return;
    }
    
    // Calculate pagination for search results
    const totalResults = searchResults.length;
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    const endIndex = startIndex + ARTICLES_PER_PAGE;
    const currentPageResults = searchResults.slice(startIndex, endIndex);
    
    // Update article count to show pagination info
    if (totalResults > ARTICLES_PER_PAGE) {
        const startNum = startIndex + 1;
        const endNum = Math.min(endIndex, totalResults);
        articleCount.textContent = `Showing ${startNum}-${endNum} of ${totalResults} search results`;
    } else {
        articleCount.textContent = `${totalResults} search results`;
    }
    
    const maxScore = Math.max(...searchResults.map(a => a.relevance_score || 0));
    
    currentPageResults.forEach((article, index) => {
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
    
    // Update pagination controls
    updatePaginationControls(totalResults);
    
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
    
    // Return to filtered view
    applyFiltersClientSide();
}
