export function formatCsvDate(value: Date | null | undefined) {
  if (!value) return "";
  return new Intl.DateTimeFormat("pt-BR").format(value);
}

export function formatCsvDecimal(value: unknown) {
  return Number(value ?? 0).toFixed(2).replace(".", ",");
}

function escapeCsvCell(value: unknown) {
  const text = String(value ?? "");
  if (/[;"\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

export function buildCsv(rows: unknown[][]) {
  return `\uFEFF${rows
    .map((row) => row.map(escapeCsvCell).join(";"))
    .join("\r\n")}\r\n`;
}

export function csvResponse(csv: string, filename: string) {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
