from pathlib import Path
import json, shutil, html
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'downloads'/'Amy-Cybersecurity-Modules-1-4-English.pdf'
OUT.parent.mkdir(parents=True,exist_ok=True)
D=json.loads((ROOT/'content.json').read_text())
INK=HexColor('#102d36'); TEAL=HexColor('#176d69'); MUTED=HexColor('#536872'); PALE=HexColor('#edf2eb')
styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='Kicker2',fontName='Helvetica-Bold',fontSize=8,leading=11,textColor=TEAL,spaceAfter=10))
styles.add(ParagraphStyle(name='Title2',fontName='Helvetica-Bold',fontSize=27,leading=30,textColor=INK,spaceAfter=10))
styles.add(ParagraphStyle(name='Sub2',fontName='Helvetica',fontSize=10,leading=14,textColor=MUTED,spaceAfter=15))
styles.add(ParagraphStyle(name='H2x',fontName='Helvetica-Bold',fontSize=14,leading=18,textColor=INK,spaceBefore=13,spaceAfter=7))
styles.add(ParagraphStyle(name='Body2',fontName='Helvetica',fontSize=10.1,leading=14.6,textColor=INK,spaceAfter=7))
styles.add(ParagraphStyle(name='Small2',fontName='Helvetica',fontSize=8.4,leading=11.4,textColor=MUTED,spaceAfter=5))
styles.add(ParagraphStyle(name='Code2',fontName='Courier',fontSize=7.7,leading=11,textColor=TEAL))
def clean(s): return s.replace('–','-').replace('—','-').replace('’',"'").replace('→',' > ')
def p(s,style='Body2'): return Paragraph(html.escape(clean(s)),styles[style])
def box(title,body):
 t=Table([[p(title,'Kicker2')],[p(body,'Body2')]],colWidths=[504])
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),PALE),('LEFTPADDING',(0,0),(-1,-1),13),('RIGHTPADDING',(0,0),(-1,-1),13),('TOPPADDING',(0,0),(-1,0),10),('BOTTOMPADDING',(0,-1),(-1,-1),7)]))
 return t
def footer(canvas,doc):
 canvas.saveState();canvas.setStrokeColor(HexColor('#d8dfd9'));canvas.line(48,44,564,44)
 canvas.setFont('Helvetica',8);canvas.setFillColor(MUTED);canvas.drawString(48,30,'TimeMemo | Amy\'s Cybersecurity Notebook');canvas.drawRightString(564,30,f'{doc.page} / 2');canvas.restoreState()
story=[p('STUDY SHEET / MODULES 1-4','Kicker2'),p("Amy's Cybersecurity\nQuick Review".replace('\n',' '),'Title2'),p('Networking foundations. Read this first, then use the website for examples and detailed bilingual notes.','Sub2')]
story.append(box('BEFORE YOU START','Use Packet Tracer to add devices, connect links, inspect logical and physical views, and practice on a small simulated network.'))
def add_module(m):
 story.append(p(f"{m['number']:02d}  {m['title']['en']}",'H2x'))
 for b in m['summary']:
  story.append(Paragraph('&bull; '+html.escape(clean(b['en'])),styles['Body2']))
add_module(D['modules'][0]);add_module(D['modules'][1])
story.extend([Spacer(1,8),box('REMEMBER THE TWO ADDRESSES','IP identifies the destination across networks. MAC gets a frame to the next device on the current Ethernet link. For a remote destination, the first frame goes to your gateway MAC.')])
story.extend([PageBreak(),p('STUDY SHEET / ADDRESSING & CONFIGURATION','Kicker2'),p('Build it. Verify it.','Title2')])
add_module(D['modules'][2]);add_module(D['modules'][3])
story.append(p('Commands worth remembering','H2x'))
rows=[]
for c,description in D['commands']:
 if c in ['show ip interface brief','show ip route','show vlan brief','ping <address>','traceroute <address>','copy running-config startup-config']:
  rows.append([p(c,'Code2'),p(description['en'],'Small2')])
t=Table(rows,colWidths=[259,245],hAlign='LEFT')
t.setStyle(TableStyle([('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(-1,-1),HexColor('#f5f7f4')),('LINEBELOW',(0,0),(-1,-2),.4,HexColor('#d8dfd9')),('LEFTPADDING',(0,0),(-1,-1),9),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),3)]))
story.extend([t,Spacer(1,12),p('Troubleshooting order: link > interface state > IP/mask > VLAN > gateway > routes > end-to-end test. Check the return path, too.','Small2'),Paragraph('<b>Detailed notes:</b> <link href="https://timememo.net/amy-cybersecurity/" color="#176d69">timememo.net/amy-cybersecurity/</link>',styles['Small2']),p('Original study guide, reviewed October 27, 2026. Not an official Cisco publication. Use NetAcad for full lessons, videos, labs and assessments.','Small2')])
doc=SimpleDocTemplate(str(OUT),pagesize=letter,rightMargin=48,leftMargin=48,topMargin=39,bottomMargin=56,title="Amy's Cybersecurity - Modules 1-4 Quick Review",author='TimeMemo',subject='Concise English networking study guide')
doc.build(story,onFirstPage=footer,onLaterPages=footer)
reader=PdfReader(OUT)
assert len(reader.pages)==2, f'Expected 2 pages, got {len(reader.pages)}'
for page in reader.pages: assert len(page.extract_text())>500
(ROOT/'downloads').mkdir(exist_ok=True)
# The PDF already lives in the website downloads directory.
print(json.dumps({'pdf':str(OUT),'pages':len(reader.pages),'bytes':OUT.stat().st_size}))
