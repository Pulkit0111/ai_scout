"""
RSS Feed Aggregator for fetching and parsing feeds
"""

import feedparser
import requests
from datetime import datetime
from typing import List, Dict
from config import RSS_FEEDS


def fetch_feed(url: str, source_name: str) -> List[Dict]:
    """
    Fetch and parse a single RSS feed.
    
    Args:
        url: RSS feed URL
        source_name: Name of the source
    
    Returns:
        List of article dictionaries
    """
    articles = []
    
    try:
        feed = feedparser.parse(url)
        
        for entry in feed.entries[:10]:  # Limit to 10 most recent articles per feed
            article = {
                "title": entry.get("title", "No Title"),
                "link": entry.get("link", ""),
                "summary": entry.get("summary", entry.get("description", "No summary available")),
                "source": source_name,
                "published": entry.get("published", entry.get("updated", "")),
                "author": entry.get("author", "Unknown"),
            }
            
            # Parse and format the published date
            if article["published"]:
                try:
                    parsed_date = feedparser._parse_date(entry.get("published_parsed", entry.get("updated_parsed")))
                    if parsed_date:
                        article["published_date"] = datetime(*parsed_date[:6]).strftime("%Y-%m-%d")
                    else:
                        article["published_date"] = datetime.now().strftime("%Y-%m-%d")
                except:
                    article["published_date"] = datetime.now().strftime("%Y-%m-%d")
            else:
                article["published_date"] = datetime.now().strftime("%Y-%m-%d")
            
            articles.append(article)
    
    except Exception as e:
        print(f"Error fetching feed from {source_name}: {str(e)}")
    
    return articles


def fetch_all_feeds() -> List[Dict]:
    """
    Fetch and aggregate all RSS feeds.
    
    Returns:
        List of all articles from all feeds
    """
    all_articles = []
    
    for source_name, url in RSS_FEEDS.items():
        articles = fetch_feed(url, source_name)
        all_articles.extend(articles)
    
    # Sort by published date (most recent first)
    all_articles.sort(key=lambda x: x.get("published_date", ""), reverse=True)
    
    return all_articles


def get_articles_by_category(category: str, all_articles: List[Dict] = None) -> List[Dict]:
    """
    Get articles filtered by a specific category.
    
    Args:
        category: Category name
        all_articles: List of all articles (optional, will fetch if not provided)
    
    Returns:
        List of articles in the specified category
    """
    if all_articles is None:
        all_articles = fetch_all_feeds()
    
    return [article for article in all_articles if article.get("category") == category]

