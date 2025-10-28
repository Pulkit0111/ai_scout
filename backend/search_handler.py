"""
Search handler for semantic and keyword-based article search using OpenAI embeddings
"""

import json
import numpy as np
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from openai import OpenAI
from config import (
    OPENAI_API_KEY,
    OPENAI_MODEL,
    OPENAI_EMBEDDING_MODEL,
    OPENAI_TEMPERATURE,
    SEARCH_SIMPLE_QUERY_THRESHOLD,
    SEARCH_MAX_RESULTS,
    SEARCH_SEMANTIC_THRESHOLD,
    SEARCH_USE_HYBRID,
    CATEGORIES
)


# Initialize OpenAI client
client = None
if OPENAI_API_KEY:
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
    except Exception as e:
        print(f"Warning: Failed to initialize OpenAI client: {e}")


def get_embedding(text: str) -> Optional[np.ndarray]:
    """
    Get embedding vector for text using OpenAI's embedding model.
    
    Args:
        text: Text to embed
    
    Returns:
        Numpy array of embedding vector or None if failed
    """
    if not client:
        return None
    
    try:
        # Clean and truncate text to avoid token limits
        text = text.strip()[:8000]  # Approximate token limit
        
        response = client.embeddings.create(
            model=OPENAI_EMBEDDING_MODEL,
            input=text
        )
        
        embedding = np.array(response.data[0].embedding)
        return embedding
    
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return None


def cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
    """
    Calculate cosine similarity between two vectors.
    
    Args:
        vec1: First vector
        vec2: Second vector
    
    Returns:
        Similarity score between 0 and 1
    """
    try:
        dot_product = np.dot(vec1, vec2)
        norm1 = np.linalg.norm(vec1)
        norm2 = np.linalg.norm(vec2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
        
        similarity = dot_product / (norm1 * norm2)
        # Normalize to 0-1 range (cosine similarity is -1 to 1)
        return (similarity + 1) / 2
    
    except Exception as e:
        print(f"Error calculating similarity: {e}")
        return 0.0


def semantic_search(query: str, articles: List[Dict]) -> List[Dict]:
    """
    Perform semantic search using embeddings.
    
    Args:
        query: Search query
        articles: List of articles to search
    
    Returns:
        List of articles with semantic relevance scores
    """
    if not client:
        print("OpenAI client not initialized. Cannot perform semantic search.")
        return []
    
    # Get query embedding
    query_embedding = get_embedding(query)
    if query_embedding is None:
        return []
    
    scored_articles = []
    
    for article in articles:
        # Combine title and summary for better semantic matching
        # Title is more important, so weight it more
        article_text = f"{article.get('title', '')} {article.get('title', '')} {article.get('summary', '')[:500]}"
        
        # Get article embedding
        article_embedding = get_embedding(article_text)
        if article_embedding is None:
            continue
        
        # Calculate semantic similarity
        similarity = cosine_similarity(query_embedding, article_embedding)
        
        # Filter by threshold
        if similarity >= SEARCH_SEMANTIC_THRESHOLD:
            article_copy = article.copy()
            # Convert to percentage for consistency with keyword search
            article_copy["relevance_score"] = similarity * 100
            article_copy["search_method"] = "semantic"
            scored_articles.append(article_copy)
    
    # Sort by similarity
    scored_articles.sort(key=lambda x: x["relevance_score"], reverse=True)
    
    return scored_articles


def simple_keyword_search(query: str, articles: List[Dict]) -> List[Dict]:
    """
    Perform simple keyword-based search without LLM.
    
    Args:
        query: Search query
        articles: List of articles to search
    
    Returns:
        List of matching articles with scores
    """
    query_lower = query.lower()
    keywords = query_lower.split()
    
    # Also check for exact phrase
    phrase = query_lower
    
    results = []
    
    for article in articles:
        title = article.get("title", "").lower()
        summary = article.get("summary", "").lower()
        source = article.get("source", "").lower()
        category = article.get("category", "").lower()
        
        searchable_text = f"{title} {summary} {source} {category}"
        
        # Calculate score
        score = 0.0
        
        # Exact phrase matching (highest priority)
        if phrase in title:
            score += 25.0
        elif phrase in summary:
            score += 15.0
        
        # Individual keyword matching
        for keyword in keywords:
            if keyword in title:
                score += 10.0
            if keyword in summary:
                score += 5.0
            if keyword in source:
                score += 2.0
            if keyword in category:
                score += 8.0
        
        if score > 0:
            article_copy = article.copy()
            article_copy["relevance_score"] = score
            article_copy["search_method"] = "keyword"
            results.append(article_copy)
    
    # Sort by score
    results.sort(key=lambda x: x["relevance_score"], reverse=True)
    
    return results


def hybrid_search(query: str, articles: List[Dict]) -> List[Dict]:
    """
    Combine semantic and keyword search for best results.
    
    Args:
        query: Search query
        articles: List of articles to search
    
    Returns:
        List of articles with combined relevance scores
    """
    # Get both types of results
    semantic_results = semantic_search(query, articles)
    keyword_results = simple_keyword_search(query, articles)
    
    # Create lookup dictionaries
    semantic_scores = {a.get("link", ""): a["relevance_score"] for a in semantic_results}
    keyword_scores = {a.get("link", ""): a["relevance_score"] for a in keyword_results}
    
    # Combine scores with weighting
    # Semantic: 70%, Keyword: 30%
    combined_results = {}
    all_links = set(semantic_scores.keys()) | set(keyword_scores.keys())
    articles_dict = {a.get("link", ""): a for a in articles}
    
    for link in all_links:
        if not link:
            continue
        
        semantic_score = semantic_scores.get(link, 0) * 0.7
        keyword_score = keyword_scores.get(link, 0) * 0.3
        combined_score = semantic_score + keyword_score
        
        if combined_score > 0:
            article = articles_dict.get(link, {}).copy()
            article["relevance_score"] = combined_score
            article["search_method"] = "hybrid"
            article["semantic_score"] = semantic_scores.get(link, 0)
            article["keyword_score"] = keyword_scores.get(link, 0)
            combined_results[link] = article
    
    # Sort by combined score
    results = sorted(combined_results.values(), key=lambda x: x["relevance_score"], reverse=True)
    
    return results


def search_articles(query: str, articles: List[Dict]) -> Dict:
    """
    Main search function that intelligently chooses search method.
    
    Args:
        query: Search query (can be keywords or natural language)
        articles: List of articles to search through
    
    Returns:
        Dictionary with search results and metadata
    """
    if not query or not articles:
        return {
            "query": query,
            "total_results": 0,
            "articles": [],
            "search_type": "none"
        }
    
    # Determine search strategy
    word_count = len(query.split())
    is_simple_query = word_count <= SEARCH_SIMPLE_QUERY_THRESHOLD
    
    # For very simple queries (1-3 words), keyword search is often better
    if is_simple_query:
        results = simple_keyword_search(query, articles)
        return {
            "query": query,
            "total_results": len(results[:SEARCH_MAX_RESULTS]),
            "articles": results[:SEARCH_MAX_RESULTS],
            "search_type": "keyword"
        }
    
    # For complex queries, use semantic or hybrid search
    if SEARCH_USE_HYBRID and client:
        results = hybrid_search(query, articles)
        return {
            "query": query,
            "total_results": len(results[:SEARCH_MAX_RESULTS]),
            "articles": results[:SEARCH_MAX_RESULTS],
            "search_type": "hybrid"
        }
    elif client:
        results = semantic_search(query, articles)
        return {
            "query": query,
            "total_results": len(results[:SEARCH_MAX_RESULTS]),
            "articles": results[:SEARCH_MAX_RESULTS],
            "search_type": "semantic"
        }
    else:
        # Fallback to keyword search if no client
        results = simple_keyword_search(query, articles)
        return {
            "query": query,
            "total_results": len(results[:SEARCH_MAX_RESULTS]),
            "articles": results[:SEARCH_MAX_RESULTS],
            "search_type": "keyword_fallback"
        }
