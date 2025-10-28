// AI Scout - Onboarding & Tour Module

// Tour Steps Configuration
const TOUR_STEPS = [
    {
        target: '.hero-section',
        title: 'Welcome to AI Scout! 👋',
        message: 'Your one-stop source for everything happening in AI. Let me show you around!',
        position: 'bottom'
    },
    {
        target: '#heroSearch',
        title: 'Search Anything',
        message: 'Ask questions in plain English like "What is ChatGPT?" or "Latest from OpenAI"',
        position: 'bottom'
    },
    {
        target: '#todayArticles',
        title: 'Today\'s Highlights',
        message: 'See the most important AI news from the last 24 hours',
        position: 'left'
    },
    {
        target: '#companiesList',
        title: 'Follow Companies',
        message: 'Get updates from specific AI companies like OpenAI, Google, or Anthropic',
        position: 'left'
    },
    {
        target: '#topicsList',
        title: 'Browse by Topic',
        message: 'Explore AI content by categories like Chatbots, Image AI, or Research Papers',
        position: 'left'
    },
    {
        target: '.plain-english',
        title: 'Plain English Explanations',
        message: 'Look for these yellow boxes - they explain technical updates in simple terms',
        position: 'top',
        optional: true // Only show if element exists
    },
    {
        target: '.source-badge',
        title: 'Source Badges',
        message: 'Green badges are official company sources, blue are news sites, purple are research papers',
        position: 'top',
        optional: true
    },
    {
        target: '.floating-help-btn',
        title: 'Need Help?',
        message: 'Click this button anytime if you need guidance or want to see this tour again',
        position: 'left'
    }
];

let currentTourStep = 0;
let tourOverlay = null;
let tourTooltip = null;

// ===== Welcome Modal =====
function showWelcomeModal() {
    const modal = document.createElement('div');
    modal.id = 'welcomeModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.style.backdropFilter = 'blur(4px)';
    
    modal.innerHTML = `
        <div class="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-fadeIn" style="animation: fadeIn 0.3s ease-out;">
            <div class="text-center mb-6">
                <div class="text-6xl mb-4">👋</div>
                <h2 class="text-3xl font-bold text-gray-900 mb-2">Welcome to AI Scout!</h2>
                <p class="text-gray-600">Your guide to everything happening in AI</p>
            </div>
            
            <div class="space-y-4 mb-6">
                <div class="flex items-start gap-3">
                    <div class="text-2xl">⚡</div>
                    <div>
                        <h3 class="font-semibold text-gray-900">Daily Updates</h3>
                        <p class="text-sm text-gray-600">Get the latest AI news from 28+ trusted sources</p>
                    </div>
                </div>
                
                <div class="flex items-start gap-3">
                    <div class="text-2xl">🏢</div>
                    <div>
                        <h3 class="font-semibold text-gray-900">Follow Companies</h3>
                        <p class="text-sm text-gray-600">Track updates from OpenAI, Google, Anthropic, and more</p>
                    </div>
                </div>
                
                <div class="flex items-start gap-3">
                    <div class="text-2xl">📚</div>
                    <div>
                        <h3 class="font-semibold text-gray-900">Browse Topics</h3>
                        <p class="text-sm text-gray-600">Explore by your interests: Chatbots, Image AI, Research</p>
                    </div>
                </div>
            </div>
            
            <div class="space-y-3">
                <button onclick="startTourFromWelcome()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition">
                    Take a Quick Tour (30 seconds)
                </button>
                <button onclick="closeWelcomeModal()" class="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition">
                    Skip and Explore
                </button>
            </div>
            
            <div class="mt-4 text-center">
                <label class="inline-flex items-center text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" id="dontShowAgain" class="mr-2">
                    Don't show this again
                </label>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeWelcomeModal() {
    const modal = document.getElementById('welcomeModal');
    if (modal) {
        const dontShow = document.getElementById('dontShowAgain')?.checked;
        if (dontShow) {
            localStorage.setItem('ai_scout_skip_welcome', 'true');
        }
        modal.remove();
    }
}

function startTourFromWelcome() {
    closeWelcomeModal();
    setTimeout(() => startInteractiveTour(), 300);
}

// ===== Interactive Tour =====
function startInteractiveTour() {
    currentTourStep = 0;
    createTourOverlay();
    showTourStep(currentTourStep);
}

function createTourOverlay() {
    // Create overlay
    tourOverlay = document.createElement('div');
    tourOverlay.id = 'tourOverlay';
    tourOverlay.className = 'fixed inset-0 bg-black bg-opacity-70 z-40';
    tourOverlay.style.transition = 'opacity 0.3s';
    document.body.appendChild(tourOverlay);
    
    // Create tooltip
    tourTooltip = document.createElement('div');
    tourTooltip.id = 'tourTooltip';
    tourTooltip.className = 'fixed bg-white rounded-lg shadow-2xl p-6 z-50';
    tourTooltip.style.maxWidth = '400px';
    tourTooltip.style.transition = 'all 0.3s';
    document.body.appendChild(tourTooltip);
}

function showTourStep(stepIndex) {
    if (stepIndex >= TOUR_STEPS.length) {
        endTour();
        return;
    }
    
    const step = TOUR_STEPS[stepIndex];
    const targetElement = document.querySelector(step.target);
    
    // Skip optional steps if element doesn't exist
    if (step.optional && !targetElement) {
        showTourStep(stepIndex + 1);
        return;
    }
    
    if (!targetElement) {
        console.warn(`Tour target not found: ${step.target}`);
        showTourStep(stepIndex + 1);
        return;
    }
    
    // Highlight target element
    highlightElement(targetElement);
    
    // Position and show tooltip
    positionTooltip(targetElement, step);
    
    // Update tooltip content
    tourTooltip.innerHTML = `
        <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
                <h3 class="text-xl font-bold text-gray-900">${step.title}</h3>
                <span class="text-sm text-gray-500">Step ${stepIndex + 1} of ${TOUR_STEPS.length}</span>
            </div>
            <p class="text-gray-600">${step.message}</p>
        </div>
        
        <div class="flex items-center justify-between">
            ${stepIndex > 0 ? `
                <button onclick="previousTourStep()" class="text-gray-600 hover:text-gray-900 font-medium">
                    <i class="fas fa-arrow-left mr-2"></i>Previous
                </button>
            ` : '<div></div>'}
            
            <div class="flex gap-2">
                <button onclick="endTour()" class="text-gray-600 hover:text-gray-900 font-medium px-4 py-2">
                    Skip
                </button>
                <button onclick="nextTourStep()" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg">
                    ${stepIndex < TOUR_STEPS.length - 1 ? 'Next' : 'Finish'}
                </button>
            </div>
        </div>
        
        <div class="mt-3 flex justify-center gap-1">
            ${TOUR_STEPS.map((_, i) => `
                <div class="w-2 h-2 rounded-full ${i === stepIndex ? 'bg-blue-600' : 'bg-gray-300'}"></div>
            `).join('')}
        </div>
    `;
}

function highlightElement(element) {
    // Remove previous highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
        el.style.position = '';
        el.style.zIndex = '';
        el.style.boxShadow = '';
    });
    
    // Add highlight to current element
    element.classList.add('tour-highlight');
    const originalPosition = window.getComputedStyle(element).position;
    if (originalPosition === 'static') {
        element.style.position = 'relative';
    }
    element.style.zIndex = '45';
    element.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 20px rgba(59, 130, 246, 0.5)';
    element.style.transition = 'all 0.3s';
    
    // Scroll element into view
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function positionTooltip(targetElement, step) {
    const rect = targetElement.getBoundingClientRect();
    const tooltipRect = tourTooltip.getBoundingClientRect();
    
    let top, left;
    
    switch (step.position) {
        case 'bottom':
            top = rect.bottom + 20;
            left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            break;
        case 'top':
            top = rect.top - tooltipRect.height - 20;
            left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
            break;
        case 'left':
            top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
            left = rect.left - tooltipRect.width - 20;
            break;
        case 'right':
            top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
            left = rect.right + 20;
            break;
        default:
            top = rect.bottom + 20;
            left = rect.left;
    }
    
    // Keep tooltip within viewport
    const padding = 20;
    if (left < padding) left = padding;
    if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipRect.height > window.innerHeight - padding) {
        top = window.innerHeight - tooltipRect.height - padding;
    }
    
    tourTooltip.style.top = `${top}px`;
    tourTooltip.style.left = `${left}px`;
}

function nextTourStep() {
    currentTourStep++;
    showTourStep(currentTourStep);
}

function previousTourStep() {
    if (currentTourStep > 0) {
        currentTourStep--;
        showTourStep(currentTourStep);
    }
}

function endTour() {
    // Remove highlights
    document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
        el.style.position = '';
        el.style.zIndex = '';
        el.style.boxShadow = '';
    });
    
    // Remove overlay and tooltip
    if (tourOverlay) tourOverlay.remove();
    if (tourTooltip) tourTooltip.remove();
    
    // Mark tour as completed
    localStorage.setItem('ai_scout_tour_completed', 'true');
    
    // Show completion message
    showCompletionMessage();
}

function showCompletionMessage() {
    const message = document.createElement('div');
    message.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg z-50';
    message.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas fa-check-circle text-2xl"></i>
            <div>
                <div class="font-semibold">Tour Complete! 🎉</div>
                <div class="text-sm">You're all set to explore AI Scout</div>
            </div>
        </div>
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.style.transition = 'opacity 0.3s';
        message.style.opacity = '0';
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

// ===== Initialization =====
function initializeOnboarding() {
    // Check if this is first visit
    const hasVisited = localStorage.getItem('ai_scout_visited');
    const skipWelcome = localStorage.getItem('ai_scout_skip_welcome');
    
    if (!hasVisited && !skipWelcome) {
        // Show welcome modal after a short delay
        setTimeout(() => {
            showWelcomeModal();
            localStorage.setItem('ai_scout_visited', 'true');
        }, 1000);
    }
}

// Override the startTour function in main app.js
if (typeof window !== 'undefined') {
    window.startTour = startInteractiveTour;
    window.showWelcome = showWelcomeModal;
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeOnboarding);
} else {
    initializeOnboarding();
}

