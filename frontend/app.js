/* AI Scout - Tab-Based UI with Client-Side Filtering */

// ===== Source Type Mapping =====
const SOURCE_TYPES = {
    official: [
        'openai', 'anthropic', 'google_ai', 'meta_ai',
        'microsoft_ai', 'nvidia_ai', 'huggingface',
        'cohere', 'deepmind', 'stability_ai'
    ],
    news: [
        'venturebeat_ai', 'techcrunch_ai', 'mit_tech_ai',
        'the_verge_ai', 'wired_ai', 'ars_technica_ai',
        'ai_news', 'axios_ai', 'zdnet_ai', 'forbes_ai'
    ],
    research: [
        'arxiv_cs_ai', 'arxiv_cs_lg', 'arxiv_cs_cl',
        'paperswithcode', 'the_batch', 'distill'
    ],
    community: [
        'reddit_machinelearning', 'reddit_artificial',
        'reddit_openai', 'reddit_localllama', 'hackernews_ai'
    ],
    tools: [
        'producthunt_ai', 'github_trending'
    ]
};

// ===== Application State =====
const AppState = {
    allArticles: [],
    searchResults: null, // Null when not searching, array when search active
    currentTab: 'official',
    filters: {
        dateRange: 'all',
        category: 'all',
        sortBy: 'newest',
        searchQuery: ''
    },
    pagination: {
        currentPage: 1,
        perPage: 9
    }
};

// ===== API Base URL =====
const API_BASE_URL = window.location.origin;

// ===== DOM Elements =====
let elements = {};

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', () => {
    initDOM();
    setupEventListeners();
    initializeApp();
});

function initDOM() {
    elements = {
        // Tabs
        tabs: document.querySelectorAll('.tab'),
        // Filters
        dateFilter: document.getElementById('dateFilter'),
        categoryFilter: document.getElementById('categoryFilter'),
        sortFilter: document.getElementById('sortFilter'),
        clearFilters: document.getElementById('clearFilters'),
        // Search
        globalSearch: document.getElementById('globalSearch'),
        searchBtn: document.getElementById('searchBtn'),
        // Articles
        articlesGrid: document.getElementById('articlesGrid'),
        emptyState: document.getElementById('emptyState'),
        articleCount: document.getElementById('articleCount'),
        searchLoader: document.getElementById('searchLoader'),
        searchLoaderText: document.getElementById('searchLoaderText'),
        // Pagination
        prevPage: document.getElementById('prevPage'),
        nextPage: document.getElementById('nextPage'),
        pageInfo: document.getElementById('pageInfo'),
        // Overview
        overviewBtn: document.getElementById('overviewBtn'),
        overviewModal: document.getElementById('overviewModal'),
        closeOverview: document.getElementById('closeOverview'),
        overviewContent: document.getElementById('overviewContent'),
        // Loading
        loadingIndicator: document.getElementById('loadingIndicator')
    };
}

function setupEventListeners() {
    // Tab switching
    elements.tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
    
    // Filters
    elements.dateFilter.addEventListener('change', applyFilters);
    elements.categoryFilter.addEventListener('change', applyFilters);
    elements.sortFilter.addEventListener('change', applyFilters);
    elements.clearFilters.addEventListener('click', clearAllFilters);
    
    // Search
    elements.searchBtn.addEventListener('click', performSearch);
    elements.globalSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });
    
    // Pagination
    elements.prevPage.addEventListener('click', () => changePage(-1));
    elements.nextPage.addEventListener('click', () => changePage(1));
    
    // Overview
    elements.overviewBtn.addEventListener('click', openOverview);
    elements.closeOverview.addEventListener('click', closeOverview);
    elements.overviewModal.addEventListener('click', (e) => {
        if (e.target === elements.overviewModal) closeOverview();
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// ===== Keyboard Navigation =====
function handleKeyboardNavigation(e) {
    // Arrow keys for pagination
    if (e.key === 'ArrowLeft' && !elements.prevPage.disabled) {
        changePage(-1);
    } else if (e.key === 'ArrowRight' && !elements.nextPage.disabled) {
        changePage(1);
    }
    
    // Escape key to close modal
    if (e.key === 'Escape' && !elements.overviewModal.classList.contains('hidden')) {
        closeOverview();
    }
    
    // Number keys (1-5) for tab switching
    const tabKeys = { '1': 'official', '2': 'news', '3': 'research', '4': 'community', '5': 'tools' };
    if (tabKeys[e.key] && !e.ctrlKey && !e.metaKey) {
        const activeElement = document.activeElement;
        // Don't trigger if user is typing in an input
        if (activeElement.tagName !== 'INPUT' && activeElement.tagName !== 'TEXTAREA') {
            switchTab(tabKeys[e.key]);
        }
    }
}

// ===== Initialize Application =====
async function initializeApp() {
    showLoading();
    
    try {
        // Fetch all articles once
        const response = await fetch(`${API_BASE_URL}/api/feeds`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        // Flatten articles from categories
        AppState.allArticles = flattenArticles(data.categories || {});
        
        // Update tab badges
        updateTabBadges();
        
        // Render initial view
        renderArticles();
        
        hideLoading();
    } catch (error) {
        console.error('Error loading articles:', error);
        hideLoading();
        showError('Failed to load articles. Please refresh the page.');
    }
}

// ===== Tab Management =====
function switchTab(tabName) {
    AppState.currentTab = tabName;
    AppState.pagination.currentPage = 1;
    
    // Clear search when switching tabs (optional - you can remove this if you want search to persist)
    // AppState.searchResults = null;
    // AppState.filters.searchQuery = '';
    // elements.globalSearch.value = '';
    
    // Update active tab
    elements.tabs.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
    } else {
            tab.classList.remove('active');
        }
    });
    
    renderArticles();
}

function updateTabBadges() {
    Object.keys(SOURCE_TYPES).forEach(tabKey => {
        const badge = document.getElementById(`badge-${tabKey}`);
        if (badge) {
            const sources = SOURCE_TYPES[tabKey];
            const count = AppState.allArticles.filter(a => 
                sources.includes(a.source)
            ).length;
            badge.textContent = count;
        }
    });
}

// ===== Filtering =====
function applyFilters() {
    AppState.filters.dateRange = elements.dateFilter.value;
    AppState.filters.category = elements.categoryFilter.value;
    AppState.filters.sortBy = elements.sortFilter.value;
    AppState.pagination.currentPage = 1;
    renderArticles();
}

function clearAllFilters() {
    // Reset filters to defaults
    AppState.filters.dateRange = 'all';
    AppState.filters.category = 'all';
    AppState.filters.sortBy = 'newest';
    AppState.filters.searchQuery = '';
    AppState.searchResults = null; // Clear search results
    AppState.pagination.currentPage = 1;
    
    // Reset UI elements
    elements.dateFilter.value = 'all';
    elements.categoryFilter.value = 'all';
    elements.sortFilter.value = 'newest';
    elements.globalSearch.value = '';
    
    // Re-render
    renderArticles();
}

async function performSearch() {
    const query = elements.globalSearch.value.trim();
    
    if (!query) {
        // If empty, just show all articles for current tab
        AppState.filters.searchQuery = '';
        AppState.searchResults = null;
        renderArticles();
        return;
    }
    
    // Show inline search loader with rotating messages
    showSearchLoader();
    
    try {
        // Use backend semantic search API
        const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        // Limit to max 6 articles (backend already filters to >=75%)
        const limitedResults = (data.articles || []).slice(0, 6);
        
        // Store search results temporarily
        AppState.searchResults = limitedResults;
        AppState.filters.searchQuery = query;
        AppState.pagination.currentPage = 1;
        
        hideSearchLoader();
        renderArticles();
    } catch (error) {
        console.error('Semantic search failed:', error);
        hideSearchLoader();
        showError('Search failed. Try a different query or check your connection.');
    }
}

function getFilteredArticles() {
    let articles;
    
    // If we have search results from semantic search, use those
    if (AppState.searchResults !== null) {
        articles = [...AppState.searchResults];
        
        // Still apply tab filter to search results
        const tabSources = SOURCE_TYPES[AppState.currentTab];
        articles = articles.filter(a => tabSources.includes(a.source));
        
        // Apply date range filter
        if (AppState.filters.dateRange !== 'all') {
            articles = filterByDate(articles, AppState.filters.dateRange);
        }
        
        // Apply category filter
        if (AppState.filters.category !== 'all') {
            articles = articles.filter(a => a.category === AppState.filters.category);
        }
        
        // Note: Semantic search results are already relevance-sorted by backend
        // But we can still apply user's sort preference
        if (AppState.filters.sortBy !== 'newest') {
            articles = sortArticles(articles, AppState.filters.sortBy);
        }
        
        return articles;
    }
    
    // Normal filtering (no search active)
    articles = [...AppState.allArticles];
    
    // 1. Filter by active tab (source type)
    const tabSources = SOURCE_TYPES[AppState.currentTab];
    articles = articles.filter(a => tabSources.includes(a.source));
    
    // 2. Filter by date range
    if (AppState.filters.dateRange !== 'all') {
        articles = filterByDate(articles, AppState.filters.dateRange);
    }
    
    // 3. Filter by category
    if (AppState.filters.category !== 'all') {
        articles = articles.filter(a => a.category === AppState.filters.category);
    }
    
    // 4. Sort
    articles = sortArticles(articles, AppState.filters.sortBy);
    
    return articles;
}

function filterByDate(articles, range) {
    const now = new Date();
    let cutoffDate;
    
    switch(range) {
        case '24h':
            cutoffDate = new Date(now - 24 * 60 * 60 * 1000);
            break;
        case '7d':
            cutoffDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
            break;
        case '30d':
            cutoffDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
            break;
        default:
            return articles;
    }
    
    return articles.filter(a => {
        if (!a.published_date) return false;
        const articleDate = new Date(a.published_date);
        return articleDate >= cutoffDate;
    });
}

function sortArticles(articles, sortBy) {
    const sorted = [...articles];
    
    if (sortBy === 'newest') {
        sorted.sort((a, b) => {
            const dateA = new Date(a.published_date || 0);
            const dateB = new Date(b.published_date || 0);
            return dateB - dateA;
        });
    } else if (sortBy === 'oldest') {
        sorted.sort((a, b) => {
            const dateA = new Date(a.published_date || 0);
            const dateB = new Date(b.published_date || 0);
            return dateA - dateB;
        });
    }
    
    return sorted;
}

// ===== Rendering =====
function renderArticles() {
    const filteredArticles = getFilteredArticles();
    const totalArticles = filteredArticles.length;
    
    // Update count with search indicator
    if (AppState.searchResults !== null) {
        const maxShown = Math.min(totalArticles, 6);
        elements.articleCount.textContent = `${totalArticles} article${totalArticles !== 1 ? 's' : ''} (showing top ${maxShown} with ≥75% relevance)`;
        elements.articleCount.style.color = '#3b82f6'; // Blue to indicate search mode
    } else {
        elements.articleCount.textContent = `${totalArticles} article${totalArticles !== 1 ? 's' : ''}`;
        elements.articleCount.style.color = ''; // Reset to default
    }
    
    // Paginate
    const totalPages = Math.ceil(totalArticles / AppState.pagination.perPage);
    const start = (AppState.pagination.currentPage - 1) * AppState.pagination.perPage;
    const paginatedArticles = filteredArticles.slice(start, start + AppState.pagination.perPage);
    
    // Add fade effect
    elements.articlesGrid.style.opacity = '0';
    
    setTimeout(() => {
        // Render articles
        if (paginatedArticles.length === 0) {
            elements.articlesGrid.innerHTML = '';
            elements.emptyState.classList.remove('hidden');
        } else {
            elements.emptyState.classList.add('hidden');
            elements.articlesGrid.innerHTML = paginatedArticles.map(article => 
                createArticleCard(article)
            ).join('');
        }
        
        // Fade in
        elements.articlesGrid.style.opacity = '1';
        
        // Update pagination
        updatePagination(totalPages);
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
}

function createArticleCard(article) {
    const sourceType = getSourceType(article.source);
    const sourceName = getSourceName(article.source);
    const summary = stripHtml(article.summary || '').substring(0, 200);
    const date = formatDate(article.published_date);
    
    // Show relevance score if this is a search result
    // Backend sends as decimal (0-1), so multiply by 100 to get percentage
    // But if already > 1, it's already a percentage
    let relevanceScore = null;
    if (article.relevance_score) {
        const score = parseFloat(article.relevance_score);
        relevanceScore = score > 1 ? Math.round(score) : Math.round(score * 100);
    }
    
    return `
        <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="article-card">
            <div class="article-header">
                <span class="article-source ${sourceType}">${sourceName}</span>
                ${relevanceScore ? `<span class="article-relevance"><i class="fas fa-brain"></i> ${relevanceScore}% Match</span>` : ''}
            </div>
            <h3 class="article-title">${escapeHtml(article.title)}</h3>
            <p class="article-summary">${escapeHtml(summary)}${summary.length >= 200 ? '...' : ''}</p>
            <div class="article-meta">
                <span class="article-date">
                    <i class="far fa-calendar"></i>
                    ${date}
                </span>
                ${article.category ? `<span class="article-category">${escapeHtml(article.category)}</span>` : ''}
            </div>
            <span class="article-read-more">
                Read article <i class="fas fa-arrow-right"></i>
            </span>
        </a>
    `;
}

// ===== Pagination =====
function changePage(direction) {
    const filteredArticles = getFilteredArticles();
    const totalPages = Math.ceil(filteredArticles.length / AppState.pagination.perPage);
    
    const newPage = AppState.pagination.currentPage + direction;
    
    if (newPage >= 1 && newPage <= totalPages) {
        AppState.pagination.currentPage = newPage;
        renderArticles();
    }
}

function updatePagination(totalPages) {
    const currentPage = AppState.pagination.currentPage;
    
    elements.pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    
    elements.prevPage.disabled = currentPage <= 1;
    elements.nextPage.disabled = currentPage >= totalPages;
}

// ===== Overview Modal =====
function openOverview() {
    const stats = generateOverviewStats();
    elements.overviewContent.innerHTML = stats;
    elements.overviewModal.classList.remove('hidden');
}

function closeOverview() {
    elements.overviewModal.classList.add('hidden');
}

function generateOverviewStats() {
    const total = AppState.allArticles.length;
    
    // Count by source type
    const byType = {};
    Object.keys(SOURCE_TYPES).forEach(type => {
        byType[type] = AppState.allArticles.filter(a => 
            SOURCE_TYPES[type].includes(a.source)
        ).length;
    });
    
    // Count by category
    const byCategory = {};
    AppState.allArticles.forEach(article => {
        const cat = article.category || 'Uncategorized';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
    });
    
    // Recent articles (last 24h)
    const recent = filterByDate(AppState.allArticles, '24h').length;
    
    // Top 5 most recent articles across all sections
    const topArticles = [...AppState.allArticles]
        .sort((a, b) => {
            const dateA = new Date(a.published_date || 0);
            const dateB = new Date(b.published_date || 0);
            return dateB - dateA;
        })
        .slice(0, 5);
    
    return `
        <div class="space-y-6">
            <div class="bg-gray-700 p-4 rounded-lg">
                <h3 class="text-lg font-bold text-white mb-2">Total Articles</h3>
                <p class="text-4xl font-bold text-blue-500">${total}</p>
                <p class="text-sm text-gray-400 mt-1">${recent} in last 24 hours</p>
            </div>
            
            <div class="bg-gray-700 p-4 rounded-lg">
                <h3 class="text-lg font-bold text-white mb-3">By Source Type</h3>
                <div class="space-y-2">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">🟢 Official Blogs</span>
                        <span class="text-white font-bold">${byType.official || 0}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">🔵 News Sites</span>
                        <span class="text-white font-bold">${byType.news || 0}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">🟣 Research</span>
                        <span class="text-white font-bold">${byType.research || 0}</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-gray-300">🟠 Community</span>
                        <span class="text-white font-bold">${byType.community || 0}</span>
                    </div>
                <div class="flex justify-between items-center">
                        <span class="text-gray-300">🔷 Tools</span>
                        <span class="text-white font-bold">${byType.tools || 0}</span>
                    </div>
                </div>
            </div>
            
            <div class="bg-gray-700 p-4 rounded-lg">
                <h3 class="text-lg font-bold text-white mb-3">Top Categories</h3>
                <div class="space-y-2">
                    ${Object.entries(byCategory)
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 5)
                        .map(([cat, count]) => `
                            <div class="flex justify-between items-center">
                                <span class="text-gray-300 text-sm">${escapeHtml(cat)}</span>
                                <span class="text-white font-bold">${count}</span>
                            </div>
                        `).join('')}
                </div>
            </div>
            
            <div class="bg-gray-700 p-4 rounded-lg">
                <h3 class="text-lg font-bold text-white mb-3">
                    <i class="fas fa-star text-yellow-500 mr-2"></i>Top Recent Articles
                </h3>
                <div class="space-y-3">
                    ${topArticles.map(article => {
                        const sourceType = getSourceType(article.source);
                        const sourceName = getSourceName(article.source);
                        return `
                            <a href="${article.link}" target="_blank" rel="noopener noreferrer" 
                               class="block p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition border-l-4 border-${sourceType === 'official' ? 'green' : sourceType === 'news' ? 'blue' : sourceType === 'research' ? 'purple' : sourceType === 'community' ? 'yellow' : 'cyan'}-500">
                                <div class="text-xs text-gray-400 mb-1">${sourceName}</div>
                                <div class="text-sm text-white font-medium line-clamp-2">${escapeHtml(article.title)}</div>
                                <div class="text-xs text-gray-500 mt-1">${formatDate(article.published_date)}</div>
                            </a>
                        `;
                    }).join('')}
                </div>
            </div>
                </div>
            `;
}

// ===== Helper Functions =====
function flattenArticles(categories) {
    const articles = [];
    Object.values(categories).forEach(categoryArticles => {
        articles.push(...categoryArticles);
    });
    return articles;
}

function getSourceType(source) {
    for (const [type, sources] of Object.entries(SOURCE_TYPES)) {
        if (sources.includes(source)) return type;
    }
    return 'news'; // default
}

function getSourceName(sourceId) {
    const names = {
        "openai": "OpenAI", "anthropic": "Anthropic", "google_ai": "Google AI",
        "meta_ai": "Meta AI", "microsoft_ai": "Microsoft", "nvidia_ai": "NVIDIA",
        "huggingface": "Hugging Face", "cohere": "Cohere", "deepmind": "DeepMind",
        "stability_ai": "Stability AI", "venturebeat_ai": "VentureBeat",
        "techcrunch_ai": "TechCrunch", "mit_tech_ai": "MIT Tech Review",
        "the_verge_ai": "The Verge", "wired_ai": "WIRED", "ars_technica_ai": "Ars Technica",
        "ai_news": "AI News", "axios_ai": "Axios", "zdnet_ai": "ZDNet",
        "forbes_ai": "Forbes", "arxiv_cs_ai": "arXiv AI", "arxiv_cs_lg": "arXiv ML",
        "arxiv_cs_cl": "arXiv NLP", "paperswithcode": "Papers with Code",
        "the_batch": "The Batch", "distill": "Distill",
        "reddit_machinelearning": "r/MachineLearning", "reddit_artificial": "r/artificial",
        "reddit_openai": "r/OpenAI", "reddit_localllama": "r/LocalLLaMA",
        "hackernews_ai": "Hacker News", "producthunt_ai": "Product Hunt",
        "github_trending": "GitHub Trending"
    };
    return names[sourceId] || sourceId;
}

function formatDate(dateString) {
    if (!dateString) return 'Unknown date';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== Search Loader with Rotating Messages =====
let searchLoaderInterval = null;
const searchMessages = [
    'Analyzing with AI...',
    'Understanding your query...',
    'Comparing embeddings...',
    'Finding relevant articles...',
    'Calculating relevance scores...',
        'Almost there...'
    ];
    
function showSearchLoader() {
    // Hide articles grid and empty state
    elements.articlesGrid.style.display = 'none';
    elements.emptyState.classList.add('hidden');
    
    // Show search loader
    elements.searchLoader.classList.remove('hidden');
    
    // Start rotating messages
    let messageIndex = 0;
    elements.searchLoaderText.textContent = searchMessages[0];
    
    searchLoaderInterval = setInterval(() => {
        messageIndex = (messageIndex + 1) % searchMessages.length;
        elements.searchLoaderText.textContent = searchMessages[messageIndex];
    }, 1500); // Change message every 1.5 seconds
}

function hideSearchLoader() {
    // Clear interval
    if (searchLoaderInterval) {
        clearInterval(searchLoaderInterval);
        searchLoaderInterval = null;
    }
    
    // Hide search loader
    elements.searchLoader.classList.add('hidden');
    
    // Show articles grid again
    elements.articlesGrid.style.display = '';
}

// ===== UI State Functions =====
function showLoading(message = 'Loading AI updates...') {
    const indicator = elements.loadingIndicator;
    indicator.classList.remove('hidden');
    const textElement = indicator.querySelector('.loading-text');
    if (textElement) {
        textElement.textContent = message;
    }
}

function hideLoading() {
    elements.loadingIndicator.classList.add('hidden');
}

function showError(message) {
    // Create a toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
    toast.innerHTML = `
        <div class="flex items-start gap-3">
            <i class="fas fa-exclamation-circle text-xl"></i>
            <div class="flex-1">
                <div class="font-semibold">${message}</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
                </div>
            `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.transition = 'opacity 0.3s';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}
