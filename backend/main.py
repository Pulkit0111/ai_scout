"""
FastAPI main application
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, FileResponse
from fastapi.staticfiles import StaticFiles
from datetime import datetime
import uvicorn
import os
from pathlib import Path

from feed_aggregator import fetch_all_feeds, get_articles_by_category
from categorizer import categorize_articles
from search_handler import search_articles
from content_overview import generate_content_overview
from config import CATEGORIES

app = FastAPI(
    title="AI Scout API",
    description="RSS feed aggregator for AI news and research",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get the path to the frontend directory
BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

# Mount static files for JavaScript
app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")


@app.get("/")
async def root():
    """Serve the frontend HTML"""
    index_path = FRONTEND_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return {
        "message": "Welcome to AI Scout API",
        "endpoints": {
            "feeds": "/api/feeds",
            "category_feeds": "/api/feeds/{category}",
            "search": "/api/search",
            "content_overview": "/api/content-overview"
        }
    }


@app.get("/api/feeds")
async def get_feeds(filters: str = None):
    """
    Get all feeds grouped by category
    
    Query Parameters:
        filters: Optional comma-separated filters (e.g., "24h,LLMs & Foundation Models")
                 Supports time filters (24h, 7d, 30d) and category names
    """
    try:
        # Fetch all articles
        articles = fetch_all_feeds()
        
        # Parse filters
        active_filters = []
        time_filter = None
        category_filters = []
        
        if filters:
            filter_list = [f.strip() for f in filters.split(',')]
            active_filters = filter_list
            
            for f in filter_list:
                if f == "24h":
                    time_filter = 1
                elif f == "7d":
                    time_filter = 7
                elif f == "30d":
                    time_filter = 30
                elif f in CATEGORIES:
                    category_filters.append(f)
        
        # Apply time filter if specified
        if time_filter:
            from content_overview import filter_articles_by_days
            articles = filter_articles_by_days(articles, days=time_filter)
        
        # Categorize articles
        categorized = categorize_articles(articles)
        
        # Apply category filter if specified
        if category_filters:
            filtered_categorized = {}
            for category in category_filters:
                if category in categorized:
                    filtered_categorized[category] = categorized[category]
            categorized = filtered_categorized
        
        # Calculate total articles after filtering
        total_filtered = sum(len(arts) for arts in categorized.values())
        
        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "total_articles": total_filtered,
            "categories": categorized,
            "filters_applied": active_filters
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/feeds/{category}")
async def get_category_feeds(category: str):
    """
    Get feeds for a specific category
    """
    try:
        # Validate category
        if category not in CATEGORIES:
            raise HTTPException(status_code=404, detail=f"Category '{category}' not found")
        
        # Fetch and categorize all articles
        articles = fetch_all_feeds()
        categorized = categorize_articles(articles)
        
        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "category": category,
            "articles": categorized.get(category, [])
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/categories")
async def get_categories():
    """
    Get list of available categories
    """
    return {
        "success": True,
        "categories": list(CATEGORIES.keys())
    }


@app.get("/api/search")
async def search(q: str = ""):
    """
    Search articles using natural language or keywords
    
    Query Parameters:
        q: Search query (can be keywords or natural language)
    
    Returns:
        Dictionary with search results and metadata
    """
    try:
        if not q or not q.strip():
            raise HTTPException(status_code=400, detail="Search query parameter 'q' is required")
        
        # Fetch and categorize all articles
        articles = fetch_all_feeds()
        categorized = categorize_articles(articles)
        
        # Flatten categorized articles into a single list
        all_articles = []
        for category_articles in categorized.values():
            all_articles.extend(category_articles)
        
        # Perform search
        search_results = search_articles(q.strip(), all_articles)
        
        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "query": search_results["query"],
            "search_type": search_results["search_type"],
            "total_results": search_results["total_results"],
            "articles": search_results["articles"],
            "extracted_criteria": search_results.get("extracted_criteria")
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/content-overview")
async def get_content_overview():
    """
    Get content overview with statistics and highlights
    
    Returns:
        Dictionary with content statistics, highlights, and metadata
    """
    try:
        # Fetch and categorize all articles
        articles = fetch_all_feeds()
        categorized = categorize_articles(articles)
        
        # Generate content overview
        summary = generate_content_overview(categorized)
        
        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

