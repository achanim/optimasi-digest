export interface Source {
  title: string;
  post: string;
  url: string;
  platform: string;
  domain: string;
  senderName: string;
}

export interface RawSource {
  title?: string;
  post?: string;
  url?: string;
  platform?: string;
  domain?: string;
  senderName?: string;
}

export interface Metadata {
  reportType: string;
  organization: string;
  date: string;
  confidentialLevel: string;
}

export interface MainIssue {
  category: string;
  title: string;
  coresituation: string[];
  strategicImportance: string[];
  mediaPerception: string[];
  riskAssessment: string[];
  sources: Source[];
}

export interface PlatformStatistic {
  name: string;
  mentions: number;
  positive: number;
  neutral: number;
  negative: number;
}

export interface TotalData {
  accounts: number;
  posts: number;
  retweets: number;
  engagement: number;
  reach: number;
}

export interface Statistics {
  totalData: TotalData;
  platforms: PlatformStatistic[];
}

export interface SentimentAnalysis {
  positive: string[];
  neutral: string[];
  negative: string[];
}

export interface MediaUpdate {
  title: string;
  statistics: Statistics | null;
  sentimentAnalysis: SentimentAnalysis | null;
  keyFindings: string[];
  topIssues: string[];
}

export interface AdditionalIssue {
  category: string;
  title: string;
  facts: string[];
  mediaPerception: string[];
  assessment: string[];
  sources: Source[];
}

export interface ATHG {
  threats: string[];
  challenges: string[];
  obstacles: string[];
  disturbances: string[];
  strategicConclusion: string[];
}

export interface ProcessedReport {
  metadata: Metadata;
  mainIssue: MainIssue;
  mediaUpdate: MediaUpdate | null;
  additionalIssues: AdditionalIssue[];
  athg: ATHG | null;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface RawReport {
  metadata?: Partial<Metadata>;
  mainIssue?: Partial<MainIssue> & { sources?: RawSource[] };
  mediaUpdate?: {
    title?: string;
    statistics?: {
      totalData?: Partial<TotalData>;
      platforms?: Partial<PlatformStatistic>[];
    };
    sentimentAnalysis?: Partial<SentimentAnalysis>;
    keyFindings?: string[];
    topIssues?: string[];
  };
  additionalIssues?: Array<
    Partial<AdditionalIssue> & { sources?: RawSource[] }
  >;
  athg?: Partial<ATHG>;
}

export interface NewsItem {
  title?: string;
  description?: string;
  url?: string;
  domain?: string;
}

export interface PostItem {
  post?: string;
  url?: string;
  platform?: string;
  senderName?: string;
}

// ── Options untuk generateDigestPDF ──────────────────────────────────────────

export interface GeneratePDFOptions {
  /** JSON string dari LLM, atau object ProcessedReport langsung */
  data: string | ProcessedReport;
  /** URL logo yang akan di-fetch dan di-embed ke PDF. Default: tidak ada logo */
  logoUrl?: string;
  /** Nama file PDF yang di-download. Default: "Laporan_Digest.pdf" */
  fileName?: string;
}
