"""
Professional PDF Newsletter Generator
Creates a beautifully formatted newsletter with modern design elements
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, 
    Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from datetime import datetime
from io import BytesIO
from typing import Dict, List


def create_header_table(canvas, doc):
    """
    Create a professional header for each page
    """
    canvas.saveState()
    
    # Header background
    canvas.setFillColor(colors.HexColor('#1e3a8a'))  # Dark blue
    canvas.rect(0, letter[1] - 0.6*inch, letter[0], 0.6*inch, fill=1, stroke=0)
    
    # AI Scout title in header
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawString(0.75*inch, letter[1] - 0.4*inch, "AI SCOUT NEWSLETTER")
    
    # Page number on right
    canvas.setFont("Helvetica", 9)
    page_num = f"Page {doc.page}"
    canvas.drawRightString(letter[0] - 0.75*inch, letter[1] - 0.4*inch, page_num)
    
    canvas.restoreState()


def create_footer(canvas, doc):
    """
    Create a professional footer for each page
    """
    canvas.saveState()
    
    # Footer line
    canvas.setStrokeColor(colors.HexColor('#e5e7eb'))
    canvas.setLineWidth(0.5)
    canvas.line(0.75*inch, 0.6*inch, letter[0] - 0.75*inch, 0.6*inch)
    
    # Footer text
    canvas.setFillColor(colors.HexColor('#6b7280'))
    canvas.setFont("Helvetica", 8)
    footer_text = "Built with ❤️ by Pulkit Tyagi"
    canvas.drawCentredString(letter[0] / 2, 0.4*inch, footer_text)
    
    canvas.restoreState()


def on_page(canvas, doc):
    """
    Called for each page to add header and footer
    """
    create_header_table(canvas, doc)
    create_footer(canvas, doc)


def generate_newsletter_pdf(categorized_articles: Dict[str, List[Dict]]) -> BytesIO:
    """
    Generate a professionally designed PDF newsletter from categorized articles.
    
    Args:
        categorized_articles: Dictionary with categories as keys and lists of articles as values
    
    Returns:
        BytesIO object containing the PDF
    """
    buffer = BytesIO()
    
    # Create document with custom margins
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter,
        rightMargin=0.75*inch, 
        leftMargin=0.75*inch,
        topMargin=0.9*inch,  # Space for header
        bottomMargin=0.8*inch  # Space for footer
    )
    
    # Container for the 'Flowable' objects
    elements = []
    
    # Define custom styles
    styles = getSampleStyleSheet()
    
    # Main title style
    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Heading1'],
        fontSize=32,
        textColor=colors.HexColor('#1e3a8a'),  # Dark blue
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        leading=38
    )
    
    # Subtitle style
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=14,
        textColor=colors.HexColor('#3b82f6'),  # Blue
        spaceAfter=8,
        alignment=TA_CENTER,
        fontName='Helvetica-Oblique'
    )
    
    # Date style
    date_style = ParagraphStyle(
        'DateStyle',
        parent=styles['Normal'],
        fontSize=11,
        textColor=colors.HexColor('#6b7280'),  # Gray
        spaceAfter=24,
        alignment=TA_CENTER,
        fontName='Helvetica'
    )
    
    # Section header style (for Table of Contents, etc.)
    section_header_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#1e3a8a'),
        spaceAfter=12,
        spaceBefore=20,
        fontName='Helvetica-Bold',
        borderPadding=8,
        backColor=colors.HexColor('#eff6ff'),  # Light blue background
        leftIndent=10,
        rightIndent=10
    )
    
    # Category style
    category_style = ParagraphStyle(
        'CategoryStyle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.white,
        spaceAfter=14,
        spaceBefore=24,
        fontName='Helvetica-Bold',
        backColor=colors.HexColor('#2563eb'),  # Blue
        leftIndent=12,
        rightIndent=12,
        leading=20,
        borderPadding=6
    )
    
    # Article title style
    article_title_style = ParagraphStyle(
        'ArticleTitle',
        parent=styles['Heading3'],
        fontSize=11,
        textColor=colors.HexColor('#1e293b'),  # Dark slate
        spaceAfter=6,
        fontName='Helvetica-Bold',
        leading=14
    )
    
    # Article metadata style
    article_meta_style = ParagraphStyle(
        'ArticleMeta',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#64748b'),  # Slate gray
        spaceAfter=8,
        fontName='Helvetica',
        leading=11
    )
    
    # Article summary style
    article_summary_style = ParagraphStyle(
        'ArticleSummary',
        parent=styles['Normal'],
        fontSize=9.5,
        textColor=colors.HexColor('#334155'),  # Darker slate
        spaceAfter=18,
        fontName='Helvetica',
        leading=13,
        alignment=TA_JUSTIFY
    )
    
    # Statistics style
    stats_style = ParagraphStyle(
        'StatsStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#475569'),
        spaceAfter=6,
        fontName='Helvetica',
        leading=14
    )
    
    # ============ Cover Page ============
    
    # Newsletter title
    title = Paragraph("AI SCOUT", title_style)
    elements.append(title)
    
    # Subtitle
    subtitle = Paragraph("Your Weekly AI Intelligence Digest", subtitle_style)
    elements.append(subtitle)
    
    # Date and edition
    current_date = datetime.now().strftime("%B %d, %Y")
    week_number = datetime.now().strftime("%U")
    date_text = f"Week {week_number} • {current_date}"
    date_para = Paragraph(date_text, date_style)
    elements.append(date_para)
    
    elements.append(Spacer(1, 0.2*inch))
    
    # Decorative line
    elements.append(HRFlowable(
        width="100%",
        thickness=2,
        color=colors.HexColor('#3b82f6'),
        spaceAfter=24,
        spaceBefore=10
    ))
    
    # ============ Overview Section ============
    
    overview_header = Paragraph("📊 NEWSLETTER OVERVIEW", section_header_style)
    elements.append(overview_header)
    elements.append(Spacer(1, 0.1*inch))
    
    # Calculate statistics
    total_articles = sum(len(articles) for articles in categorized_articles.values())
    num_categories = sum(1 for articles in categorized_articles.values() if len(articles) > 0)
    
    # Get all sources
    all_sources = set()
    for articles in categorized_articles.values():
        for article in articles:
            all_sources.add(article.get('source', 'Unknown'))
    
    # Statistics table
    stats_data = [
        [Paragraph(f"<b>{total_articles}</b><br/><font size=8>Total Articles</font>", stats_style),
         Paragraph(f"<b>{num_categories}</b><br/><font size=8>Categories</font>", stats_style),
         Paragraph(f"<b>{len(all_sources)}</b><br/><font size=8>Sources</font>", stats_style)]
    ]
    
    stats_table = Table(stats_data, colWidths=[2*inch, 2*inch, 2*inch])
    stats_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0f9ff')),
        ('BOX', (0, 0), (-1, -1), 1.5, colors.HexColor('#3b82f6')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bfdbfe')),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    
    elements.append(stats_table)
    elements.append(Spacer(1, 0.2*inch))
    
    # ============ Table of Contents ============
    
    toc_header = Paragraph("📑 CATEGORIES IN THIS ISSUE", section_header_style)
    elements.append(toc_header)
    elements.append(Spacer(1, 0.1*inch))
    
    # Category list with counts
    toc_data = []
    for category, articles in categorized_articles.items():
        if articles:  # Only show non-empty categories
            toc_row = [
                Paragraph(f"• {category}", stats_style),
                Paragraph(f"<b>{len(articles)}</b> articles", stats_style)
            ]
            toc_data.append(toc_row)
    
    if toc_data:
        toc_table = Table(toc_data, colWidths=[4.5*inch, 1.5*inch])
        toc_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#fafafa')),
            ('ROWBACKGROUNDS', (0, 0), (-1, -1), [colors.white, colors.HexColor('#f8fafc')]),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ]))
        elements.append(toc_table)
    
    elements.append(Spacer(1, 0.3*inch))
    
    # Decorative line before articles
    elements.append(HRFlowable(
        width="100%",
        thickness=1,
        color=colors.HexColor('#e5e7eb'),
        spaceAfter=20,
        spaceBefore=10
    ))
    
    # ============ Articles by Category ============
    
    for category, articles in categorized_articles.items():
        if not articles:  # Skip empty categories
            continue
        
        # Category header with icon
        category_header = Paragraph(f"🔷 {category.upper()}", category_style)
        elements.append(category_header)
        
        # Add articles (limit to 8 per category for readability)
        for idx, article in enumerate(articles[:8]):
            article_elements = []
            
            # Article number and title
            title_text = article.get("title", "No Title")
            # Escape special characters
            title_text = title_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            article_link = article.get("link", "")
            
            # Make title clickable
            if article_link:
                title_para = Paragraph(
                    f'<b>{idx + 1}.</b> <link href="{article_link}" color="#2563eb">{title_text}</link>',
                    article_title_style
                )
            else:
                title_para = Paragraph(f'<b>{idx + 1}.</b> {title_text}', article_title_style)
            
            article_elements.append(title_para)
            
            # Article metadata
            source = article.get('source', 'Unknown')
            published = article.get('published_date', 'N/A')
            author = article.get('author', '')
            
            meta_parts = [f"📰 {source}", f"📅 {published}"]
            if author and author != 'Unknown':
                meta_parts.append(f"✍️ {author}")
            
            meta_text = " • ".join(meta_parts)
            meta_para = Paragraph(meta_text, article_meta_style)
            article_elements.append(meta_para)
            
            # Article summary
            summary = article.get('summary', 'No summary available')
            # Clean and truncate summary
            if len(summary) > 350:
                summary = summary[:350] + "..."
            # Escape special characters
            summary = summary.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            summary_para = Paragraph(summary, article_summary_style)
            article_elements.append(summary_para)
            
            # Add a light separator between articles
            if idx < len(articles[:8]) - 1:
                article_elements.append(HRFlowable(
                    width="100%",
                    thickness=0.5,
                    color=colors.HexColor('#e5e7eb'),
                    spaceAfter=12,
                    spaceBefore=6
                ))
            
            # Keep article together on same page
            elements.append(KeepTogether(article_elements))
        
        # Add more spacing between categories
        elements.append(Spacer(1, 0.25*inch))
    
    # ============ Closing Section ============
    
    elements.append(PageBreak())
    
    # Thank you message
    closing_title = Paragraph("Thank You for Reading!", title_style)
    elements.append(closing_title)
    elements.append(Spacer(1, 0.2*inch))
    
    closing_text = """
    <para alignment="center">
    Stay informed with the latest developments in AI and machine learning.<br/>
    This newsletter is automatically curated from trusted sources to bring you<br/>
    the most relevant AI news and research updates.
    </para>
    """
    closing_para = Paragraph(closing_text, subtitle_style)
    elements.append(closing_para)
    
    elements.append(Spacer(1, 0.3*inch))
    
    # Copyright and branding
    copyright_style = ParagraphStyle(
        'Copyright',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#6b7280'),
        alignment=TA_CENTER,
        fontName='Helvetica'
    )
    
    copyright_text = f"© {datetime.now().year} AI Scout • Built with ❤️ by Pulkit Tyagi"
    copyright_para = Paragraph(copyright_text, copyright_style)
    elements.append(copyright_para)
    
    # Build PDF with custom page template
    doc.build(elements, onFirstPage=on_page, onLaterPages=on_page)
    
    # Get the value of the BytesIO buffer
    pdf = buffer.getvalue()
    buffer.close()
    
    return pdf
