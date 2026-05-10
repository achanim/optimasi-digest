import type { ProcessedReport, Source } from "./types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function truncateText(text: string, maxLen: number): string {
  if (!text) return "";
  return text.length > maxLen ? text.substring(0, maxLen) + "..." : text;
}

function buildSourcesBlock(sources?: Source[]): any[] {
  if (!sources || sources.length === 0) return [];

  return [
    {
      text: "SUMBER REFERENSI",
      fontSize: 8,
      bold: true,
      color: "#FFD700",
      margin: [0, 12, 0, 6],
      decoration: "underline",
      decorationColor: "#FFD700",
    },
    {
      table: {
        widths: [70, "*"],
        body: sources.map((src) => {
          const label = src.platform || src.domain || "Sumber";
          const labelDisplay = label.charAt(0).toUpperCase() + label.slice(1);
          const text = truncateText(src.title || src.post || "-", 120);
          return [
            {
              text: labelDisplay,
              fontSize: 7,
              bold: true,
              color: "#FFD700",
              fillColor: "#1a3a22",
              alignment: "center",
              margin: [3, 4, 3, 4],
            },
            {
              text,
              fontSize: 8,
              color: "#c9d1d9",
              lineHeight: 1.4,
              margin: [6, 4, 4, 4],
              link: src.url || undefined,
            },
          ];
        }),
      },
      layout: {
        defaultBorder: false,
        fillColor: () => "#0a180d",
        hLineWidth: () => 0.5,
        vLineWidth: () => 0,
        hLineColor: () => "#1a3a22",
      },
      margin: [0, 0, 0, 8],
    },
  ];
}

// ── Doc Definition ────────────────────────────────────────────────────────────

export function createDocDefinition(
  reportData: ProcessedReport,
  logoData?: string,
): any {
  const content: any[] = [];

  // ── Cover Page ───────────────────────────────────────────────────────────
  if (logoData) {
    content.push({
      image: logoData,
      width: 120,
      alignment: "center",
      margin: [0, 120, 0, 40],
    });
  } else {
    content.push({ text: "", margin: [0, 160, 0, 0] });
  }

  content.push(
    {
      text: reportData.metadata.reportType,
      style: "mainTitle",
      alignment: "center",
      margin: [0, 0, 0, 20],
    },
    {
      text: `Periode: ${formatDate(reportData.metadata.date)}`,
      style: "subtitle",
      alignment: "center",
      margin: [0, 0, 0, 200],
    },
    {
      text: reportData.metadata.organization,
      style: "organizationFooter",
      alignment: "left",
    },
    { text: "", pageBreak: "after" },
  );

  // ── Main Issue ───────────────────────────────────────────────────────────
  content.push(
    { text: reportData.mainIssue.category, style: "sectionCategory" },
    {
      text: reportData.mainIssue.title,
      style: "sectionTitle",
      margin: [0, 8, 0, 16],
    },
  );

  const situasiCards = reportData.mainIssue.coresituation.map((item) => ({
    text: item,
    style: "situasiCard",
    margin: [0, 0, 0, 6],
  }));

  const rightColumn: any[] = [
    { text: "MAKNA STRATEGIS", style: "subheading", margin: [0, 0, 0, 8] },
    ...reportData.mainIssue.strategicImportance.map((item) => ({
      columns: [
        { text: "•", width: 10, color: "#FFD700", fontSize: 10 },
        { text: item, style: "bulletList", width: "*" },
      ],
      margin: [0, 0, 0, 5],
    })),
  ];

  if (reportData.mainIssue.mediaPerception?.length) {
    rightColumn.push(
      {
        text: "MEDIA & PERSEPSI PUBLIK",
        style: "subheading",
        margin: [0, 12, 0, 8],
      },
      {
        text: reportData.mainIssue.mediaPerception.join(" "),
        style: "mediaBox",
      },
    );
  }

  content.push({
    columns: [
      {
        width: "48%",
        stack: [
          { text: "SITUASI INTI", style: "subheading", margin: [0, 0, 0, 8] },
          ...situasiCards,
        ],
      },
      { width: "4%", text: "" },
      { width: "48%", stack: rightColumn },
    ],
    margin: [0, 0, 0, 16],
  });

  if (reportData.mainIssue.riskAssessment?.length) {
    content.push(
      {
        text: "RISIKO, STATUS KEAMANAN & PENILAIAN AWAL:",
        style: "subheading",
        margin: [0, 10, 0, 8],
      },
      ...reportData.mainIssue.riskAssessment.map((item) => {
        const colonIdx = item.indexOf(":");
        if (colonIdx > -1) {
          return {
            columns: [
              { text: "•", width: 10, color: "#FFD700", fontSize: 10 },
              {
                width: "*",
                text: [
                  {
                    text: item.substring(0, colonIdx + 1),
                    bold: true,
                    color: "#FFD700",
                    fontSize: 10,
                  },
                  { text: item.substring(colonIdx + 1), style: "bulletList" },
                ],
              },
            ],
            margin: [0, 0, 0, 4],
          };
        }
        return {
          columns: [
            { text: "•", width: 10, color: "#FFD700", fontSize: 10 },
            { text: item, style: "bulletList", width: "*" },
          ],
          margin: [0, 0, 0, 4],
        };
      }),
    );
  }

  content.push(...buildSourcesBlock(reportData.mainIssue.sources));
  content.push({ text: "", pageBreak: "after" });

  // ── Media Update ─────────────────────────────────────────────────────────
  if (reportData.mediaUpdate) {
    content.push({
      text: reportData.mediaUpdate.title,
      style: "sectionCategory",
    });

    if (reportData.mediaUpdate.statistics) {
      const { platforms } = reportData.mediaUpdate.statistics;
      content.push(
        {
          text: "Statistik Platform",
          style: "subheading",
          margin: [0, 15, 0, 10],
        },
        {
          table: {
            widths: ["*", "auto", "auto", "auto", "auto"],
            body: [
              ["Platform", "Sebutan", "Positif", "Netral", "Negatif"].map(
                (t) => ({ text: t, style: "tableHeader" }),
              ),
              ...platforms.map((p) =>
                [p.name, p.mentions, p.positive, p.neutral, p.negative].map(
                  String,
                ),
              ),
            ],
          },
          margin: [0, 0, 0, 20],
        },
      );
    }

    const sa = reportData.mediaUpdate.sentimentAnalysis;
    if (sa) {
      content.push(
        { text: "POSITIF:", style: "sentimentHeading", margin: [0, 10, 0, 5] },
        { ul: sa.positive, style: "bulletList" },
        { text: "NETRAL:", style: "sentimentHeading", margin: [0, 10, 0, 5] },
        { ul: sa.neutral, style: "bulletList" },
        { text: "NEGATIF:", style: "sentimentHeading", margin: [0, 10, 0, 5] },
        { ul: sa.negative, style: "bulletList" },
      );
    }

    if (reportData.mediaUpdate.keyFindings?.length) {
      content.push(
        { text: "TEMUAN KUNCI:", style: "subheading", margin: [0, 15, 0, 10] },
        { ul: reportData.mediaUpdate.keyFindings, style: "bulletList" },
      );
    }

    if (reportData.mediaUpdate.topIssues?.length) {
      content.push(
        { text: "ISU TERATAS:", style: "subheading", margin: [0, 15, 0, 10] },
        { ol: reportData.mediaUpdate.topIssues, style: "bulletList" },
      );
    }

    content.push({ text: "", pageBreak: "after" });
  }

  // ── Additional Issues ────────────────────────────────────────────────────
  reportData.additionalIssues?.forEach((issue, index) => {
    content.push(
      { text: issue.category, style: "sectionCategory" },
      { text: issue.title, style: "sectionTitle", margin: [0, 10, 0, 20] },
      {
        text: "SITUASI & FAKTA UTAMA",
        style: "subheading",
        margin: [0, 10, 0, 10],
      },
      { ul: issue.facts, style: "bulletList" },
    );

    if (issue.mediaPerception?.length) {
      content.push(
        {
          text: "MEDIA & PERSEPSI PUBLIK",
          style: "subheading",
          margin: [0, 15, 0, 10],
        },
        { ul: issue.mediaPerception, style: "bulletList" },
      );
    }

    if (issue.assessment?.length) {
      content.push(
        {
          text: "PENILAIAN STRATEGIS & KESIMPULAN",
          style: "subheading",
          margin: [0, 15, 0, 10],
        },
        { ul: issue.assessment, style: "bulletList" },
      );
    }

    content.push(...buildSourcesBlock(issue.sources));

    if (index < (reportData.additionalIssues?.length ?? 0) - 1) {
      content.push({ text: "", pageBreak: "after" });
    }
  });

  content.push({ text: "", pageBreak: "after" });

  // ── ATHG ─────────────────────────────────────────────────────────────────
  if (reportData.athg) {
    content.push(
      { text: "ATHG & KESIMPULAN", style: "sectionCategory" },
      {
        table: {
          widths: ["50%", "50%"],
          body: [
            [
              {
                stack: [
                  { text: "Ancaman", style: "athgBoxTitle" },
                  { ul: reportData.athg.threats, style: "athgList" },
                ],
                fillColor: "#0d1a0f",
                margin: 5,
              },
              {
                stack: [
                  { text: "Tantangan", style: "athgBoxTitle" },
                  { ul: reportData.athg.challenges, style: "athgList" },
                ],
                fillColor: "#0d1a0f",
                margin: 5,
              },
            ],
            [
              {
                stack: [
                  { text: "Hambatan", style: "athgBoxTitle" },
                  { ul: reportData.athg.obstacles, style: "athgList" },
                ],
                fillColor: "#0d1a0f",
                margin: 5,
              },
              {
                stack: [
                  { text: "Gangguan", style: "athgBoxTitle" },
                  { ul: reportData.athg.disturbances, style: "athgList" },
                ],
                fillColor: "#0d1a0f",
                margin: 5,
              },
            ],
          ],
        },
        layout: { defaultBorder: false },
        margin: [0, 20, 0, 20],
      },
      {
        text: "Kesimpulan Strategis",
        style: "subheading",
        margin: [0, 20, 0, 10],
      },
      { ul: reportData.athg.strategicConclusion, style: "bulletList" },
    );
  }

  // ── Page Setup ────────────────────────────────────────────────────────────
  return {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [40, 60, 40, 60],

    background: (_: number, pageSize: { width: number; height: number }) => ({
      canvas: [
        {
          type: "rect",
          x: 0,
          y: 0,
          w: pageSize.width,
          h: pageSize.height,
          color: "#001404",
        },
      ],
    }),

    header: () => ({
      text: reportData.metadata.confidentialLevel,
      alignment: "right",
      margin: [0, 20, 40, 0],
      style: "headerConfidential",
    }),

    footer: (currentPage: number) => ({
      columns: [
        {
          text: reportData.metadata.organization,
          alignment: "left",
          style: "pageFooter",
        },
        {
          text: `${currentPage}`,
          alignment: "right",
          style: "pageNumber",
        },
      ],
      margin: [40, 0, 40, 20],
    }),

    content,

    styles: {
      mainTitle: { fontSize: 24, bold: true, color: "#FFD700" },
      subtitle: { fontSize: 18, color: "#FFD700" },
      organizationFooter: { fontSize: 11, color: "#9ca3af", bold: true },
      headerConfidential: { fontSize: 9, color: "#6b7280", bold: true },
      pageFooter: { fontSize: 9, color: "#6b7280" },
      pageNumber: { fontSize: 10, color: "#9ca3af", bold: true },
      sectionCategory: {
        fontSize: 16,
        bold: true,
        color: "#00e676",
        margin: [0, 20, 0, 5],
      },
      sectionTitle: { fontSize: 14, bold: true, color: "#FFD700" },
      subheading: {
        fontSize: 11,
        bold: true,
        color: "#FFD700",
        background: "#132b18",
      },
      bulletList: { fontSize: 10, lineHeight: 1.5, color: "#d1d5db" },
      situasiCard: { fontSize: 10, lineHeight: 1.5, color: "#d1d5db" },
      mediaBox: {
        fontSize: 10,
        lineHeight: 1.5,
        color: "#d1d5db",
        italics: true,
      },
      tableHeader: {
        bold: true,
        fontSize: 11,
        color: "#FFD700",
        fillColor: "#1a472a",
      },
      sentimentHeading: { fontSize: 11, bold: true, color: "#00e676" },
      athgBoxTitle: {
        fontSize: 12,
        bold: true,
        color: "#FFD700",
        margin: [0, 0, 0, 10],
      },
      athgList: { fontSize: 9, lineHeight: 1.3, color: "#d1d5db" },
    },

    defaultStyle: { font: "Roboto", fontSize: 10, color: "#d1d5db" },
  };
}
