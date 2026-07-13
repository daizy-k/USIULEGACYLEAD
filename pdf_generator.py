from io import BytesIO

from reportlab.lib.pagesizes import LETTER
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def build_packet_pdf(packet: dict) -> BytesIO:
    """Renders a single handover packet dict into a formatted PDF and returns a buffer."""
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=LETTER,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "PacketTitle", parent=styles["Title"], fontSize=18, spaceAfter=4
    )
    meta_style = ParagraphStyle(
        "PacketMeta", parent=styles["Normal"], fontSize=9, textColor=colors.grey
    )
    section_style = ParagraphStyle(
        "SectionHeading", parent=styles["Heading2"], spaceBefore=14, spaceAfter=6
    )
    body_style = styles["BodyText"]

    club_name = packet.get("club_name", "Student Organization")
    role_title = packet.get("role_title", "Untitled Role")
    outgoing = packet.get("outgoing_officer", "N/A")
    incoming = packet.get("incoming_officer", "N/A")
    handover_date = packet.get("handover_date", "N/A")

    elements = [
        Paragraph(f"{club_name} — Leadership Handover Packet", title_style),
        Paragraph(f"Role: {role_title}", meta_style),
        Paragraph(
            f"Outgoing officer: {outgoing}  |  Incoming officer: {incoming}  |  Date: {handover_date}",
            meta_style,
        ),
        Spacer(1, 0.25 * inch),
    ]

    responsibilities = packet.get("responsibilities", [])
    if responsibilities:
        elements.append(Paragraph("Core Responsibilities", section_style))
        for item in responsibilities:
            elements.append(Paragraph(f"• {item}", body_style))

    ongoing_tasks = packet.get("ongoing_tasks", [])
    if ongoing_tasks:
        elements.append(Paragraph("Ongoing Tasks & Status", section_style))
        table_data = [["Task", "Status", "Notes"]]
        for task in ongoing_tasks:
            table_data.append(
                [
                    task.get("title", ""),
                    task.get("status", ""),
                    task.get("notes", ""),
                ]
            )
        table = Table(table_data, colWidths=[2.2 * inch, 1.2 * inch, 3 * inch])
        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B2545")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F7F7F7")]),
                ]
            )
        )
        elements.append(table)

    vendor_contacts = packet.get("vendor_contacts", [])
    if vendor_contacts:
        elements.append(Paragraph("Key Vendor Contacts", section_style))
        for contact in vendor_contacts:
            name = contact.get("name", "")
            phone = contact.get("phone", "")
            note = contact.get("note", "")
            elements.append(Paragraph(f"• {name} — {phone} ({note})", body_style))

    closing_notes = packet.get("closing_notes")
    if closing_notes:
        elements.append(Paragraph("Closing Notes", section_style))
        elements.append(Paragraph(closing_notes, body_style))

    doc.build(elements)
    buffer.seek(0)
    return buffer
