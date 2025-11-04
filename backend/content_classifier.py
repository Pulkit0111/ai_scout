"""
Content Classification Module
Classify articles by content type, update type, and beginner-friendliness
"""

from typing import Dict
from config import SOURCE_METADATA, FEED_SOURCES


def get_source_type(source: str) -> str:
    """
    Get the content type of a source.
    
    Args:
        source: Source identifier (e.g., 'openai', 'techcrunch_ai')
    
    Returns:
        Source type: 'official', 'news', 'research', 'community', 'tools', or 'unknown'
    """
    metadata = SOURCE_METADATA.get(source, {})
    return metadata.get('type', 'unknown')


def detect_update_type(title: str, summary: str) -> str:
    """
    Detect what type of update an article represents.
    
    Args:
        title: Article title
        summary: Article summary
    
    Returns:
        Update type: 'product_launch', 'research_paper', 'feature_update',
                    'acquisition', 'funding', 'partnership', or 'general'
    """
    content = (title + " " + summary).lower()
    
    # Product launches
    launch_keywords = ["launch", "launching", "introducing", "introduce", "announced", 
                       "announce", "released", "release", "unveil", "debuts", "available now"]
    if any(word in content for word in launch_keywords):
        return "product_launch"
    
    # Research papers
    research_keywords = ["paper", "arxiv", "research", "study", "findings", 
                         "publication", "conference", "preprint"]
    if any(word in content for word in research_keywords):
        return "research_paper"
    
    # Feature updates
    update_keywords = ["update", "updated", "updates", "improve", "improved", 
                       "improvement", "feature", "enhancement", "version"]
    if any(word in content for word in update_keywords):
        return "feature_update"
    
    # Acquisitions
    acquisition_keywords = ["acquire", "acquired", "acquisition", "acquires", 
                            "merge", "merger", "bought", "buys"]
    if any(word in content for word in acquisition_keywords):
        return "acquisition"
    
    # Funding
    funding_keywords = ["funding", "raised", "raises", "investment", "series", 
                        "valuation", "venture capital", "invested"]
    if any(word in content for word in funding_keywords):
        return "funding"
    
    # Partnerships
    partnership_keywords = ["partner", "partnership", "collaboration", "collaborate", 
                            "collaborating", "teaming up", "alliance"]
    if any(word in content for word in partnership_keywords):
        return "partnership"
    
    return "general"


def is_beginner_friendly(article: Dict) -> bool:
    """
    Determine if an article is beginner-friendly.
    
    Args:
        article: Article dictionary with title, summary, source
    
    Returns:
        True if the article is likely beginner-friendly, False otherwise
    """
    source = article.get('source', '')
    title = article.get('title', '').lower()
    summary = article.get('summary', '').lower()
    content = title + " " + summary
    
    # Official company announcements are usually beginner-friendly
    source_type = get_source_type(source)
    if source_type == 'official':
        beginner_score = 2
    elif source_type == 'news':
        beginner_score = 1
    else:
        beginner_score = 0
    
    # Research papers are typically not beginner-friendly
    if source_type == 'research':
        return False
    
    # Check for beginner-friendly indicators
    friendly_indicators = [
        "how to", "guide", "tutorial", "introduction", "intro to", "explained",
        "for beginners", "getting started", "what is", "understanding",
        "simplified", "easy", "simple"
    ]
    
    for indicator in friendly_indicators:
        if indicator in content:
            beginner_score += 2
    
    # Check for technical jargon (makes it less beginner-friendly)
    technical_terms = [
        "neural network", "gradient descent", "backpropagation", "transformer architecture",
        "attention mechanism", "embeddings", "fine-tuning", "reinforcement learning",
        "arxiv", "preprint", "ablation study", "hyperparameter"
    ]
    
    technical_count = sum(1 for term in technical_terms if term in content)
    beginner_score -= technical_count
    
    # Product launches and announcements tend to be more accessible
    update_type = detect_update_type(title, summary)
    if update_type in ['product_launch', 'feature_update']:
        beginner_score += 1
    
    return beginner_score >= 2


def classify_content(article: Dict) -> Dict:
    """
    Classify an article comprehensively.
    
    Args:
        article: Article dictionary with title, summary, source
    
    Returns:
        Dictionary with classification results
    """
    title = article.get('title', '')
    summary = article.get('summary', '')
    source = article.get('source', '')
    
    return {
        'source_type': get_source_type(source),
        'update_type': detect_update_type(title, summary),
        'is_beginner_friendly': is_beginner_friendly(article),
        'credibility': SOURCE_METADATA.get(source, {}).get('credibility', 'medium')
    }


def add_classification(article: Dict) -> Dict:
    """
    Add classification metadata to an article.
    
    Args:
        article: Article dictionary
    
    Returns:
        Article with added classification fields
    """
    classification = classify_content(article)
    article.update(classification)
    return article

