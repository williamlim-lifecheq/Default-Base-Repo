#!/usr/bin/env python3
"""
Generates the next monthly contractor invoice xlsx from the most recent
existing one in this folder, preserving its layout/formatting.

Usage:
    python3 generate_invoice.py                  # next calendar month after the latest invoice on file
    python3 generate_invoice.py --month 8 --year 2026
    python3 generate_invoice.py --fee 12000       # override the base consultation fee
    python3 generate_invoice.py --invoice-number LC010   # override auto-increment

Run it from inside the "Lifecheq Admin" folder (or pass --dir).
"""
import argparse
import calendar
import datetime
import re
import shutil
from pathlib import Path

import openpyxl

FILENAME_RE = re.compile(
    r"^Invoicing - Lim Kok Leong - (?P<month>[A-Za-z]+) (?P<year>\d{4})\.xlsx$"
)


def find_invoices(directory):
    invoices = []
    for path in directory.glob("Invoicing - Lim Kok Leong - *.xlsx"):
        m = FILENAME_RE.match(path.name)
        if not m:
            continue
        try:
            month_dt = datetime.datetime.strptime(m.group("month"), "%B")
        except ValueError:
            continue
        year = int(m.group("year"))
        invoices.append((year, month_dt.month, path))
    invoices.sort()
    return invoices


def next_invoice_number(current):
    m = re.match(r"^([A-Za-z]+)(\d+)$", current)
    if not m:
        raise ValueError(f"Can't parse invoice number '{current}'")
    prefix, digits = m.group(1), m.group(2)
    return f"{prefix}{int(digits) + 1:0{len(digits)}d}"


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dir", default=".", help="Folder containing the invoice files (default: current dir)")
    parser.add_argument("--month", type=int, help="Target month (1-12). Default: month after the latest invoice on file")
    parser.add_argument("--year", type=int, help="Target year. Default: inferred alongside --month")
    parser.add_argument("--invoice-date-day", type=int, default=15, help="Day of month for the invoice date (default: 15)")
    parser.add_argument("--fee", type=float, help="Override the base Consultation Services fee (default: reuse the last invoice's base fee)")
    parser.add_argument("--invoice-number", help="Override the auto-incremented invoice number")
    parser.add_argument("--dry-run", action="store_true", help="Print what would be generated without writing a file")
    args = parser.parse_args()

    directory = Path(args.dir).resolve()
    invoices = find_invoices(directory)
    if not invoices:
        raise SystemExit(f"No existing 'Invoicing - Lim Kok Leong - <Month> <Year>.xlsx' files found in {directory}")

    latest_year, latest_month, latest_path = invoices[-1]

    if args.month:
        target_month = args.month
        target_year = args.year or (latest_year if target_month > latest_month else latest_year + 1)
    else:
        if latest_month == 12:
            target_month, target_year = 1, latest_year + 1
        else:
            target_month, target_year = latest_month + 1, latest_year

    target_month_name = calendar.month_name[target_month]
    new_filename = f"Invoicing - Lim Kok Leong - {target_month_name} {target_year}.xlsx"
    new_path = directory / new_filename

    if new_path.exists():
        raise SystemExit(f"{new_filename} already exists — refusing to overwrite it.")

    wb = openpyxl.load_workbook(latest_path, data_only=False)
    ws = wb.active

    current_number = ws["B15"].value
    new_number = args.invoice_number or next_invoice_number(current_number)

    invoice_date = datetime.date(target_year, target_month, args.invoice_date_day)
    last_day = calendar.monthrange(target_year, target_month)[1]
    due_date = datetime.date(target_year, target_month, last_day)

    base_fee = args.fee if args.fee is not None else ws["B24"].value

    print(f"Latest invoice on file : {latest_path.name} (invoice {current_number})")
    print(f"Generating             : {new_filename}")
    print(f"  Invoice number       : {new_number}")
    print(f"  Invoice date         : {invoice_date.strftime('%d/%m/%Y')}")
    print(f"  Due date             : {due_date.strftime('%d/%m/%Y')}")
    print(f"  Base fee (B24)       : {base_fee}")

    if args.dry_run:
        print("Dry run — no file written.")
        return

    ws.title = f"{target_month_name[:3]} {str(target_year)[2:]}"
    ws["B15"] = new_number
    ws["B17"] = datetime.datetime(target_year, target_month, args.invoice_date_day)
    ws["B18"] = datetime.datetime(target_year, target_month, last_day)
    ws["A24"] = "Consultation Services"
    ws["B24"] = base_fee
    # Clear any leftover claim/expense lines from the source month so each
    # new invoice starts with just the base fee; add claims manually after.
    for row in (25, 26, 27):
        ws[f"A{row}"] = None
        ws[f"B{row}"] = None

    wb.save(new_path)
    print(f"Wrote {new_path}")


if __name__ == "__main__":
    main()
