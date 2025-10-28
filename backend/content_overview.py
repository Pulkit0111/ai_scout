"""
Content Overview Generator
Provides statistics and highlights for all curated articles
"""

from datetime import datetime, timedelta
from typing import Dict, List
from collections import Counter


def filter_articles_by_days(articles: List[Dict], days: int = 7) -> List[Dict]:
    """
    Filter articles published within the last N days.
    
    Args:
        articles: List of article dictionaries
        days: Number of days to look back (default: 7)
    
    Returns:
        List of articles from the past N days
    """
    cutoff_date = datetime.now() - timedelta(days=days)
    filtered_articles = []
    
    for article in articles:
        try:
            article_date = datetime.strptime(article.get("published_date", ""), "%Y-%m-%d")
            if article_date >= cutoff_date:
                filtered_articles.append(article)
        except (ValueError, TypeError):
            # If date parsing fails, include the article (assume it's recent)
            filtered_articles.append(article)
    
    return filtered_articles


def calculate_statistics(categorized_articles: Dict[str, List[Dict]]) -> Dict:
    """
    Calculate statistics for weekly articles.
    
    Args:
        categorized_articles: Dictionary with categories as keys and article lists as values
    
    Returns:
        Dictionary with various statistics
    """
    # Total article count
    total_articles = sum(len(articles) for articles in categorized_articles.values())
    
    # Articles by category
    category_counts = {
        category: len(articles) 
        for category, articles in categorized_articles.items()
        if len(articles) > 0
    }
    
    # Count articles by source
    all_articles = []
    for articles in categorized_articles.values():
        all_articles.extend(articles)
    
    source_counter = Counter(article.get("source", "Unknown") for article in all_articles)
    top_sources = [
        {"source": source, "count": count} 
        for source, count in source_counter.most_common(5)
    ]
    
    # Get date range
    dates = []
    for article in all_articles:
        try:
            article_date = datetime.strptime(article.get("published_date", ""), "%Y-%m-%d")
            dates.append(article_date)
        except (ValueError, TypeError):
            continue
    
    date_range = {
        "start": min(dates).strftime("%Y-%m-%d") if dates else None,
        "end": max(dates).strftime("%Y-%m-%d") if dates else None
    }
    
    return {
        "total_articles": total_articles,
        "category_breakdown": category_counts,
        "top_sources": top_sources,
        "date_range": date_range
    }


def get_highlights(categorized_articles: Dict[str, List[Dict]], count: int = 5) -> List[Dict]:
    """
    Get top highlight articles from the week.
    Selects the most recent articles across all categories.
    
    Args:
        categorized_articles: Dictionary with categories as keys and article lists as values
        count: Number of highlights to return (default: 5)
    
    Returns:
        List of highlight articles
    """
    all_articles = []
    for articles in categorized_articles.values():
        all_articles.extend(articles)
    
    # Sort by published date (most recent first)
    sorted_articles = sorted(
        all_articles,
        key=lambda x: x.get("published_date", ""),
        reverse=True
    )
    
    # Return top N articles
    return sorted_articles[:count]


def generate_content_overview(categorized_articles: Dict[str, List[Dict]]) -> Dict:
    """
    Generate a complete content overview with statistics and highlights.
    
    Args:
        categorized_articles: Dictionary with categories as keys and article lists as values
    
    Returns:
        Dictionary containing statistics and highlights
    """
    # Use all articles for content overview (no time filtering)
    # This shows the full picture of all curated content
    weekly_categorized = categorized_articles
    
    # Calculate statistics
    statistics = calculate_statistics(weekly_categorized)
    
    # Get highlights (top 5 most recent across all articles)
    highlights = get_highlights(weekly_categorized, count=5)
    
    return {
        "period": "All Content",
        "statistics": statistics,
        "highlights": highlights,
        "generated_at": datetime.now().isoformat()
    }

