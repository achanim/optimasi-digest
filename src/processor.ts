import type {
  RawReport,
  ProcessedReport,
  Metadata,
  MainIssue,
  MediaUpdate,
  AdditionalIssue,
  ATHG,
  SentimentAnalysis,
  Statistics,
  Source,
  RawSource,
  ValidationResult,
  NewsItem,
  PostItem,
  TotalData,
  PlatformStatistic,
} from "./types";

// ─── Processor ────────────────────────────────────────────────────────────────

export class DiggestProcessor {
  /**
   * Validasi dan normalisasi data dari LLM
   */
  static processLLMData(rawData: RawReport): ProcessedReport {
    return {
      metadata: this.processMetadata(rawData.metadata),
      mainIssue: this.processMainIssue(rawData.mainIssue),
      mediaUpdate: this.processMediaUpdate(rawData.mediaUpdate),
      additionalIssues: this.processAdditionalIssues(rawData.additionalIssues),
      athg: this.processATHG(rawData.athg),
    };
  }

  /**
   * Proses metadata
   */
  static processMetadata(metadata?: Partial<Metadata>): Metadata {
    return {
      reportType:
        metadata?.reportType ??
        "LAPORAN HARIAN PERKEMBANGAN SITUASI MEDIA SOSIAL & ONLINE",
      organization: metadata?.organization ?? "PUSSIBERAD | TNI ANGKATAN DARAT",
      date: metadata?.date ?? new Date().toISOString().split("T")[0],
      confidentialLevel: metadata?.confidentialLevel ?? "CONFIDENTIAL",
    };
  }

  /**
   * Proses isu utama — termasuk field sources
   */
  static processMainIssue(
    mainIssue?: Partial<MainIssue> & { sources?: RawSource[] },
  ): MainIssue {
    if (!mainIssue) {
      throw new Error("Isu utama wajib ada");
    }

    return {
      category: mainIssue.category ?? "ISU UTAMA NASIONAL",
      title: this.sanitizeText(mainIssue.title),
      coresituation: this.ensureArray(mainIssue.coresituation),
      strategicImportance: this.ensureArray(mainIssue.strategicImportance),
      mediaPerception: this.ensureArray(mainIssue.mediaPerception),
      riskAssessment: this.ensureArray(mainIssue.riskAssessment),
      sources: this.processSources(mainIssue.sources),
    };
  }

  /**
   * Proses media update
   */
  static processMediaUpdate(
    mediaUpdate?: RawReport["mediaUpdate"],
  ): MediaUpdate | null {
    if (!mediaUpdate) return null;

    return {
      title:
        mediaUpdate.title ??
        "UPDATE MEDIA & MEDIA SOSIAL - PETA PERSEPSI PUBLIK TERKAIT TNI AD",
      statistics: this.processStatistics(mediaUpdate.statistics),
      sentimentAnalysis: this.processSentimentAnalysis(
        mediaUpdate.sentimentAnalysis,
      ),
      keyFindings: this.ensureArray(mediaUpdate.keyFindings),
      topIssues: this.ensureArray(mediaUpdate.topIssues),
    };
  }

  /**
   * Proses statistik platform
   */
  static processStatistics(
    statistics?: {
      totalData?: Partial<TotalData>;
      platforms?: Partial<PlatformStatistic>[];
    } | null,
  ): Statistics | null {
    if (!statistics) return null;

    return {
      totalData: {
        accounts: parseInt(String(statistics.totalData?.accounts ?? 0)) || 0,
        posts: parseInt(String(statistics.totalData?.posts ?? 0)) || 0,
        retweets: parseInt(String(statistics.totalData?.retweets ?? 0)) || 0,
        engagement:
          parseInt(String(statistics.totalData?.engagement ?? 0)) || 0,
        reach: parseInt(String(statistics.totalData?.reach ?? 0)) || 0,
      },
      platforms: (statistics.platforms ?? []).map(
        (platform: Partial<PlatformStatistic>) => ({
          name: platform.name ?? "",
          mentions: parseInt(String(platform.mentions ?? 0)) || 0,
          positive: parseInt(String(platform.positive ?? 0)) || 0,
          neutral: parseInt(String(platform.neutral ?? 0)) || 0,
          negative: parseInt(String(platform.negative ?? 0)) || 0,
        }),
      ),
    };
  }
  /**
   * Proses analisis sentimen
   */
  static processSentimentAnalysis(
    sentimentAnalysis?: Partial<SentimentAnalysis>,
  ): SentimentAnalysis | null {
    if (!sentimentAnalysis) return null;

    return {
      positive: this.ensureArray(sentimentAnalysis.positive),
      neutral: this.ensureArray(sentimentAnalysis.neutral),
      negative: this.ensureArray(sentimentAnalysis.negative),
    };
  }

  /**
   * Proses isu tambahan — termasuk field sources per isu
   */
  static processAdditionalIssues(
    additionalIssues?: Array<
      Partial<AdditionalIssue> & { sources?: RawSource[] }
    >,
  ): AdditionalIssue[] {
    if (!additionalIssues || !Array.isArray(additionalIssues)) return [];

    return additionalIssues.map((issue) => ({
      category: issue.category ?? "HANKAM & SOSIAL",
      title: this.sanitizeText(issue.title),
      facts: this.ensureArray(issue.facts),
      mediaPerception: this.ensureArray(issue.mediaPerception),
      assessment: this.ensureArray(issue.assessment),
      sources: this.processSources(issue.sources),
    }));
  }

  /**
   * Proses ATHG (Ancaman, Tantangan, Hambatan, Gangguan)
   */
  static processATHG(athg?: Partial<ATHG>): ATHG | null {
    if (!athg) return null;

    return {
      threats: this.ensureArray(athg.threats),
      challenges: this.ensureArray(athg.challenges),
      obstacles: this.ensureArray(athg.obstacles),
      disturbances: this.ensureArray(athg.disturbances),
      strategicConclusion: this.ensureArray(athg.strategicConclusion),
    };
  }

  /**
   * Proses daftar sumber referensi.
   * Normalisasi dari berita (news) maupun postingan media sosial (post).
   */
  static processSources(sources?: RawSource[]): Source[] {
    if (!sources || !Array.isArray(sources)) return [];

    return sources
      .filter(
        (src): src is RawSource =>
          !!(src && (src.url || src.title || src.post)),
      )
      .map((src) => ({
        title: this.sanitizeText(src.title),
        post: this.sanitizeText(src.post),
        url: src.url ?? "",
        platform: src.platform ?? "",
        domain: src.domain ?? "",
        senderName: src.senderName ?? "",
      }));
  }

  /**
   * Helper: Memastikan data adalah array
   */
  static ensureArray<T>(data?: T | T[] | null): T[] {
    if (!data) return [];
    if (Array.isArray(data))
      return data.filter((item): item is T => item != null);
    return [data];
  }

  /**
   * Helper: Sanitize text
   */
  static sanitizeText(text?: string | null): string {
    if (!text) return "";
    return String(text).trim();
  }

  /**
   * Validasi struktur data final
   */
  static validateData(data: ProcessedReport): ValidationResult {
    const errors: string[] = [];

    if (!data.metadata?.date) {
      errors.push("Tanggal metadata wajib diisi");
    }

    if (!data.mainIssue?.title) {
      errors.push("Judul isu utama wajib diisi");
    }

    if (
      !data.mainIssue?.coresituation ||
      data.mainIssue.coresituation.length === 0
    ) {
      errors.push("Isu utama harus memiliki minimal satu situasi inti");
    }

    if (data.athg) {
      if (!data.athg.threats || data.athg.threats.length === 0) {
        errors.push("ATHG harus memiliki minimal satu ancaman");
      }
      if (
        !data.athg.strategicConclusion ||
        data.athg.strategicConclusion.length === 0
      ) {
        errors.push("ATHG harus memiliki minimal satu kesimpulan strategis");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate template prompt untuk LLM.
   *
   * PENTING: Prompt ini sudah mencakup instruksi untuk memetakan sumber (news/post)
   * ke setiap isu yang dibahas dalam laporan.
   *
   * Cara penggunaan:
   * 1. Kirim payload lengkap: { social_media, post, news } ke LLM
   * 2. Sertakan prompt ini sebagai instruksi sistem
   * 3. LLM akan menganalisis data dan mengisi field `sources` dengan
   *    berita/postingan yang relevan per isu
   */
  static getLLMPromptTemplate(): string {
    return `
Anda adalah analis intelijen media untuk TNI Angkatan Darat (PUSSIBERAD).
Tugas Anda adalah menganalisis data media sosial dan berita yang diberikan,
lalu menyusunnya menjadi laporan harian dalam format JSON terstruktur.

INSTRUKSI PENTING:
- Semua teks dalam Bahasa Indonesia formal dan baku
- Gunakan HURUF KAPITAL untuk judul dan nama kategori
- Setiap isu WAJIB menyertakan field "sources" berisi daftar berita atau postingan
  yang relevan/mendukung topik tersebut (dipilih dari data news dan post yang diberikan)
- Pilih sumber yang paling relevan: maksimal 3 sumber per isu
- Untuk sumber dari news: isi "title", "url", "domain"
- Untuk sumber dari post medsos: isi "post" (penggal teks), "url", "platform", "senderName"
- Tanggal dalam format YYYY-MM-DD

FORMAT JSON YANG HARUS DIHASILKAN:

{
  "metadata": {
    "reportType": "LAPORAN HARIAN PERKEMBANGAN SITUASI MEDIA SOSIAL & ONLINE",
    "organization": "PUSSIBERAD | TNI ANGKATAN DARAT",
    "date": "YYYY-MM-DD",
    "confidentialLevel": "CONFIDENTIAL"
  },
  "mainIssue": {
    "category": "ISU UTAMA NASIONAL",
    "title": "JUDUL ISU UTAMA (KAPITAL, MAKS 100 KARAKTER)",
    "coresituation": [
      "Deskripsi situasi inti poin 1",
      "Deskripsi situasi inti poin 2"
    ],
    "strategicImportance": [
      "Makna strategis poin 1",
      "Makna strategis poin 2"
    ],
    "mediaPerception": [
      "Persepsi media poin 1"
    ],
    "riskAssessment": [
      "Risiko dominan: penjelasan risiko",
      "Status keamanan: penjelasan status"
    ],
    "sources": [
      {
        "title": "Judul berita dari data news yang relevan",
        "url": "https://url-berita.com/...",
        "domain": "nama-domain.com"
      },
      {
        "post": "Penggalan teks postingan medsos yang relevan",
        "url": "https://url-postingan...",
        "platform": "twitter",
        "senderName": "NamaAkunPengirim"
      }
    ]
  },
  "mediaUpdate": {
    "title": "UPDATE MEDIA & MEDIA SOSIAL - PETA PERSEPSI PUBLIK TERKAIT TNI AD",
    "statistics": {
      "totalData": {
        "accounts": 0,
        "posts": 0,
        "retweets": 0,
        "engagement": 0,
        "reach": 0
      },
      "platforms": [
        {
          "name": "Twitter",
          "mentions": 0,
          "positive": 0,
          "neutral": 0,
          "negative": 0
        }
      ]
    },
    "sentimentAnalysis": {
      "positive": ["Narasi positif yang dominan di media sosial"],
      "neutral": ["Narasi netral yang muncul"],
      "negative": ["Narasi negatif yang perlu diwaspadai"]
    },
    "keyFindings": ["Temuan kunci dari monitoring media sosial"],
    "topIssues": ["Isu paling banyak dibicarakan"]
  },
  "additionalIssues": [
    {
      "category": "EKONOMI",
      "title": "JUDUL ISU TAMBAHAN",
      "facts": [
        "Fakta utama 1",
        "Fakta utama 2"
      ],
      "mediaPerception": ["Bagaimana media meliput isu ini"],
      "assessment": ["Penilaian strategis dan implikasi bagi TNI AD"],
      "sources": [
        {
          "title": "Judul berita dari data news yang relevan",
          "url": "https://url-berita.com/...",
          "domain": "nama-domain.com"
        }
      ]
    }
  ],
  "athg": {
    "threats": ["Ancaman yang teridentifikasi"],
    "challenges": ["Tantangan yang dihadapi"],
    "obstacles": ["Hambatan dalam pelaksanaan tugas"],
    "disturbances": ["Gangguan informasi atau sosial"],
    "strategicConclusion": ["Kesimpulan strategis untuk pimpinan"]
  }
}

CATATAN UNTUK FIELD "sources":
- Pilih sumber yang LANGSUNG mendukung atau membuktikan narasi dalam isu tersebut
- Prioritaskan berita dari domain tier 1 (antara.com, detik.com, kompas.com, tempo.co)
- Untuk postingan medsos, pilih yang memiliki engagement tinggi atau representatif
- Jika tidak ada sumber yang relevan, gunakan array kosong: "sources": []
- Jangan membuat-buat URL atau judul yang tidak ada dalam data
    `;
  }

  /**
   * Helper: Petakan sumber (news/post) ke isu berdasarkan keyword.
   * Berguna sebagai fallback jika LLM tidak mengisi sources.
   */
  static mapSourcesToIssue(
    news: NewsItem[] = [],
    posts: PostItem[] = [],
    keywords = "",
  ): Partial<Source>[] {
    const kws = keywords.toLowerCase().split(" ").filter(Boolean);

    type ScoredSource = { score: number; source: Partial<Source> };
    const scored: ScoredSource[] = [];

    news.forEach((item) => {
      const text = (
        (item.title ?? "") +
        " " +
        (item.description ?? "")
      ).toLowerCase();
      const score = kws.filter((kw) => text.includes(kw)).length;
      if (score > 0) {
        scored.push({
          score,
          source: { title: item.title, url: item.url, domain: item.domain },
        });
      }
    });

    posts.forEach((item) => {
      const text = (item.post ?? "").toLowerCase();
      const score = kws.filter((kw) => text.includes(kw)).length;
      if (score > 0) {
        scored.push({
          score,
          source: {
            post: item.post?.substring(0, 100),
            url: item.url,
            platform: item.platform,
            senderName: item.senderName,
          },
        });
      }
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((s) => s.source);
  }
}

export default DiggestProcessor;
