// AI Scout - Main Application JavaScript
// API Base URL
const API_BASE_URL = window.location.origin;

// Application State
const AppState = {
    allArticles: [],
    todayArticles: [],
    companies: [],
    currentView: 'home', // 'home', 'company', 'topic', 'today', 'search'
    currentCompany: null,
    currentTopic: null,
    searchQuery: ''
};

// Topics Configuration
const TOPICS = [
    { 
        id: 'llms', 
        name: 'Chatbots & Assistants', 
        icon: '💬', 
        desc: 'ChatGPT, Claude, Gemini',
        category: 'LLMs & Foundation Models'
    },
    { 
        id: 'image-ai', 
        name: 'Image & Video AI', 
        icon: '🎨', 
        desc: 'DALL-E, Midjourney, Sora',
        category: 'Multimodal AI'
    },
    { 
        id: 'coding', 
        name: 'Coding Tools', 
        icon: '💻', 
        desc: 'GitHub Copilot, Cursor',
        category: 'AI in Development'
    },
    { 
        id: 'research', 
        name: 'Research Papers', 
        icon: '📄', 
        desc: 'Latest AI research',
        category: 'AI Research & Papers'
    },
    { 
        id: 'tools', 
        name: 'AI Tools & Apps', 
        icon: '🛠️', 
        desc: 'Productivity tools',
        category: 'AI Tools & Platforms'
    },
    { 
        id: 'opensource', 
        name: 'Open Source', 
        icon: '🔓', 
        desc: 'Hugging Face, PyTorch',
        category: 'Open Source AI Projects'
    }
];

// ===== Initialization =====
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
    setupEventListeners();
    checkFirstVisit();
});

async function initializeApp() {
    showLoading('Loading AI updates from 28 sources');
    
    try {
        // Fetch all data in parallel with timeout
        const timeout = (ms) => new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Request timed out')), ms)
        );
        
        const [articlesData, companiesData, todayData] = await Promise.race([
            Promise.all([
                fetch(`${API_BASE_URL}/api/feeds`).then(r => {
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    return r.json();
                }),
                fetch(`${API_BASE_URL}/api/companies`).then(r => {
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    return r.json();
                }),
                fetch(`${API_BASE_URL}/api/today`).then(r => {
                    if (!r.ok) throw new Error(`HTTP ${r.status}`);
                    return r.json();
                })
            ]),
            timeout(30000) // 30 second timeout
        ]);
        
        // Store in state
        AppState.allArticles = flattenArticles(articlesData.categories || {});
        AppState.companies = companiesData.companies || [];
        AppState.todayArticles = todayData.articles || [];
        
        // Render homepage
        renderHomepage();
        hideLoading();
        
        // Show success message
        showSuccess(`Loaded ${AppState.allArticles.length} articles from ${AppState.companies.length} companies`);
        
    } catch (error) {
        console.error('Error initializing app:', error);
        hideLoading();
        
        if (error.message === 'Request timed out') {
            showError('Loading is taking longer than usual', 'The backend server may be starting up. Please wait and refresh.');
        } else if (error.message.includes('HTTP')) {
            showError('Server error', 'Please make sure the backend is running on port 8000.');
        } else if (error.message === 'Failed to fetch') {
            showError('Cannot connect to server', 'Please start the backend server and refresh.');
        } else {
            showError('Failed to load data', 'Please refresh the page or check your connection.');
        }
        
        // Show a fallback UI
        document.getElementById('mainContent').classList.remove('hidden');
        document.getElementById('mainContent').innerHTML = `
            <div class="container mx-auto px-4 text-center py-20">
                <i class="fas fa-exclamation-triangle text-6xl text-yellow-500 mb-4"></i>
                <h2 class="text-2xl font-bold text-gray-900 mb-2">Unable to Load Content</h2>
                <p class="text-gray-600 mb-6">Please make sure the backend server is running.</p>
                <button onclick="location.reload()" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg">
                    <i class="fas fa-redo mr-2"></i>Try Again
                </button>
            </div>
        `;
    }
}

function flattenArticles(categories) {
    const articles = [];
    for (const [category, categoryArticles] of Object.entries(categories)) {
        categoryArticles.forEach(article => {
            article.category = category;
            articles.push(article);
        });
    }
    return articles;
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Hero search
    const heroSearch = document.getElementById('heroSearch');
    const heroSearchBtn = document.getElementById('heroSearchBtn');
    
    if (heroSearchBtn) {
        heroSearchBtn.addEventListener('click', () => {
            performSearch(heroSearch.value.trim());
        });
    }
    
    if (heroSearch) {
        heroSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(heroSearch.value.trim());
        }
    });
}
}

// ===== Homepage Rendering =====
function renderHomepage() {
    AppState.currentView = 'home';
    
    // Show main content, hide detail view
    document.getElementById('mainContent').classList.remove('hidden');
    document.getElementById('detailView').classList.add('hidden');
    
    // Render all three columns
    renderTodayHighlights();
    renderCompaniesList();
    renderTopicsList();
}

function renderTodayHighlights() {
    const container = document.getElementById('todayArticles');
    const countBadge = document.getElementById('todayCount');
    
    const total = AppState.todayArticles.length;
    countBadge.textContent = total;
    
    // Show top 5 articles
    const topArticles = AppState.todayArticles.slice(0, 5);
    
    if (topArticles.length === 0) {
        container.innerHTML = `
            <div class="text-center text-gray-500 py-8">
                <i class="fas fa-inbox text-4xl mb-2"></i>
                <p>No updates in the last 24 hours</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = topArticles.map(article => createCompactArticleCard(article)).join('');
}

function renderCompaniesList() {
    const container = document.getElementById('companiesList');
    
    // Show top 8 companies with updates
    const topCompanies = AppState.companies
        .filter(c => c.update_count > 0)
        .slice(0, 8);
    
    if (topCompanies.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">No company updates available</p>';
        return;
    }
    
    container.innerHTML = topCompanies.map(company => `
        <div class="company-item" onclick="viewCompany('${company.id}')">
            <div class="company-logo" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                ${company.name.charAt(0)}
            </div>
            <div class="company-info flex-1">
                <h4>${company.name}</h4>
                <p>${company.description}</p>
            </div>
            ${company.update_count > 0 ? `<span class="new-badge">${company.update_count}</span>` : ''}
        </div>
    `).join('');
}

function renderTopicsList() {
    const container = document.getElementById('topicsList');
    
    container.innerHTML = TOPICS.map(topic => `
        <a href="#topic-${topic.id}" class="topic-card" onclick="viewTopic('${topic.id}'); return false;">
            <span class="topic-icon">${topic.icon}</span>
            <div class="topic-info flex-1">
                <h4>${topic.name}</h4>
                <p class="topic-desc">${topic.desc}</p>
            </div>
        </a>
    `).join('');
}

// ===== Article Card Creation =====
function createCompactArticleCard(article) {
    const sourceType = getSourceType(article);
    const timeAgo = formatTimeAgo(article.published_date);
    const plainEnglish = generatePlainEnglish(article);
    
    return `
        <article class="article-card-compact">
            <span class="source-badge ${sourceType}">
                ${getSourceName(article.source)}
            </span>
            <h3>${escapeHtml(article.title)}</h3>
            <p class="meta">${timeAgo}</p>
            ${plainEnglish}
            <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="text-blue-600 text-sm hover:underline">
                Read more →
            </a>
        </article>
    `;
}

// ===== View Functions =====
function viewAllToday() {
    AppState.currentView = 'today';
    
    // Hide main content, show detail view
    document.getElementById('mainContent').classList.add('hidden');
    document.getElementById('detailView').classList.remove('hidden');
    
    const detailContent = document.getElementById('detailContent');
    
    const articles = AppState.todayArticles;
    
    detailContent.innerHTML = `
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Today's Updates</h1>
            <p class="text-gray-600">All articles from the last 24 hours (${articles.length} total)</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${articles.map(article => createFullArticleCard(article)).join('')}
        </div>
    `;
}

async function viewCompany(companyId) {
    AppState.currentView = 'company';
    AppState.currentCompany = companyId;
    
    showLoading('Loading company updates');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/companies/${companyId}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        // Hide main content, show detail view
        document.getElementById('mainContent').classList.add('hidden');
        document.getElementById('detailView').classList.remove('hidden');
        
        const detailContent = document.getElementById('detailContent');
        const company = data.company;
        const updates = data.updates || [];
        
        detailContent.innerHTML = `
            <div class="bg-white rounded-lg p-6 mb-6 shadow-sm">
                <div class="flex items-center gap-4 mb-4">
                    <div class="company-logo" style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">
                        ${company.name.charAt(0)}
                    </div>
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900">${company.name}</h1>
                        <p class="text-gray-600">${company.description}</p>
                    </div>
                </div>
                
                ${company.products ? `
                    <div class="mt-4">
                        <p class="text-sm font-semibold text-gray-700 mb-2">Products:</p>
                        <div class="flex flex-wrap gap-2">
                            ${company.products.map(p => `<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">${p}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="mb-4">
                <h2 class="text-2xl font-bold text-gray-900">Latest Updates (${updates.length})</h2>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${updates.map(article => createFullArticleCard(article)).join('')}
            </div>
        `;
        
        hideLoading();
        
    } catch (error) {
        console.error('Error loading company:', error);
        showError('Failed to load company details');
    }
}

function viewTopic(topicId) {
    AppState.currentView = 'topic';
    AppState.currentTopic = topicId;
    
    const topic = TOPICS.find(t => t.id === topicId);
    if (!topic) return;
    
    // Hide main content, show detail view
    document.getElementById('mainContent').classList.add('hidden');
    document.getElementById('detailView').classList.remove('hidden');
    
    const detailContent = document.getElementById('detailContent');
    
    // Filter articles by category
    const topicArticles = AppState.allArticles.filter(a => a.category === topic.category);
    
    detailContent.innerHTML = `
        <div class="mb-6">
            <div class="flex items-center gap-4 mb-2">
                <span class="text-5xl">${topic.icon}</span>
                <div>
                    <h1 class="text-3xl font-bold text-gray-900">${topic.name}</h1>
                    <p class="text-gray-600">${topic.desc}</p>
                </div>
            </div>
            <p class="text-gray-600 mt-2">${topicArticles.length} articles</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${topicArticles.slice(0, 30).map(article => createFullArticleCard(article)).join('')}
        </div>
    `;
}

function viewAllCompanies() {
    // Show all companies in detail view
    AppState.currentView = 'companies';
    
    document.getElementById('mainContent').classList.add('hidden');
    document.getElementById('detailView').classList.remove('hidden');
    
    const detailContent = document.getElementById('detailContent');
    
    detailContent.innerHTML = `
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">All AI Companies</h1>
            <p class="text-gray-600">Track updates from major AI platforms</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${AppState.companies.map(company => `
                <div class="company-item border-2" onclick="viewCompany('${company.id}')" style="padding: 20px;">
                    <div class="company-logo mb-3" style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">
                        ${company.name.charAt(0)}
                    </div>
                    <h4 class="text-lg font-bold">${company.name}</h4>
                    <p class="text-sm text-gray-600 mb-2">${company.description}</p>
                    ${company.update_count > 0 ? `<span class="new-badge">${company.update_count} updates</span>` : '<span class="text-gray-400 text-sm">No recent updates</span>'}
                </div>
            `).join('')}
        </div>
    `;
}

function viewAllTopics() {
    // Show all topics in detail view
    AppState.currentView = 'topics';
    
    document.getElementById('mainContent').classList.add('hidden');
    document.getElementById('detailView').classList.remove('hidden');
    
    const detailContent = document.getElementById('detailContent');
    
    detailContent.innerHTML = `
        <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Browse by Topic</h1>
            <p class="text-gray-600">Explore AI content by your interests</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${TOPICS.map(topic => {
                const count = AppState.allArticles.filter(a => a.category === topic.category).length;
                return `
                    <div class="topic-card border-2" onclick="viewTopic('${topic.id}')" style="padding: 20px;">
                        <span class="topic-icon text-5xl mb-3 block">${topic.icon}</span>
                        <h4 class="text-lg font-bold">${topic.name}</h4>
                        <p class="text-sm text-gray-600 mb-2">${topic.desc}</p>
                        <span class="text-blue-600 text-sm font-semibold">${count} articles</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function backToHome() {
    renderHomepage();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== Search Functions =====
async function performSearch(query) {
    if (!query) return;
    
    AppState.currentView = 'search';
    AppState.searchQuery = query;
    
    showLoading('Searching articles');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/search?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        
        document.getElementById('mainContent').classList.add('hidden');
        document.getElementById('detailView').classList.remove('hidden');
        
        const detailContent = document.getElementById('detailContent');
        const results = data.articles || [];
        
        detailContent.innerHTML = `
            <div class="mb-6">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">Search Results</h1>
                <p class="text-gray-600">Found ${results.length} results for "${escapeHtml(query)}"</p>
            </div>
            
            ${results.length > 0 ? `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${results.map(article => createFullArticleCard(article)).join('')}
                </div>
            ` : `
                <div class="text-center py-20">
                    <i class="fas fa-search text-6xl text-gray-300 mb-4"></i>
                    <h3 class="text-xl font-semibold text-gray-600 mb-2">No results found</h3>
                    <p class="text-gray-500">Try different keywords or browse by company or topic</p>
                </div>
            `}
        `;
        
        hideLoading();
        
    } catch (error) {
        console.error('Search error:', error);
        showError('Search failed. Please try again.');
    }
}

function quickSearch(term) {
    document.getElementById('heroSearch').value = term;
    performSearch(term);
}

// ===== Article Card Creation (Full) =====
function createFullArticleCard(article) {
    const sourceType = getSourceType(article);
    const summary = stripHtml(article.summary || '').substring(0, 150) + '...';
    
    return `
        <div class="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all border-l-4 border border-gray-700 hover:border-blue-500" style="border-left-color: var(--color-${sourceType})">
            <span class="source-badge ${sourceType} mb-3">${getSourceName(article.source)}</span>
            <h3 class="text-lg font-bold text-white mb-2 line-clamp-2">${escapeHtml(article.title)}</h3>
            <p class="text-sm text-gray-300 mb-3">${escapeHtml(summary)}</p>
            <div class="flex items-center justify-between text-xs text-gray-400 mb-3">
                <span><i class="far fa-calendar"></i> ${article.published_date || 'Unknown date'}</span>
                <span class="px-2 py-1 bg-gray-700 text-gray-300 rounded">${article.category || 'General'}</span>
            </div>
            <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="text-blue-400 text-sm font-semibold hover:text-blue-300">
                Read full article →
            </a>
        </div>
    `;
}

// ===== Helper Functions =====
function getSourceType(article) {
    const source = article.source || '';
    
    // Check source_type from classification
    if (article.source_type) {
        return article.source_type;
    }
    
    // Fallback to basic detection
    const officialSources = ['openai', 'google_ai', 'anthropic', 'meta_ai', 'microsoft_ai', 'nvidia_ai', 'huggingface', 'cohere', 'deepmind', 'stability_ai'];
    const newsSources = ['venturebeat', 'techcrunch', 'mit_tech', 'verge', 'wired', 'ars', 'zdnet', 'forbes', 'axios'];
    const researchSources = ['arxiv', 'paperswithcode', 'distill', 'the_batch'];
    
    if (officialSources.some(s => source.includes(s))) return 'official';
    if (newsSources.some(s => source.includes(s))) return 'news';
    if (researchSources.some(s => source.includes(s))) return 'research';
    if (source.includes('reddit') || source.includes('hackernews')) return 'community';
    
    return 'news';
}

function getSourceName(source) {
    // Map source IDs to display names
    const nameMap = {
        'openai': 'OpenAI',
        'anthropic': 'Anthropic',
        'google_ai': 'Google AI',
        'meta_ai': 'Meta AI',
        'microsoft_ai': 'Microsoft',
        'nvidia_ai': 'NVIDIA',
        'huggingface': 'Hugging Face',
        'cohere': 'Cohere',
        'deepmind': 'DeepMind',
        'stability_ai': 'Stability AI',
        'venturebeat_ai': 'VentureBeat',
        'techcrunch_ai': 'TechCrunch',
        'mit_tech_ai': 'MIT Tech Review',
        'the_verge_ai': 'The Verge',
        'wired_ai': 'WIRED',
        'arxiv_cs_ai': 'arXiv',
        'arxiv_cs_lg': 'arXiv ML',
        'arxiv_cs_cl': 'arXiv NLP',
        'paperswithcode': 'Papers with Code',
        'the_batch': 'The Batch',
        'reddit_machinelearning': 'r/MachineLearning',
        'reddit_artificial': 'r/artificial',
        'hackernews_ai': 'Hacker News'
    };
    
    return nameMap[source] || source;
}

function formatTimeAgo(dateString) {
    if (!dateString) return 'Unknown date';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return dateString;
    } catch {
        return dateString;
    }
}

function generatePlainEnglish(article) {
    if (!article.update_type) return '';
    
    const updateType = article.update_type;
    const source = getSourceName(article.source);
    
    const explanations = {
        'product_launch': `💡 In simple terms: ${source} launched something new`,
        'feature_update': `💡 In simple terms: ${source} improved their product`,
        'research_paper': `💡 In simple terms: New research findings published`,
        'acquisition': `💡 In simple terms: A company was acquired`,
        'funding': `💡 In simple terms: Company raised money`,
        'partnership': `💡 In simple terms: Companies are working together`
    };
    
    const explanation = explanations[updateType];
    return explanation ? `<span class="plain-english">${explanation}</span>` : '';
}

function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== UI State Functions =====
function showLoading(message = 'Loading AI updates') {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.classList.remove('hidden');
        const textElement = indicator.querySelector('.loader-text');
        if (textElement) {
            textElement.textContent = message;
        }
    }
}

function hideLoading() {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.classList.add('hidden');
    }
}

function showError(message, details = '') {
    hideLoading();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md';
    errorDiv.innerHTML = `
        <div class="flex items-start gap-3">
            <i class="fas fa-exclamation-circle text-2xl"></i>
            <div class="flex-1">
                <div class="font-semibold mb-1">${message}</div>
                ${details ? `<div class="text-sm opacity-90">${details}</div>` : ''}
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white hover:text-gray-200">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.style.transition = 'opacity 0.3s';
            errorDiv.style.opacity = '0';
            setTimeout(() => errorDiv.remove(), 300);
        }
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50';
    successDiv.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas fa-check-circle text-2xl"></i>
            <div class="font-semibold">${message}</div>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.transition = 'opacity 0.3s';
        successDiv.style.opacity = '0';
        setTimeout(() => successDiv.remove(), 300);
    }, 3000);
}

// ===== Help Functions =====
function toggleHelp() {
    const panel = document.getElementById('helpPanel');
    panel.classList.toggle('active');
}

function showGlossary() {
    // Create glossary modal on demand (only once)
    if (!document.getElementById('glossaryModal')) {
        const modal = createGlossaryModal();
        document.body.appendChild(modal);
    }
    document.getElementById('glossaryModal').classList.remove('hidden');
}

function createGlossaryModal() {
    const modal = document.createElement('div');
    modal.id = 'glossaryModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4';
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    };
    
    modal.innerHTML = `
        <div class="bg-gray-800 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-gray-800 border-b border-gray-700 p-6 flex items-center justify-between">
                <h2 class="text-2xl font-bold text-white">
                    <i class="fas fa-book text-blue-500 mr-2"></i>AI Glossary
                </h2>
                <button onclick="document.getElementById('glossaryModal').classList.add('hidden')" class="text-gray-400 hover:text-white text-2xl">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-6 space-y-4">
                ${generateGlossaryTerms()}
            </div>
        </div>
    `;
    
    return modal;
}

function generateGlossaryTerms() {
    const terms = [
        { term: 'Artificial Intelligence (AI)', desc: 'Computer systems that can perform tasks requiring human intelligence, like understanding language or recognizing images.' },
        { term: 'Large Language Model (LLM)', desc: 'An AI trained on massive amounts of text that can understand and generate human-like text. Powers ChatGPT and Claude.' },
        { term: 'Machine Learning (ML)', desc: 'AI that learns from examples rather than being explicitly programmed. Like Netflix learning your preferences.' },
        { term: 'GPT', desc: 'Generative Pre-trained Transformer - The technology behind ChatGPT, created by OpenAI.' },
        { term: 'Neural Network', desc: 'Computer system inspired by the human brain, made of interconnected nodes that recognize patterns.' },
        { term: 'Transformer', desc: 'A type of neural network particularly good at understanding language and context.' },
        { term: 'Fine-tuning', desc: 'Taking an existing AI model and training it further on specific data for a particular task.' },
        { term: 'Prompt', desc: 'The text you type into an AI system to get a response. Good prompts lead to better answers.' },
        { term: 'Multimodal AI', desc: 'AI that can understand multiple types of data like text, images, and audio together.' },
        { term: 'Generative AI', desc: 'AI that creates new content like text, images, or music rather than just analyzing.' },
        { term: 'Hallucination', desc: 'When AI confidently provides incorrect information or makes up facts.' },
        { term: 'Token', desc: 'A piece of text that AI processes, usually a word or part of a word.' },
        { term: 'Training Data', desc: 'The information (text, images, etc.) that AI systems learn from.' },
        { term: 'AI Agent', desc: 'An AI system that can take actions on your behalf, like booking appointments or sending emails.' }
    ];
    
    return terms.map(t => `
        <div class="p-4 bg-gray-700 rounded-lg border-l-4 border-blue-500 hover:bg-gray-600 transition">
            <h3 class="text-lg font-bold text-white mb-2">${t.term}</h3>
            <p class="text-gray-300">${t.desc}</p>
        </div>
    `).join('');
}

function startTour() {
    alert('Welcome to AI Scout! 🤖\n\n✨ Today\'s Highlights - Latest 24h updates\n🏢 Companies - Updates from AI companies\n📚 Topics - Browse by category\n🔍 Search - Find anything about AI');
}

// ===== First Visit Check =====
function checkFirstVisit() {
    // Simplified - no onboarding tour
    if (!localStorage.getItem('ai_scout_visited')) {
        localStorage.setItem('ai_scout_visited', 'true');
    }
}
