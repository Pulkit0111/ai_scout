# AI Scout Application

AI Scout is a web-based application that aggregates the latest AI news and research from various RSS feeds and presents them in an organized, categorized format. Users can browse articles by category and download a PDF newsletter.

## Features

- 📰 **RSS Feed Aggregation**: Fetches latest articles from multiple AI-focused sources
- 🏷️ **Smart Categorization**: Automatically categorizes articles into 7 AI-focused categories
- 🎨 **Modern UI**: Clean, responsive interface built with Tailwind CSS
- 📄 **PDF Newsletter**: Generate and download a formatted PDF newsletter
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
│   ├── newsletter_pdf.py      # PDF newsletter generation
│   ├── config.py              # RSS feed URLs and config
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── index.html             # Main HTML file
│   └── app.js                 # JavaScript for API calls and interactions
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.8 or higher
- pip (Python package installer)

### Quick Start (Recommended)

The easiest way to run the application is using the provided startup script:

1. **Start the Application**:
```bash
./start_backend.sh
```

2. **Open your browser** and navigate to `http://localhost:8000`

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

4. Run the FastAPI server:
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
3. **Browse articles** by clicking on category tabs
4. **Refresh** to fetch the latest articles
5. **Download PDF** to generate and download a newsletter

**Note:** The backend now serves both the API and the frontend web interface. No separate frontend server is needed!

## API Endpoints

- `GET /` - Frontend web application (index.html)
- `GET /static/*` - Static files (JavaScript, CSS, etc.)
- `GET /api/feeds` - Get all feeds grouped by category
- `GET /api/feeds/{category}` - Get feeds for a specific category
- `GET /api/newsletter/pdf` - Generate and download newsletter as PDF
- `GET /api/categories` - Get list of available categories

## Configuration

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

