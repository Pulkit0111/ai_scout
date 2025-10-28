"""
Configuration file for RSS feed sources and categories
"""

import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# RSS Feed Sources
RSS_FEEDS = {
    "huggingface": "https://huggingface.co/blog/feed.xml",
    "openai": "https://openai.com/blog/rss.xml",
    "google_ai": "https://blog.research.google/feeds/posts/default",
    "the_batch": "https://www.deeplearning.ai/the-batch/feed/",
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
OPENAI_TEMPERATURE = 0.3  # Lower temperature for consistent results

# Search Configuration
SEARCH_SIMPLE_QUERY_THRESHOLD = 3  # Word count threshold for simple vs complex queries
SEARCH_MAX_RESULTS = 50  # Maximum number of search results to return

