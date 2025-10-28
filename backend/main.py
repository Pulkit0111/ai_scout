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


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

