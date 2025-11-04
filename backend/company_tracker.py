"""
Company Tracking Module
Track major AI companies and their updates
"""

from typing import List, Dict

# Tracked AI Companies
TRACKED_COMPANIES = {
    "openai": {
        "name": "OpenAI",
        "sources": ["openai"],
        "logo": "/static/logos/openai.png",
        "description": "Creator of ChatGPT and GPT models",
        "products": ["ChatGPT", "GPT-4", "GPT-4o", "DALL-E", "Whisper", "Sora"],
        "founded": "2015",
        "website": "https://openai.com"
    },
    "anthropic": {
        "name": "Anthropic",
        "sources": ["anthropic"],
        "logo": "/static/logos/anthropic.png",
        "description": "Creator of Claude AI assistant",
        "products": ["Claude", "Claude 3", "Claude 3.5 Sonnet"],
        "founded": "2021",
        "website": "https://anthropic.com"
    },
    "google": {
        "name": "Google AI",
        "sources": ["google_ai", "deepmind"],
        "logo": "/static/logos/google.png",
        "description": "AI research and products from Google",
        "products": ["Gemini", "Bard", "PaLM", "AlphaFold", "AlphaGo"],
        "founded": "1998",
        "website": "https://ai.google"
    },
    "meta": {
        "name": "Meta AI",
        "sources": ["meta_ai"],
        "logo": "/static/logos/meta.png",
        "description": "AI research and products from Meta (Facebook)",
        "products": ["Llama", "Llama 2", "Llama 3", "PyTorch", "Segment Anything"],
        "founded": "2004",
        "website": "https://ai.meta.com"
    },
    "microsoft": {
        "name": "Microsoft AI",
        "sources": ["microsoft_ai"],
        "logo": "/static/logos/microsoft.png",
        "description": "AI innovations from Microsoft",
        "products": ["Copilot", "Azure AI", "Bing AI", "GPT-4 integration"],
        "founded": "1975",
        "website": "https://microsoft.com/ai"
    },
    "nvidia": {
        "name": "NVIDIA",
        "sources": ["nvidia_ai"],
        "logo": "/static/logos/nvidia.png",
        "description": "AI hardware and software leader",
        "products": ["CUDA", "TensorRT", "NeMo", "Omniverse", "H100"],
        "founded": "1993",
        "website": "https://nvidia.com/ai"
    },
    "huggingface": {
        "name": "Hugging Face",
        "sources": ["huggingface"],
        "logo": "/static/logos/huggingface.png",
        "description": "Open-source AI platform",
        "products": ["Transformers", "Datasets", "Spaces", "Hub"],
        "founded": "2016",
        "website": "https://huggingface.co"
    },
    "cohere": {
        "name": "Cohere",
        "sources": ["cohere"],
        "logo": "/static/logos/cohere.png",
        "description": "Enterprise AI platform",
        "products": ["Command", "Embed", "Rerank"],
        "founded": "2019",
        "website": "https://cohere.com"
    },
    "stability": {
        "name": "Stability AI",
        "sources": ["stability_ai"],
        "logo": "/static/logos/stability.png",
        "description": "Creators of Stable Diffusion",
        "products": ["Stable Diffusion", "Stable Video", "Stable Audio"],
        "founded": "2019",
        "website": "https://stability.ai"
    },
}


def get_company_updates(company_id: str, all_articles: List[Dict]) -> List[Dict]:
    """
    Get all articles from a specific company.
    
    Args:
        company_id: Company identifier (e.g., 'openai', 'anthropic')
        all_articles: List of all articles
    
    Returns:
        List of articles from the specified company's sources
    """
    company = TRACKED_COMPANIES.get(company_id)
    if not company:
        return []
    
    company_sources = company['sources']
    
    # Filter articles from this company's sources
    company_articles = [
        article for article in all_articles 
        if article.get('source') in company_sources
    ]
    
    # Sort by date (most recent first)
    company_articles.sort(
        key=lambda x: x.get('published_date', ''), 
        reverse=True
    )
    
    return company_articles


def get_all_companies_with_counts(all_articles: List[Dict]) -> List[Dict]:
    """
    Get all tracked companies with their article counts.
    
    Args:
        all_articles: List of all articles
    
    Returns:
        List of companies with update counts and latest article
    """
    companies = []
    
    for company_id, company_info in TRACKED_COMPANIES.items():
        updates = get_company_updates(company_id, all_articles)
        
        companies.append({
            **company_info,
            "id": company_id,
            "update_count": len(updates),
            "latest_update": updates[0] if updates else None
        })
    
    # Sort by update count (most active first)
    companies.sort(key=lambda x: x['update_count'], reverse=True)
    
    return companies


def get_company_info(company_id: str) -> Dict:
    """
    Get information about a specific company.
    
    Args:
        company_id: Company identifier
    
    Returns:
        Dictionary with company information, or empty dict if not found
    """
    return TRACKED_COMPANIES.get(company_id, {})

