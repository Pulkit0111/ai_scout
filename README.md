# AI Scout Application

AI Scout is a web-based application that aggregates the latest AI news and research from various RSS feeds and presents them in an organized, categorized format. Users can browse articles by category and download a PDF newsletter.

## Features

- 📰 **RSS Feed Aggregation**: Fetches up to 50 articles per source for comprehensive historical coverage
- 🏷️ **Smart Categorization**: Automatically categorizes articles into 7 AI-focused categories
- 🔍 **Natural Language Search**: Search articles using keywords or natural language queries powered by OpenAI
- 🏷️ **Multi-Filter System**: Combine category and time filters (Last 24 Hours, Last 7 Days) with tag-style UI
- 📊 **Weekly Summary Dashboard**: Dedicated tab with statistics, category breakdown, top sources, and highlights from the past 7 days
- 📑 **Tab Navigation**: Switch between Articles view and Weekly Summary view
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- 📄 **Professional PDF Newsletter**: Generate beautifully formatted PDF newsletters with branding
- 🔄 **Real-time Updates**: Refresh feeds to get the latest articles

## Categories

1. **LLMs & Foundation Models** - GPT, Claude, Gemini, Llama, etc.
2. **AI Tools & Platforms** - ChatGPT, Midjourney, GitHub Copilot, etc.
3. **Open Source AI Projects** - Hugging Face models, libraries, frameworks
4. **AI Research & Papers** - Latest research from arXiv, papers with code
5. **AI Agents & Automation** - AutoGPT, LangChain, agent frameworks
6. **AI in Development** - Coding assistants, IDEs, DevOps tools
7. **Multimodal AI** - Text-to-image, text-to-video, audio AI

## Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **feedparser**: RSS feed parsing
- **reportlab**: PDF generation
- **OpenAI API**: Natural language query interpretation
- **Python 3.8+**

### Frontend
- **HTML/CSS/JavaScript**: Vanilla JavaScript (no frameworks)
- **Tailwind CSS**: Utility-first CSS framework (via CDN)
- **Font Awesome**: Icon library

#### Why Plain HTML Instead of a Framework?

I have intentionally chosen plain HTML and vanilla JavaScript over modern frontend frameworks (React, Vue, Angular) to keep the initial implementation simple and straightforward. This approach offers several benefits:

- **Simplicity**: No build process, no complex tooling, no dependency management
- **Learning**: Easy to understand for developers new to web development
- **Quick Setup**: Get started in seconds without npm, webpack, or bundlers
- **Low Overhead**: Minimal code and fast initial load times

**Future Plans**: As the application grows and requires more complex features (such as real-time updates, advanced filtering, user authentication, or state management), we plan to migrate to a modern frontend framework like React or Vue.js. For now, vanilla JavaScript serves our needs perfectly while keeping the codebase accessible and maintainable.

## Project Structure

```
ai_scout/
├── backend/
│   ├── main.py                # FastAPI app and API routes
│   ├── feed_aggregator.py     # RSS feed fetching logic
│   ├── categorizer.py         # Article categorization
│   ├── newsletter_pdf.py      # Professional PDF newsletter generation
│   ├── weekly_summary.py      # Weekly summary statistics and filtering
│   ├── search_handler.py      # Natural language search logic
│   ├── config.py              # RSS feed URLs and config
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── index.html             # Main HTML file with weekly summary UI
│   └── app.js                 # JavaScript for API calls and interactions
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)
- OpenAI API key (required for natural language search)

### Quick Start (Recommended)

The easiest way to run the application is using the provided startup script:

1. **Set up your OpenAI API key**:
```bash
# Create a .env file in the project root
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

2. **Start the Application**:
```bash
./start_backend.sh
```

3. **Open your browser** and navigate to `http://localhost:8000`

That's it! The backend serves both the API and the frontend at the same port.

### Manual Setup

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Create a .env file in the backend directory or project root
echo "OPENAI_API_KEY=your_api_key_here" > .env
```

5. Run the FastAPI server:
```bash
python main.py
```

The backend API will be available at `http://localhost:8000`

You can view the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Usage

1. **Start the server** using `./start_backend.sh`
2. **Open your browser** to `http://localhost:8000`

### Articles Tab (Default View)
3. **Apply Filters**: Click on category tags (LLMs, AI Tools, etc.) and time filters (Last 24 Hours, Last 7 Days)
   - Multiple filters can be active at once (combined with AND logic)
   - Active filters show with a checkmark and blue/green background
   - Click "Clear All" to reset filters
4. **Search articles** using the search bar:
   - Simple keyword search: "GPT-4", "transformers"
   - Natural language: "recent research papers on multimodal AI agents"
   - Complex queries: "open source tools for LLM development from last week"
5. **Browse articles** in the filtered grid view

### Weekly Summary Tab
6. **Click "Weekly Summary" tab** to view 7-day statistics:
   - Total articles, categories, and sources
   - Category breakdown with article counts
   - Top contributing sources
   - Featured highlights with full details

### Other Features
7. **Refresh** to fetch the latest articles (up to 50 per source)
8. **Download PDF** to generate a professionally formatted newsletter

**Note:** The backend serves both the API and the frontend web interface. No separate frontend server is needed!

## API Endpoints

- `GET /` - Frontend web application (index.html)
- `GET /static/*` - Static files (JavaScript, CSS, etc.)
- `GET /api/feeds` - Get all feeds grouped by category
- `GET /api/feeds?filters=24h,LLMs & Foundation Models` - Get feeds with multiple filters (comma-separated)
  - Supports time filters: `24h`, `7d`
  - Supports category filters: Any category name from the categories list
  - Filters are combined with AND logic
- `GET /api/feeds/{category}` - Get feeds for a specific category
- `GET /api/weekly-summary` - Get weekly summary with statistics and highlights (7-day data)
- `GET /api/search?q={query}` - Search articles using keywords or natural language
- `GET /api/newsletter/pdf` - Generate and download newsletter as PDF
- `GET /api/categories` - Get list of available categories

## Configuration

### OpenAI API Key Setup

The search feature requires an OpenAI API key for natural language query interpretation:

1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a `.env` file in the project root or backend directory
3. Add your key:
```
OPENAI_API_KEY=sk-your-api-key-here
```

**Note:** The search feature will fallback to simple keyword matching if no API key is provided, but natural language queries won't work.

### Search Feature Details

The search functionality supports two modes:

1. **Keyword Search** (for simple queries with 1-3 words):
   - Direct text matching across title, summary, source, and category
   - Fast and doesn't require OpenAI API

2. **Natural Language Search** (for complex queries):
   - Uses OpenAI GPT-4o-mini to interpret user intent
   - Extracts keywords, relevant categories, date filters, and content types
   - Intelligent relevance scoring and ranking
   - Examples:
     - "recent research papers on multimodal AI agents with code examples"
     - "open source tools for LLM development from this week"
     - "GPT-4 and Claude performance comparison studies"

### Adding/Modifying RSS Feeds

Edit `backend/config.py` to add or modify RSS feed sources:

```python
RSS_FEEDS = {
    "source_name": "https://example.com/rss",
    # Add more feeds here
}
```

### Customizing Categories

Edit the `CATEGORIES` dictionary in `backend/config.py` to add or modify categories and their associated keywords:

```python
CATEGORIES = {
    "Category Name": [
        "keyword1", "keyword2", "keyword3"
    ],
    # Add more categories here
}
```

## RSS Feed Sources

The application aggregates news from the following sources:

- Hugging Face Blog
- OpenAI Blog
- Google AI Blog
- The Batch (DeepLearning.AI)

You can add more sources in `backend/config.py`.

## Troubleshooting

### Port Already in Use
If you see "Address already in use" error:
1. Stop any running instances: `pkill -f "python.*main.py"`
2. Or use a different port by modifying `main.py` (change port in uvicorn.run)
3. Wait a few seconds and try again

### No Articles Showing
If no articles are displayed:
1. Check that the backend is running
2. Verify RSS feed URLs are accessible
3. Check the browser console for errors
4. Try clicking the "Refresh" button

### Search Not Working
If search is not returning results:
1. Ensure your OpenAI API key is correctly set in the `.env` file
2. Check that you have API credits available
3. Simple keyword search will work without an API key
4. Check backend logs for OpenAI API errors
5. Verify the search query is not empty

### PDF Generation Issues
If PDF download fails:
1. Ensure `reportlab` is installed
2. Check backend logs for errors
3. Verify the `/api/newsletter/pdf` endpoint is accessible

## Development

To contribute or modify the application:

1. **Backend changes**: Edit files in the `backend/` directory
2. **Frontend changes**: Edit `frontend/index.html` or `frontend/app.js`
3. **Styling**: Modify Tailwind classes in the HTML or add custom CSS

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please open an issue on the project repository.

---

Built with ❤️ for the AI community

