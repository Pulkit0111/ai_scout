"""
Article categorizer based on keywords and content
"""

from config import CATEGORIES, DEFAULT_CATEGORY


def categorize_article(title: str, summary: str, source: str = "") -> str:
    """
    Categorize an article based on its title, summary, and source.
    
    Args:
        title: Article title
        summary: Article summary/description
        source: Source of the article
    
    Returns:
        Category name
    """
    # Combine all text for analysis
    content = f"{title} {summary} {source}".lower()
    
    # Score each category based on keyword matches
    category_scores = {}
    
    for category, keywords in CATEGORIES.items():
        score = 0
        for keyword in keywords:
            # Count occurrences of each keyword
            score += content.count(keyword.lower())
        category_scores[category] = score
    
    # Get category with highest score
    max_score = max(category_scores.values())
    
    if max_score == 0:
        return DEFAULT_CATEGORY
    
    # Return category with highest score
    for category, score in category_scores.items():
        if score == max_score:
            return category
    
    return DEFAULT_CATEGORY


def categorize_articles(articles: list) -> dict:
    """
    Categorize a list of articles and group them by category.
    
    Args:
        articles: List of article dictionaries
    
    Returns:
        Dictionary with categories as keys and lists of articles as values
    """
    categorized = {category: [] for category in CATEGORIES.keys()}
    
    for article in articles:
        category = categorize_article(
            article.get("title", ""),
            article.get("summary", ""),
            article.get("source", "")
        )
        article["category"] = category
        categorized[category].append(article)
    
    return categorized

