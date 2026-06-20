import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { ReportSnapshot } from "../domain/value-objects/reportData.ts";

/*
 exporta el reporte en pdf, csv y excel
 los tres reciben la misma foto de datos (ReportSnapshot)
*/

const BRAND: [number, number, number] = [34, 139, 64];   // verde GeoPS
const INK:   [number, number, number] = [24, 28, 26];

const stamp = () => new Date().toLocaleString("es-PE", {
    day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
});

const fileStamp = () => new Date().toISOString().slice(0, 10);

/* descarga un Blob con el nombre dado */
function download(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/* pdf */
export function exportReportPDF(report: ReportSnapshot) {
    const { meta, kpis, funnel, topCampaigns, hourly } = report;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();
    const M = 40;

    /* encabezado de marca */
    doc.setFillColor(...BRAND);
    doc.rect(0, 0, W, 70, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("GeoPS · Reporte de analíticas", M, 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`${meta.businessName}  ·  ${meta.period}`, M, 54);

    doc.setTextColor(...INK);
    doc.setFontSize(9);
    doc.text(`Generado el ${stamp()}`, M, 90);

    /* KPIs */
    autoTable(doc, {
        startY: 105,
        head: [["Métrica", "Valor", "Variación"]],
        body: kpis.map(k => [k.label, k.value, k.delta]),
        theme: "grid",
        headStyles: { fillColor: BRAND, textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 6 },
        margin: { left: M, right: M },
    });

    /* Funnel */
    autoTable(doc, {
        head: [["Embudo de conversión", "Usuarios", "%"]],
        body: funnel.map(f => [f.label, f.value.toLocaleString("es-PE"), `${f.pct}%`]),
        theme: "grid",
        headStyles: { fillColor: INK, textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 6 },
        margin: { left: M, right: M },
    });

    /* top campanas */
    autoTable(doc, {
        head: [["Top campañas activas", "Vistas", "Conversión", "Stock"]],
        body: topCampaigns.map(c => [c.name, c.views.toLocaleString("es-PE"), c.rate, c.stock]),
        theme: "grid",
        headStyles: { fillColor: BRAND, textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 6 },
        margin: { left: M, right: M },
    });

    /* Rendimiento por hora */
    autoTable(doc, {
        head: [["Hora", "Reservados", "Redimidos"]],
        body: hourly.map(h => [h.hour, String(h.reserved), String(h.redeemed)]),
        theme: "striped",
        headStyles: { fillColor: INK, textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 9, cellPadding: 4 },
        margin: { left: M, right: M },
    });

    /* pie de pagina */
    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`GeoPS · ${meta.businessName}`, M, doc.internal.pageSize.getHeight() - 20);
        doc.text(`Página ${i} de ${pages}`, W - M, doc.internal.pageSize.getHeight() - 20, { align: "right" });
    }

    doc.save(`GeoPS-reporte-${fileStamp()}.pdf`);
}

/* csv */
export function exportReportCSV(report: ReportSnapshot) {
    const { meta, kpis, funnel, topCampaigns, hourly } = report;
    const esc = (v: string | number) => {
        const s = String(v);
        return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows: (string | number)[][] = [];

    rows.push(["GeoPS - Reporte de analíticas"]);
    rows.push([meta.businessName, meta.period]);
    rows.push([`Generado el ${stamp()}`]);
    rows.push([]);

    rows.push(["Métrica", "Valor", "Variación"]);
    kpis.forEach(k => rows.push([k.label, k.value, k.delta]));
    rows.push([]);

    rows.push(["Embudo de conversión", "Usuarios", "%"]);
    funnel.forEach(f => rows.push([f.label, f.value, `${f.pct}%`]));
    rows.push([]);

    rows.push(["Top campañas", "Vistas", "Conversión", "Stock"]);
    topCampaigns.forEach(c => rows.push([c.name, c.views, c.rate, c.stock]));
    rows.push([]);

    rows.push(["Hora", "Reservados", "Redimidos"]);
    hourly.forEach(h => rows.push([h.hour, h.reserved, h.redeemed]));

    const csv = rows.map(r => r.map(esc).join(",")).join("\n");
    /* BOM para que Excel respete los acentos */
    download(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }), `GeoPS-reporte-${fileStamp()}.csv`);
}

/* excel */
export function exportReportExcel(report: ReportSnapshot) {
    const wb = XLSX.utils.book_new();

    const resumen = XLSX.utils.aoa_to_sheet([
        ["GeoPS — Reporte de analíticas"],
        [report.meta.businessName, report.meta.period],
        [`Generado el ${stamp()}`],
        [],
        ["Métrica", "Valor", "Variación"],
        ...report.kpis.map(k => [k.label, k.value, k.delta]),
    ]);
    resumen["!cols"] = [{ wch: 22 }, { wch: 14 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, resumen, "Resumen");

    const funnel = XLSX.utils.aoa_to_sheet([
        ["Embudo de conversión", "Usuarios", "%"],
        ...report.funnel.map(f => [f.label, f.value, f.pct]),
    ]);
    funnel["!cols"] = [{ wch: 22 }, { wch: 12 }, { wch: 8 }];
    XLSX.utils.book_append_sheet(wb, funnel, "Funnel");

    const top = XLSX.utils.aoa_to_sheet([
        ["Campaña", "Vistas", "Conversión", "Stock"],
        ...report.topCampaigns.map(c => [c.name, c.views, c.rate, c.stock]),
    ]);
    top["!cols"] = [{ wch: 22 }, { wch: 10 }, { wch: 12 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, top, "Top campañas");

    const hourly = XLSX.utils.aoa_to_sheet([
        ["Hora", "Reservados", "Redimidos"],
        ...report.hourly.map(h => [h.hour, h.reserved, h.redeemed]),
    ]);
    hourly["!cols"] = [{ wch: 10 }, { wch: 12 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, hourly, "Por hora");

    XLSX.writeFile(wb, `GeoPS-reporte-${fileStamp()}.xlsx`);
}