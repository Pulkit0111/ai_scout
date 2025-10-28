"""
PDF Newsletter Generator
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from datetime import datetime
from io import BytesIO
from typing import Dict, List


def generate_newsletter_pdf(categorized_articles: Dict[str, List[Dict]]) -> BytesIO:
    """
    Generate a PDF newsletter from categorized articles.
    
    Args:
        categorized_articles: Dictionary with categories as keys and lists of articles as values
    
    Returns:
        BytesIO object containing the PDF
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter,
                           rightMargin=72, leftMargin=72,
                           topMargin=72, bottomMargin=18)
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor='#1a1a1a',
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    date_style = ParagraphStyle(
        'DateStyle',
        parent=styles['Normal'],
        fontSize=12,
        textColor='#666666',
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica'
    )
    
    category_style = ParagraphStyle(
        'CategoryStyle',
        parent=styles['Heading2'],
        fontSize=16,
        textColor='#2563eb',
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )
    
    article_title_style = ParagraphStyle(
        'ArticleTitle',
        parent=styles['Heading3'],
        fontSize=12,
        textColor='#1a1a1a',
        spaceAfter=6,
        fontName='Helvetica-Bold'
    )
    
    article_meta_style = ParagraphStyle(
        'ArticleMeta',
        parent=styles['Normal'],
        fontSize=9,
        textColor='#666666',
        spaceAfter=6,
        fontName='Helvetica'
    )
    
    article_summary_style = ParagraphStyle(
        'ArticleSummary',
        parent=styles['Normal'],
        fontSize=10,
        textColor='#333333',
        spaceAfter=15,
        fontName='Helvetica'
    )
    
    # Add newsletter title
    title = Paragraph("AI Scout Newsletter", title_style)
    elements.append(title)
    
    # Add date
    current_date = datetime.now().strftime("%B %d, %Y")
    date = Paragraph(f"Generated on {current_date}", date_style)
    elements.append(date)
    elements.append(Spacer(1, 0.2*inch))
    
    # Add articles by category
    for category, articles in categorized_articles.items():
        if not articles:  # Skip empty categories
            continue
        
        # Add category header
        category_header = Paragraph(category, category_style)
        elements.append(category_header)
        elements.append(Spacer(1, 0.1*inch))
        
        # Add articles
        for article in articles[:5]:  # Limit to 5 articles per category for PDF
            # Article title (make it clickable)
            article_title = f'<link href="{article.get("link", "")}">{article.get("title", "No Title")}</link>'
            title_para = Paragraph(article_title, article_title_style)
            elements.append(title_para)
            
            # Article metadata (source and date)
            meta_text = f"Source: {article.get('source', 'Unknown')} | Published: {article.get('published_date', 'N/A')}"
            meta_para = Paragraph(meta_text, article_meta_style)
            elements.append(meta_para)
            
            # Article summary (truncate if too long)
            summary = article.get('summary', 'No summary available')
            if len(summary) > 300:
                summary = summary[:300] + "..."
            # Clean HTML tags from summary
            summary = summary.replace('<', '&lt;').replace('>', '&gt;')
            summary_para = Paragraph(summary, article_summary_style)
            elements.append(summary_para)
            
            elements.append(Spacer(1, 0.15*inch))
        
        elements.append(Spacer(1, 0.2*inch))
    
    # Build PDF
    doc.build(elements)
    
    # Get the value of the BytesIO buffer
    pdf = buffer.getvalue()
    buffer.close()
    
    return pdf

