"""
Configuration file for RSS feed sources and categories
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# RSS Feed Sources organized by content type
FEED_SOURCES = {
    "official_blogs": {
        "openai": "https://openai.com/blog/rss.xml",
        "anthropic": "https://www.anthropic.com/news/rss.xml",
        "google_ai": "https://blog.research.google/feeds/posts/default",
        "meta_ai": "https://ai.meta.com/blog/rss/",
        "microsoft_ai": "https://blogs.microsoft.com/ai/feed/",
        "nvidia_ai": "https://blogs.nvidia.com/blog/category/deep-learning/feed/",
        "huggingface": "https://huggingface.co/blog/feed.xml",
        "cohere": "https://cohere.com/blog/rss.xml",
        "deepmind": "https://deepmind.google/blog/rss.xml",
        "stability_ai": "https://stability.ai/news/rss",
    },
    "news_sites": {
        "venturebeat_ai": "https://venturebeat.com/category/ai/feed/",
        "techcrunch_ai": "https://techcrunch.com/category/artificial-intelligence/feed/",
        "mit_tech_ai": "https://www.technologyreview.com/topic/artificial-intelligence/feed/",
        "the_verge_ai": "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
        "wired_ai": "https://www.wired.com/feed/tag/ai/latest/rss",
        "ars_technica_ai": "https://feeds.arstechnica.com/arstechnica/technology-lab",
        "ai_news": "https://www.artificialintelligence-news.com/feed/",
        "axios_ai": "https://www.axios.com/feeds/artificial-intelligence.rss",
        "zdnet_ai": "https://www.zdnet.com/topic/artificial-intelligence/rss.xml",
        "forbes_ai": "https://www.forbes.com/ai/feed/",
    },
    "research": {
        "arxiv_cs_ai": "http://export.arxiv.org/rss/cs.AI",
        "arxiv_cs_lg": "http://export.arxiv.org/rss/cs.LG",
        "arxiv_cs_cl": "http://export.arxiv.org/rss/cs.CL",
        "paperswithcode": "https://paperswithcode.com/latest.xml",
        "the_batch": "https://www.deeplearning.ai/the-batch/feed/",
        "distill": "https://distill.pub/rss.xml",
    },
    "community": {
        "reddit_machinelearning": "https://www.reddit.com/r/MachineLearning/.rss",
        "reddit_artificial": "https://www.reddit.com/r/artificial/.rss",
        "reddit_openai": "https://www.reddit.com/r/OpenAI/.rss",
        "reddit_localllama": "https://www.reddit.com/r/LocalLLaMA/.rss",
        "hackernews_ai": "https://hnrss.org/newest?q=AI+OR+LLM+OR+GPT",
    },
    "tools_products": {
        "producthunt_ai": "https://www.producthunt.com/topics/artificial-intelligence.rss",
        "github_trending": "https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml",
    }
}

# Flatten feeds for backward compatibility
RSS_FEEDS = {}
for category, feeds in FEED_SOURCES.items():
    RSS_FEEDS.update(feeds)

# Source metadata for UI display
SOURCE_METADATA = {
    # Official Company Blogs
    "openai": {
        "name": "OpenAI",
        "logo": "/static/logos/openai.png",
        "type": "official",
        "credibility": "high",
        "description": "Official blog from OpenAI, creators of ChatGPT and GPT models"
    },
    "anthropic": {
        "name": "Anthropic",
        "logo": "/static/logos/anthropic.png",
        "type": "official",
        "credibility": "high",
        "description": "Official blog from Anthropic, creators of Claude AI"
    },
    "google_ai": {
        "name": "Google AI",
        "logo": "/static/logos/google.png",
        "type": "official",
        "credibility": "high",
        "description": "Research and updates from Google's AI division"
    },
    "meta_ai": {
        "name": "Meta AI",
        "logo": "/static/logos/meta.png",
        "type": "official",
        "credibility": "high",
        "description": "AI research and products from Meta (Facebook)"
    },
    "microsoft_ai": {
        "name": "Microsoft AI",
        "logo": "/static/logos/microsoft.png",
        "type": "official",
        "credibility": "high",
        "description": "AI innovations from Microsoft"
    },
    "nvidia_ai": {
        "name": "NVIDIA AI",
        "logo": "/static/logos/nvidia.png",
        "type": "official",
        "credibility": "high",
        "description": "Deep learning and AI hardware updates from NVIDIA"
    },
    "huggingface": {
        "name": "Hugging Face",
        "logo": "/static/logos/huggingface.png",
        "type": "official",
        "credibility": "high",
        "description": "Open-source AI models and tools platform"
    },
    "cohere": {
        "name": "Cohere",
        "logo": "/static/logos/cohere.png",
        "type": "official",
        "credibility": "high",
        "description": "Enterprise AI platform for language models"
    },
    "deepmind": {
        "name": "DeepMind",
        "logo": "/static/logos/deepmind.png",
        "type": "official",
        "credibility": "high",
        "description": "AI research from Google DeepMind"
    },
    "stability_ai": {
        "name": "Stability AI",
        "logo": "/static/logos/stability.png",
        "type": "official",
        "credibility": "high",
        "description": "Creators of Stable Diffusion"
    },
    # News Sites
    "venturebeat_ai": {
        "name": "VentureBeat AI",
        "logo": "/static/logos/venturebeat.png",
        "type": "news",
        "credibility": "high",
        "description": "AI news and business coverage"
    },
    "techcrunch_ai": {
        "name": "TechCrunch AI",
        "logo": "/static/logos/techcrunch.png",
        "type": "news",
        "credibility": "high",
        "description": "Tech and AI startup news"
    },
    "mit_tech_ai": {
        "name": "MIT Technology Review",
        "logo": "/static/logos/mittech.png",
        "type": "news",
        "credibility": "high",
        "description": "In-depth AI technology analysis"
    },
    "the_verge_ai": {
        "name": "The Verge AI",
        "logo": "/static/logos/theverge.png",
        "type": "news",
        "credibility": "high",
        "description": "AI news and product reviews"
    },
    "wired_ai": {
        "name": "WIRED AI",
        "logo": "/static/logos/wired.png",
        "type": "news",
        "credibility": "high",
        "description": "AI culture and technology stories"
    },
    "ars_technica_ai": {
        "name": "Ars Technica",
        "logo": "/static/logos/arstechnica.png",
        "type": "news",
        "credibility": "high",
        "description": "Technical AI news and analysis"
    },
    "ai_news": {
        "name": "AI News",
        "logo": "/static/logos/ainews.png",
        "type": "news",
        "credibility": "medium",
        "description": "Daily AI industry news"
    },
    "axios_ai": {
        "name": "Axios AI",
        "logo": "/static/logos/axios.png",
        "type": "news",
        "credibility": "high",
        "description": "AI policy and business news"
    },
    "zdnet_ai": {
        "name": "ZDNet AI",
        "logo": "/static/logos/zdnet.png",
        "type": "news",
        "credibility": "medium",
        "description": "Enterprise AI coverage"
    },
    "forbes_ai": {
        "name": "Forbes AI",
        "logo": "/static/logos/forbes.png",
        "type": "news",
        "credibility": "medium",
        "description": "AI business and leadership"
    },
    # Research
    "arxiv_cs_ai": {
        "name": "arXiv AI",
        "logo": "/static/logos/arxiv.png",
        "type": "research",
        "credibility": "high",
        "description": "Latest AI research papers"
    },
    "arxiv_cs_lg": {
        "name": "arXiv Machine Learning",
        "logo": "/static/logos/arxiv.png",
        "type": "research",
        "credibility": "high",
        "description": "Machine learning research papers"
    },
    "arxiv_cs_cl": {
        "name": "arXiv NLP",
        "logo": "/static/logos/arxiv.png",
        "type": "research",
        "credibility": "high",
        "description": "Natural language processing papers"
    },
    "paperswithcode": {
        "name": "Papers with Code",
        "logo": "/static/logos/paperswithcode.png",
        "type": "research",
        "credibility": "high",
        "description": "ML papers with implementation code"
    },
    "the_batch": {
        "name": "The Batch",
        "logo": "/static/logos/deeplearning.png",
        "type": "research",
        "credibility": "high",
        "description": "Weekly AI news from Andrew Ng"
    },
    "distill": {
        "name": "Distill",
        "logo": "/static/logos/distill.png",
        "type": "research",
        "credibility": "high",
        "description": "Clear explanations of ML concepts"
    },
    # Community
    "reddit_machinelearning": {
        "name": "r/MachineLearning",
        "logo": "/static/logos/reddit.png",
        "type": "community",
        "credibility": "medium",
        "description": "Machine learning community discussions"
    },
    "reddit_artificial": {
        "name": "r/artificial",
        "logo": "/static/logos/reddit.png",
        "type": "community",
        "credibility": "medium",
        "description": "AI community discussions"
    },
    "reddit_openai": {
        "name": "r/OpenAI",
        "logo": "/static/logos/reddit.png",
        "type": "community",
        "credibility": "medium",
        "description": "OpenAI community discussions"
    },
    "reddit_localllama": {
        "name": "r/LocalLLaMA",
        "logo": "/static/logos/reddit.png",
        "type": "community",
        "credibility": "medium",
        "description": "Local LLM enthusiasts"
    },
    "hackernews_ai": {
        "name": "Hacker News AI",
        "logo": "/static/logos/hackernews.png",
        "type": "community",
        "credibility": "medium",
        "description": "Tech community AI discussions"
    },
    # Tools & Products
    "producthunt_ai": {
        "name": "Product Hunt AI",
        "logo": "/static/logos/producthunt.png",
        "type": "tools",
        "credibility": "medium",
        "description": "New AI products and tools"
    },
    "github_trending": {
        "name": "GitHub Trending",
        "logo": "/static/logos/github.png",
        "type": "tools",
        "credibility": "medium",
        "description": "Trending repositories"
    },
}

# Categories and their associated keywords
CATEGORIES = {
    "LLMs & Foundation Models": [
        "gpt", "claude", "gemini", "llama", "llm", "large language model",
        "foundation model", "transformer", "bert", "t5", "mistral", "palm",
        "language model", "generative", "chatgpt"
    ],
    "AI Tools & Platforms": [
        "chatgpt", "midjourney", "copilot", "github copilot", "dalle",
        "stable diffusion", "platform", "tool", "api", "service", "app"
    ],
    "Open Source AI Projects": [
        "open source", "hugging face", "pytorch", "tensorflow", "keras",
        "github", "library", "framework", "open-source", "oss", "repository"
    ],
    "AI Research & Papers": [
        "research", "paper", "arxiv", "study", "conference", "publication",
        "neurips", "icml", "iclr", "cvpr", "acl", "emnlp", "findings"
    ],
    "AI Agents & Automation": [
        "agent", "autogpt", "langchain", "automation", "autonomous",
        "workflow", "orchestration", "task automation", "ai agent"
    ],
    "AI in Development": [
        "coding", "developer", "programming", "ide", "devops", "code generation",
        "software development", "debugging", "development tool"
    ],
    "Multimodal AI": [
        "multimodal", "text-to-image", "text-to-video", "image generation",
        "video generation", "audio", "speech", "vision", "image-to-text",
        "visual", "clip", "dall-e", "sora"
    ]
}

# Default category for uncategorized articles
DEFAULT_CATEGORY = "AI Research & Papers"

# OpenAI API Configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = "gpt-4o-mini"  # Cost-effective and fast model
OPENAI_EMBEDDING_MODEL = "text-embedding-3-small"  # Embedding model for semantic search
OPENAI_TEMPERATURE = 0.3  # Lower temperature for consistent results

# Search Configuration
SEARCH_SIMPLE_QUERY_THRESHOLD = 3  # Word count threshold for simple vs complex queries
SEARCH_MAX_RESULTS = 100  # Maximum number of search results to return (before relevance filtering)
SEARCH_SEMANTIC_THRESHOLD = 0.70  # Minimum similarity score for semantic search (0-1, higher = more selective)
SEARCH_RELEVANCE_DISPLAY_THRESHOLD = 75  # Only display results with relevance >= 75%
SEARCH_USE_HYBRID = True  # Combine keyword and semantic search for best results

