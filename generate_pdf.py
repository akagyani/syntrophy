import re
import os
from fpdf import FPDF

class SyntropyPDF(FPDF):
    def __init__(self):
        super().__init__()
        # Set margins
        self.set_left_margin(15)
        self.set_right_margin(15)
        self.set_top_margin(20)
        self.set_auto_page_break(auto=True, margin=20)
        
        # Register standard Windows fonts for a clean look
        self.add_font("Arial", "", r"C:\Windows\Fonts\arial.ttf")
        self.add_font("Arial", "B", r"C:\Windows\Fonts\arialbd.ttf")
        self.add_font("Arial", "I", r"C:\Windows\Fonts\ariali.ttf")
        self.add_font("Arial", "BI", r"C:\Windows\Fonts\arialbi.ttf")
        self.add_font("Consolas", "", r"C:\Windows\Fonts\consola.ttf")
        self.add_font("Consolas", "B", r"C:\Windows\Fonts\consolab.ttf")

    def header(self):
        if self.page_no() > 1:
            self.set_font("Arial", "I", 8)
            self.set_text_color(128, 128, 128)
            self.cell(100, 10, "Syntropy - Hackathon MVP Implementation Plan", border=0, new_x="RIGHT", new_y="LAST")
            self.cell(0, 10, f"Page {self.page_no()}", border=0, align="R", new_x="LMARGIN", new_y="NEXT")
            self.ln(2)
            self.set_draw_color(220, 220, 220)
            self.set_line_width(0.2)
            y = self.get_y()
            self.line(15, y, 195, y)
            self.ln(5)

    def footer(self):
        if self.page_no() > 1:
            self.set_y(-15)
            self.set_font("Arial", "I", 8)
            self.set_text_color(150, 150, 150)
            self.cell(0, 10, "Syntropy - Don't manage time. Execute it.", align="C")

def clean_text_for_pdf(text):
    # Map common emojis to text equivalents or safe symbols to prevent FPDF crashes
    replacements = {
        "🏆": "[Award] ",
        "✅": "[Completed] ",
        "🚀": "[Launch] ",
        "👉": "-> ",
        "🔥": "[Hot] ",
        "💡": "[Tip] ",
        "📌": "[Note] ",
        "⚠️": "[Warning] ",
        "❌": "[Error] ",
        "📋": "[Task] ",
        "🛠️": "[Tools] ",
        "🌟": "[Star] ",
        "🔗": "[Link] ",
        "🎯": "[Goal] ",
        "📈": "[Growth] ",
        "🛡️": "[Secure] ",
        "💰": "[Revenue] ",
        "📊": "[Metrics] ",
        "🚨": "[Alert] ",
        "🔑": "[Key] ",
        "📝": "[Doc] ",
        "💻": "[Code] ",
        "🎨": "[Design] ",
        "⏰": "[Time] ",
        "⚡": "[Fast] ",
        "❓": "[Question] ",
        "🧠": "[Brain] ",
        "✨": "[Wow] ",
        "📅": "[Calendar] ",
        "📧": "[Email] ",
        "👤": "[User] ",
        "🔒": "[Security] ",
    }
    
    for emoji, replacement in replacements.items():
        text = text.replace(emoji, replacement)
        
    # Strip any other emoji or non-latin1 characters
    cleaned = []
    for char in text:
        try:
            char.encode('latin-1')
            cleaned.append(char)
        except UnicodeEncodeError:
            pass
    return "".join(cleaned)

def parse_markdown(md_text):
    lines = md_text.splitlines()
    blocks = []
    
    current_block_type = None
    current_block_content = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Code block
        if line.strip().startswith('```'):
            if current_block_type == 'code':
                # End of code block
                blocks.append(('code', '\n'.join(current_block_content)))
                current_block_type = None
                current_block_content = []
            else:
                # Flush previous block
                if current_block_content:
                    blocks.append((current_block_type or 'paragraph', '\n'.join(current_block_content)))
                current_block_type = 'code'
                current_block_content = []
            i += 1
            continue
            
        if current_block_type == 'code':
            current_block_content.append(line)
            i += 1
            continue
            
        # Horizontal rule
        if line.strip() in ('---', '***', '___'):
            if current_block_content:
                blocks.append((current_block_type or 'paragraph', '\n'.join(current_block_content)))
                current_block_content = []
                current_block_type = None
            blocks.append(('hr', ''))
            i += 1
            continue
            
        # Headings
        m = re.match(r'^(#{1,6})\s+(.*)$', line)
        if m:
            if current_block_content:
                blocks.append((current_block_type or 'paragraph', '\n'.join(current_block_content)))
                current_block_content = []
                current_block_type = None
            level = len(m.group(1))
            blocks.append((f'h{level}', m.group(2)))
            i += 1
            continue
            
        # Blockquote / Alert
        if line.strip().startswith('>'):
            if current_block_type != 'blockquote':
                if current_block_content:
                    blocks.append((current_block_type or 'paragraph', '\n'.join(current_block_content)))
                current_block_type = 'blockquote'
                current_block_content = []
            # Strip the leading '>'
            content = re.sub(r'^>\s?', '', line)
            current_block_content.append(content)
            i += 1
            continue
            
        # List items
        m_list = re.match(r'^(\s*)([-\*\+]|\d+\.)\s+(.*)$', line)
        if m_list:
            if current_block_content:
                blocks.append((current_block_type or 'paragraph', '\n'.join(current_block_content)))
                current_block_content = []
                current_block_type = None
            
            indent = len(m_list.group(1))
            marker = m_list.group(2)
            content = m_list.group(3)
            
            blocks.append(('list_item', (indent, marker, content)))
            i += 1
            continue
            
        # Paragraph
        if line.strip() == '':
            if current_block_content:
                blocks.append((current_block_type or 'paragraph', '\n'.join(current_block_content)))
                current_block_content = []
                current_block_type = None
        else:
            if current_block_type is None:
                current_block_type = 'paragraph'
            current_block_content.append(line)
            
        i += 1
        
    if current_block_content:
        blocks.append((current_block_type or 'paragraph', '\n'.join(current_block_content)))
        
    return blocks

def generate_pdf(md_filepath, pdf_filepath):
    with open(md_filepath, 'r', encoding='utf-8') as f:
        md_text = f.read()
        
    blocks = parse_markdown(md_text)
    
    pdf = SyntropyPDF()
    
    # ------------------ COVER PAGE ------------------
    pdf.add_page()
    
    # Dark background
    pdf.set_fill_color(10, 10, 10)
    pdf.rect(0, 0, 210, 297, "F")
    
    # Purple bar highlight
    pdf.set_fill_color(139, 92, 246)
    pdf.rect(15, 40, 5, 220, "F")
    
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Arial", "B", 36)
    pdf.set_xy(30, 80)
    pdf.cell(0, 15, "SYNTROPY", border=0, new_x="LMARGIN", new_y="NEXT")
    
    pdf.set_font("Arial", "", 18)
    pdf.set_text_color(6, 182, 212) # Cyan
    pdf.set_x(30)
    pdf.cell(0, 10, "Don't manage time. Execute it.", border=0, new_x="LMARGIN", new_y="NEXT")
    
    pdf.ln(30)
    pdf.set_text_color(220, 220, 220)
    pdf.set_font("Arial", "B", 16)
    pdf.set_x(30)
    pdf.cell(0, 10, "HACKATHON MVP IMPLEMENTATION PLAN", border=0, new_x="LMARGIN", new_y="NEXT")
    
    pdf.ln(50)
    pdf.set_font("Arial", "", 11)
    pdf.set_text_color(150, 150, 150)
    pdf.set_x(30)
    pdf.cell(0, 6, "Created for: VibeCode 2.0 Hackathon", border=0, new_x="LMARGIN", new_y="NEXT")
    pdf.set_x(30)
    pdf.cell(0, 6, "Platform: Next.js + Google Gemini 1.5 Pro + GCP", border=0, new_x="LMARGIN", new_y="NEXT")
    pdf.set_x(30)
    pdf.cell(0, 6, "Generated: 2026-06-30", border=0, new_x="LMARGIN", new_y="NEXT")
    
    # ------------------ CONTENT PAGES ------------------
    pdf.add_page()
    pdf.set_text_color(30, 30, 30)
    
    for block_type, content in blocks:
        if block_type == 'h1':
            pdf.ln(8)
            pdf.set_font("Arial", "B", 18)
            pdf.set_text_color(139, 92, 246) # Violet
            cleaned = clean_text_for_pdf(content)
            pdf.cell(0, 10, cleaned, border=0, new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)
            pdf.set_draw_color(139, 92, 246)
            pdf.set_line_width(0.5)
            y = pdf.get_y()
            pdf.line(15, y, 195, y)
            pdf.ln(4)
            
        elif block_type == 'h2':
            pdf.ln(5)
            pdf.set_font("Arial", "B", 14)
            pdf.set_text_color(6, 182, 212) # Cyan
            cleaned = clean_text_for_pdf(content)
            pdf.cell(0, 8, cleaned, border=0, new_x="LMARGIN", new_y="NEXT")
            pdf.ln(2)
            
        elif block_type == 'h3':
            pdf.ln(4)
            pdf.set_font("Arial", "B", 11)
            pdf.set_text_color(50, 50, 50)
            cleaned = clean_text_for_pdf(content)
            pdf.cell(0, 6, cleaned, border=0, new_x="LMARGIN", new_y="NEXT")
            pdf.ln(1)
            
        elif block_type == 'h4':
            pdf.ln(3)
            pdf.set_font("Arial", "B", 9.5)
            pdf.set_text_color(80, 80, 80)
            cleaned = clean_text_for_pdf(content)
            pdf.cell(0, 6, cleaned, border=0, new_x="LMARGIN", new_y="NEXT")
            pdf.ln(1)
            
        elif block_type == 'paragraph':
            pdf.set_font("Arial", "", 10)
            pdf.set_text_color(30, 30, 30)
            cleaned = clean_text_for_pdf(content)
            # Normalize whitespace/newlines inside paragraph text
            cleaned_normalized = " ".join(cleaned.split())
            pdf.multi_cell(0, 5, cleaned_normalized, markdown=True)
            pdf.ln(3)
            
        elif block_type == 'blockquote':
            combined_content = '\n'.join(content).strip()
            
            # Detect Github-style alerts
            alert_type = "NOTE"
            alert_color = (240, 246, 252) # Light blue
            border_color = (88, 166, 255) # Blue border
            text_color = (30, 30, 30)
            
            m_alert = re.match(r'^\[!(IMPORTANT|NOTE|WARNING|CAUTION|TIP)\]\s*(.*)$', combined_content, re.DOTALL)
            if m_alert:
                alert_type = m_alert.group(1)
                combined_content = m_alert.group(2).strip()
                
                if alert_type == "IMPORTANT":
                    alert_color = (255, 248, 242) # Light orange/yellow
                    border_color = (217, 119, 6) # Orange border
                elif alert_type == "WARNING":
                    alert_color = (255, 245, 245) # Light red
                    border_color = (239, 68, 68) # Red border
                elif alert_type == "CAUTION":
                    alert_color = (254, 242, 242) # Deeper light red
                    border_color = (220, 38, 38)
                elif alert_type == "TIP":
                    alert_color = (240, 253, 244) # Light green
                    border_color = (34, 197, 94)
            
            cleaned_content = clean_text_for_pdf(combined_content)
            # Remove any line breaks and convert to markdown string
            cleaned_content = " ".join(cleaned_content.split())
            
            pdf.set_font("Arial", "", 9.5)
            # Dry run to calculate heights
            # Alert header height
            header_text = f"**{alert_type}**"
            h_header = pdf.multi_cell(170, 5, header_text, markdown=True, dry_run=True, output="HEIGHT")
            h_body = pdf.multi_cell(170, 5, cleaned_content, markdown=True, dry_run=True, output="HEIGHT")
            
            total_height = h_header + h_body + 10 # Padding
            
            # Check page break
            if pdf.get_y() + total_height > (pdf.page_break_trigger - 10):
                pdf.add_page()
                
            x = pdf.get_x()
            y = pdf.get_y()
            
            # Draw background box
            pdf.set_fill_color(*alert_color)
            pdf.rect(x, y, 180, total_height, "F")
            
            # Draw thick left border line
            pdf.set_draw_color(*border_color)
            pdf.set_line_width(1.0)
            pdf.line(x, y, x, y + total_height)
            
            # Draw text inside box
            pdf.set_xy(x + 5, y + 4)
            pdf.set_text_color(*text_color)
            pdf.set_font("Arial", "", 9.5)
            pdf.multi_cell(170, 5, header_text, markdown=True)
            
            pdf.set_x(x + 5)
            pdf.multi_cell(170, 5, cleaned_content, markdown=True)
            
            pdf.set_y(y + total_height + 4)
            
        elif block_type == 'code':
            cleaned_code = clean_text_for_pdf(content)
            
            pdf.set_font("Consolas", "", 8.5)
            # Calculate heights for code
            # Note: code is written line by line or as a single block
            h_code = pdf.multi_cell(172, 4, cleaned_code, dry_run=True, output="HEIGHT")
            total_height = h_code + 8
            
            # Check page break
            if pdf.get_y() + total_height > (pdf.page_break_trigger - 10):
                pdf.add_page()
                
            x = pdf.get_x()
            y = pdf.get_y()
            
            # Draw box background & border
            pdf.set_fill_color(248, 250, 252) # Slate 50
            pdf.set_draw_color(226, 232, 240) # Slate 200
            pdf.set_line_width(0.2)
            pdf.rect(x, y, 180, total_height, "DF")
            
            # Draw code content
            pdf.set_xy(x + 4, y + 4)
            pdf.set_text_color(51, 65, 85) # Slate 700
            pdf.multi_cell(172, 4, cleaned_code)
            
            pdf.set_y(y + total_height + 4)
            
        elif block_type == 'list_item':
            indent, marker, text_content = content
            cleaned_text = clean_text_for_pdf(text_content)
            
            x_offset = 15 + (indent + 1) * 5
            pdf.set_font("Arial", "", 10)
            pdf.set_text_color(30, 30, 30)
            
            # Identify checkbox list
            bullet = "\u2022"
            if marker in ('-', '*', '+'):
                m_check = re.match(r'^\[([ xX/])\]\s*(.*)$', cleaned_text)
                if m_check:
                    state = m_check.group(1)
                    rest = m_check.group(2)
                    bullet = "[ ]" if state == ' ' else "[In Progress]" if state == '/' else "[Completed]"
                    cleaned_text = rest
            else:
                bullet = marker
                
            # Clean list item text
            cleaned_text = " ".join(cleaned_text.split())
            
            # Check page break
            h_item = pdf.multi_cell(180 - x_offset - 10, 5, cleaned_text, markdown=True, dry_run=True, output="HEIGHT")
            if pdf.get_y() + h_item > (pdf.page_break_trigger - 10):
                pdf.add_page()
                
            # Draw bullet / marker
            pdf.set_x(x_offset)
            pdf.set_font("Arial", "B", 10)
            pdf.cell(10, 5, bullet, border=0, new_x="RIGHT", new_y="LAST")
            
            # Draw text
            pdf.set_font("Arial", "", 10)
            pdf.multi_cell(180 - x_offset - 10, 5, cleaned_text, markdown=True)
            pdf.ln(1)
            
        elif block_type == 'hr':
            pdf.ln(3)
            pdf.set_draw_color(226, 232, 240)
            pdf.set_line_width(0.2)
            y = pdf.get_y()
            pdf.line(15, y, 195, y)
            pdf.ln(4)
            
    # Save the output
    os.makedirs(os.path.dirname(pdf_filepath), exist_ok=True)
    pdf.output(pdf_filepath)
    print(f"PDF generated successfully at {pdf_filepath}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) > 2:
        md_file = sys.argv[1]
        pdf_file = sys.argv[2]
    else:
        md_file = r"C:\Users\KIIT\.gemini\antigravity\brain\caf9ec0f-3439-407a-a204-5c83e0e0741f\implementation_plan.md"
        pdf_file = r"c:\Users\KIIT\OneDrive\Documents\codingnijas\syntropy_implementation_plan.pdf"
    generate_pdf(md_file, pdf_file)
