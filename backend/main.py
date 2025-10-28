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
from newsletter_pdf import generate_newsletter_pdf
from search_handler import search_articles
from weekly_summary import generate_weekly_summary
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
            "newsletter_pdf": "/api/newsletter/pdf"
        }
    }


@app.get("/api/feeds")
async def get_feeds():
    """
    Get all feeds grouped by category
    """
    try:
        # Fetch all articles
        articles = fetch_all_feeds()
        
        # Categorize articles
        categorized = categorize_articles(articles)
        
        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "total_articles": len(articles),
            "categories": categorized
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


@app.get("/api/newsletter/pdf")
async def generate_newsletter():
    """
    Generate and download newsletter as PDF
    """
    try:
        # Fetch and categorize articles
        articles = fetch_all_feeds()
        categorized = categorize_articles(articles)
        
        # Generate PDF
        pdf_bytes = generate_newsletter_pdf(categorized)
        
        # Return PDF as response
        filename = f"AI_Scout_Newsletter_{datetime.now().strftime('%Y%m%d')}.pdf"
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={filename}"
            }
        )
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


@app.get("/api/weekly-summary")
async def get_weekly_summary():
    """
    Get weekly summary with statistics and highlights
    
    Returns:
        Dictionary with weekly statistics, highlights, and metadata
    """
    try:
        # Fetch and categorize all articles
        articles = fetch_all_feeds()
        categorized = categorize_articles(articles)
        
        # Generate weekly summary
        summary = generate_weekly_summary(categorized)
        
        return {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

