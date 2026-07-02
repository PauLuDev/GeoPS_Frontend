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

/* helper para obtener textos localizados en base al traductor o al fallback */
function getLocaleTxt(t?: any) {
    const isEn = t ? t("dashboard.range.today") === "Today" : false;
    const es: Record<string, string> = {
        title: "GeoPS · Reporte de analíticas",
        generated: "Generado el",
        metric: "Métrica",
        value: "Valor",
        delta: "Variación",
        funnel: "Embudo de conversión",
        users: "Usuarios",
        pct: "%",
        topCampaigns: "Top campañas activas",
        campaign: "Campaña",
        views: "Vistas",
        conversion: "Conversión",
        stock: "Stock",
        hour: "Hora",
        day: "Día",
        reserved: "Reservados",
        redeemed: "Redimidos",
        sheetSummary: "Resumen",
        sheetFunnel: "Funnel",
        sheetTop: "Top campañas",
        sheetHourly: "Por hora",
        sheetDaily: "Por día",
    };
    const en: Record<string, string> = {
        title: "GeoPS · Analytics Report",
        generated: "Generated on",
        metric: "Metric",
        value: "Value",
        delta: "Variation",
        funnel: "Conversion Funnel",
        users: "Users",
        pct: "%",
        topCampaigns: "Top Active Campaigns",
        campaign: "Campaign",
        views: "Views",
        conversion: "Conversion",
        stock: "Stock",
        hour: "Hour",
        day: "Day",
        reserved: "Reserved",
        redeemed: "Redeemed",
        sheetSummary: "Summary",
        sheetFunnel: "Funnel",
        sheetTop: "Top Campaigns",
        sheetHourly: "Hourly",
        sheetDaily: "Daily",
    };
    return (key: string) => (isEn ? en[key] : es[key]);
}

/* pdf */
export function exportReportPDF(report: ReportSnapshot, t?: any) {
    const txt = getLocaleTxt(t);
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
    doc.text(txt("title"), M, 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`${meta.businessName}  ·  ${meta.period}`, M, 54);

    doc.setTextColor(...INK);
    doc.setFontSize(9);
    doc.text(`${txt("generated")} ${stamp()}`, M, 90);

    /* KPIs */
    autoTable(doc, {
        startY: 105,
        head: [[txt("metric"), txt("value"), txt("delta")]],
        body: kpis.map(k => [k.label, k.value, k.delta]),
        theme: "grid",
        headStyles: { fillColor: BRAND, textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 6 },
        margin: { left: M, right: M },
    });

    /* Funnel */
    autoTable(doc, {
        head: [[txt("funnel"), txt("users"), txt("pct")]],
        body: funnel.map(f => [f.label, f.value.toLocaleString("es-PE"), `${f.pct}%`]),
        theme: "grid",
        headStyles: { fillColor: INK, textColor: 255, fontStyle: "bold" },
        styles: { fontSize: 10, cellPadding: 6 },
        margin: { left: M, right: M },
    });

    /* top campanas (solo si hay datos) */
    if (topCampaigns && topCampaigns.length > 0) {
        autoTable(doc, {
            head: [[txt("topCampaigns"), txt("views"), txt("conversion"), txt("stock")]],
            body: topCampaigns.map(c => [c.name, c.views.toLocaleString("es-PE"), c.rate, c.stock]),
            theme: "grid",
            headStyles: { fillColor: BRAND, textColor: 255, fontStyle: "bold" },
            styles: { fontSize: 10, cellPadding: 6 },
            margin: { left: M, right: M },
        });
    }

    /* Rendimiento por hora/día (solo si hay datos) */
    if (hourly && hourly.length > 0) {
        const timeHeader = meta.range === "today" ? txt("hour") : txt("day");
        autoTable(doc, {
            head: [[timeHeader, txt("reserved"), txt("redeemed")]],
            body: hourly.map(h => [h.hour, String(h.reserved), String(h.redeemed)]),
            theme: "striped",
            headStyles: { fillColor: INK, textColor: 255, fontStyle: "bold" },
            styles: { fontSize: 9, cellPadding: 4 },
            margin: { left: M, right: M },
        });
    }

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
export function exportReportCSV(report: ReportSnapshot, t?: any) {
    const txt = getLocaleTxt(t);
    const { meta, kpis, funnel, topCampaigns, hourly } = report;
    const esc = (v: string | number) => {
        const s = String(v);
        return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const rows: (string | number)[][] = [];

    rows.push([txt("title")]);
    rows.push([meta.businessName, meta.period]);
    rows.push([`${txt("generated")} ${stamp()}`]);
    rows.push([]);

    rows.push([txt("metric"), txt("value"), txt("delta")]);
    kpis.forEach(k => rows.push([k.label, k.value, k.delta]));
    rows.push([]);

    rows.push([txt("funnel"), txt("users"), txt("pct")]);
    funnel.forEach(f => rows.push([f.label, f.value, `${f.pct}%`]));
    rows.push([]);

    if (topCampaigns && topCampaigns.length > 0) {
        rows.push([txt("campaign"), txt("views"), txt("conversion"), txt("stock")]);
        topCampaigns.forEach(c => rows.push([c.name, c.views, c.rate, c.stock]));
        rows.push([]);
    }

    if (hourly && hourly.length > 0) {
        const timeHeader = meta.range === "today" ? txt("hour") : txt("day");
        rows.push([timeHeader, txt("reserved"), txt("redeemed")]);
        hourly.forEach(h => rows.push([h.hour, h.reserved, h.redeemed]));
    }

    const csv = rows.map(r => r.map(esc).join(",")).join("\n");
    /* BOM para que Excel respete los acentos */
    download(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }), `GeoPS-reporte-${fileStamp()}.csv`);
}

/* excel */
export function exportReportExcel(report: ReportSnapshot, t?: any) {
    const txt = getLocaleTxt(t);
    const wb = XLSX.utils.book_new();

    const resumen = XLSX.utils.aoa_to_sheet([
        [txt("title")],
        [report.meta.businessName, report.meta.period],
        [`${txt("generated")} ${stamp()}`],
        [],
        [txt("metric"), txt("value"), txt("delta")],
        ...report.kpis.map(k => [k.label, k.value, k.delta]),
    ]);
    resumen["!cols"] = [{ wch: 22 }, { wch: 14 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, resumen, txt("sheetSummary"));

    const funnel = XLSX.utils.aoa_to_sheet([
        [txt("funnel"), txt("users"), txt("pct")],
        ...report.funnel.map(f => [f.label, f.value, f.pct]),
    ]);
    funnel["!cols"] = [{ wch: 22 }, { wch: 12 }, { wch: 8 }];
    XLSX.utils.book_append_sheet(wb, funnel, txt("sheetFunnel"));

    if (report.topCampaigns && report.topCampaigns.length > 0) {
        const top = XLSX.utils.aoa_to_sheet([
            [txt("campaign"), txt("views"), txt("conversion"), txt("stock")],
            ...report.topCampaigns.map(c => [c.name, c.views, c.rate, c.stock]),
        ]);
        top["!cols"] = [{ wch: 22 }, { wch: 10 }, { wch: 12 }, { wch: 10 }];
        XLSX.utils.book_append_sheet(wb, top, txt("sheetTop"));
    }

    if (report.hourly && report.hourly.length > 0) {
        const timeHeader = report.meta.range === "today" ? txt("hour") : txt("day");
        const sheetName = report.meta.range === "today" ? txt("sheetHourly") : txt("sheetDaily");
        const hourly = XLSX.utils.aoa_to_sheet([
            [timeHeader, txt("reserved"), txt("redeemed")],
            ...report.hourly.map(h => [h.hour, h.reserved, h.redeemed]),
        ]);
        hourly["!cols"] = [{ wch: 10 }, { wch: 12 }, { wch: 12 }];
        XLSX.utils.book_append_sheet(wb, hourly, sheetName);
    }

    XLSX.writeFile(wb, `GeoPS-reporte-${fileStamp()}.xlsx`);
}