"""
Search handler for natural language and keyword-based article search
"""

import json
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from openai import OpenAI
from config import (
    OPENAI_API_KEY,
    OPENAI_MODEL,
    OPENAI_TEMPERATURE,
    SEARCH_SIMPLE_QUERY_THRESHOLD,
    SEARCH_MAX_RESULTS,
    CATEGORIES
)


# Initialize OpenAI client
client = None
if OPENAI_API_KEY:
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
    except Exception as e:
        print(f"Warning: Failed to initialize OpenAI client: {e}")


def interpret_query_with_llm(query: str) -> Optional[Dict]:
    """
    Use OpenAI to interpret a natural language search query.
    
    Args:
        query: Natural language search query
    
    Returns:
        Dictionary with extracted search criteria or None if failed
    """
    if not client:
        print("OpenAI client not initialized. Falling back to keyword search.")
        return None
    
    system_prompt = """You are a search query analyzer for an AI news aggregator. 
Extract structured search criteria from natural language queries.

Available categories:
- LLMs & Foundation Models
- AI Tools & Platforms
- Open Source AI Projects
- AI Research & Papers
- AI Agents & Automation
- AI in Development
- Multimodal AI

Return a JSON object with:
{
    "keywords": ["keyword1", "keyword2"],  // Main search terms
    "categories": ["Category1", "Category2"],  // Relevant categories from the list above
    "date_filter": "recent|this_week|this_month|any",  // Time relevance
    "content_type": "research|tool|project|news|any"  // Type of content
}

Examples:
Query: "recent research papers on multimodal AI agents with code examples"
{
    "keywords": ["multimodal", "agents", "code", "research", "papers"],
    "categories": ["Multimodal AI", "AI Agents & Automation", "AI Research & Papers"],
    "date_filter": "recent",
    "content_type": "research"
}

Query: "GPT-4 and Claude performance comparison"
{
    "keywords": ["GPT-4", "Claude", "performance", "comparison"],
    "categories": ["LLMs & Foundation Models"],
    "date_filter": "any",
    "content_type": "any"
}"""

    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Query: {query}"}
            ],
            temperature=OPENAI_TEMPERATURE,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(response.choices[0].message.content)
        return result
    
    except Exception as e:
        print(f"Error interpreting query with LLM: {e}")
        return None


def calculate_relevance_score(article: Dict, criteria: Dict) -> float:
    """
    Calculate relevance score for an article based on search criteria.
    
    Args:
        article: Article dictionary
        criteria: Search criteria from LLM or keyword extraction
    
    Returns:
        Relevance score (higher is more relevant)
    """
    score = 0.0
    
    # Combine all searchable text
    title = article.get("title", "").lower()
    summary = article.get("summary", "").lower()
    source = article.get("source", "").lower()
    category = article.get("category", "").lower()
    
    searchable_text = f"{title} {summary} {source}"
    
    # Keyword matching (higher weight for title matches)
    keywords = criteria.get("keywords", [])
    for keyword in keywords:
        keyword_lower = keyword.lower()
        
        # Exact match in title (highest score)
        if keyword_lower in title:
            score += 10.0
        
        # Exact match in summary
        if keyword_lower in summary:
            score += 5.0
        
        # Match in source
        if keyword_lower in source:
            score += 2.0
    
    # Category matching
    target_categories = criteria.get("categories", [])
    article_category = article.get("category", "")
    if article_category in target_categories:
        score += 15.0
    
    # Date relevance
    date_filter = criteria.get("date_filter", "any")
    if date_filter != "any":
        try:
            article_date = datetime.strptime(article.get("published_date", ""), "%Y-%m-%d")
            now = datetime.now()
            
            if date_filter == "recent":
                # Last 7 days
                if (now - article_date).days <= 7:
                    score += 8.0
            elif date_filter == "this_week":
                # Last 7 days
                if (now - article_date).days <= 7:
                    score += 8.0
            elif date_filter == "this_month":
                # Last 30 days
                if (now - article_date).days <= 30:
                    score += 5.0
        except:
            pass
    
    # Content type matching
    content_type = criteria.get("content_type", "any")
    if content_type != "any":
        type_keywords = {
            "research": ["research", "paper", "arxiv", "study"],
            "tool": ["tool", "platform", "app", "service"],
            "project": ["project", "open source", "github", "library"],
            "news": ["announce", "launch", "release", "news"]
        }
        
        if content_type in type_keywords:
            for keyword in type_keywords[content_type]:
                if keyword in searchable_text:
                    score += 3.0
                    break
    
    return score


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
    
    results = []
    
    for article in articles:
        title = article.get("title", "").lower()
        summary = article.get("summary", "").lower()
        source = article.get("source", "").lower()
        category = article.get("category", "").lower()
        
        searchable_text = f"{title} {summary} {source} {category}"
        
        # Calculate simple score
        score = 0.0
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
            results.append(article_copy)
    
    # Sort by score
    results.sort(key=lambda x: x["relevance_score"], reverse=True)
    
    return results[:SEARCH_MAX_RESULTS]


def search_articles(query: str, articles: List[Dict]) -> Dict:
    """
    Main search function that handles both simple and natural language queries.
    
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
    
    # Determine if query is simple or complex
    word_count = len(query.split())
    is_simple_query = word_count <= SEARCH_SIMPLE_QUERY_THRESHOLD
    
    # For simple queries, use direct keyword search
    if is_simple_query:
        results = simple_keyword_search(query, articles)
        return {
            "query": query,
            "total_results": len(results),
            "articles": results,
            "search_type": "keyword"
        }
    
    # For complex queries, try LLM interpretation
    criteria = interpret_query_with_llm(query)
    
    # Fallback to keyword search if LLM fails
    if not criteria:
        results = simple_keyword_search(query, articles)
        return {
            "query": query,
            "total_results": len(results),
            "articles": results,
            "search_type": "keyword_fallback"
        }
    
    # Score and filter articles based on extracted criteria
    scored_articles = []
    for article in articles:
        score = calculate_relevance_score(article, criteria)
        
        if score > 0:
            article_copy = article.copy()
            article_copy["relevance_score"] = score
            scored_articles.append(article_copy)
    
    # Sort by relevance score, then by date
    scored_articles.sort(
        key=lambda x: (x["relevance_score"], x.get("published_date", "")),
        reverse=True
    )
    
    return {
        "query": query,
        "total_results": len(scored_articles[:SEARCH_MAX_RESULTS]),
        "articles": scored_articles[:SEARCH_MAX_RESULTS],
        "search_type": "natural_language",
        "extracted_criteria": criteria
    }

