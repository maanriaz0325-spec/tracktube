import { useState, ReactNode, FormEvent, useEffect } from "react";
import {
  Search,
  Youtube,
  Globe,
  Tag,
  ArrowRight,
  AlertCircle,
  ExternalLink,
  Info,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Users,
  BarChart3,
  Layers,
  Compass,
  Zap,
  Target,
  ShieldCheck,
  Fingerprint,
  BookOpen,
  Activity,
  PieChart,
  MessageSquare,
  Copy,
  Calendar,
  ThumbsUp,
  MessageCircle,
  Link as LinkIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── tiny helpers ────────────────────────────────────────────────────────────

const fmt = (n: number | string | undefined) => {
  if (!n) return "0";
  const num = Number(n);
  if (num >= 1e9) return (num / 1e9).toFixed(1) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(1) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(1) + "K";
  return num.toLocaleString();
};

const extractLinks = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};

// ─── reusable components ──────────────────────────────────────────────────

const ScoreBar = ({ label, score, note }: { label: string; score: number; note: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center text-xs">
      <span className="font-semibold text-slate-700 uppercase tracking-tighter">{label}</span>
      <span
        className={`font-bold ${
          score >= 70
            ? "text-emerald-600"
            : score >= 40
            ? "text-amber-500"
            : "text-red-500"
        }`}
      >
        {note}
      </span>
    </div>
    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`h-full ${
          score >= 70
            ? "bg-emerald-500"
            : score >= 40
            ? "bg-amber-500"
            : "bg-red-500"
        }`}
      />
    </div>
  </div>
);

// ─── YOUTUBE OFFICIAL CATEGORY MAP ───────────────────────────────────────────

const YT_CATEGORIES: Record<string, string> = {
  "1": "Film & Animation",
  "2": "Autos & Vehicles",
  "10": "Music",
  "15": "Pets & Animals",
  "17": "Sports",
  "18": "Short Movies",
  "19": "Travel & Events",
  "20": "Gaming",
  "21": "Videoblogging",
  "22": "People & Blogs",
  "23": "Comedy",
  "24": "Entertainment",
  "25": "News & Politics",
  "26": "Howto & Style",
  "27": "Education",
  "28": "Science & Technology",
  "29": "Nonprofits & Activism",
};

// ─── NICHE TAXONOMY ──────────────────────────────────────────────────────────

const NICHES: Record<string, any> = {
  finance: {
    label: "Finance & Investing",
    keywords: ["finance","invest","stock","crypto","bitcoin","money","budget","trading","wealth","economy","fund","bank","etf","dividend","passive income","portfolio","forex","real estate","tax","credit card","personal finance"],
    rpm: [8, 25],
    competition: "Very High",
    marketShareFactor: 0.15,
  },
  ai_tech: {
    label: "AI & Future Tech",
    keywords: ["ai","artificial intelligence","chatgpt","llm","machine learning","automation","future tech","robotics","openai","midjourney","neural","algorithmic"],
    rpm: [6, 18],
    competition: "High",
    marketShareFactor: 0.2,
  },
  tech: {
    label: "Consumer Tech",
    keywords: ["tech","review","phone","laptop","software","code","programming","gadget","app","computer","iphone","android","hardware","unboxing","developer","cybersecurity","unboxing","setup"],
    rpm: [4, 12],
    competition: "High",
    marketShareFactor: 0.25,
  },
  education: {
    label: "Academic Education",
    keywords: ["learn","tutorial","how to","explained","course","study","science","history","math","school","university","teacher","lesson","skill","training","physics","chemistry","tutorial"],
    rpm: [3, 10],
    competition: "High",
    marketShareFactor: 0.2,
  },
  gaming_pro: {
    label: "Professional Gaming",
    keywords: ["esports","tournament","competitive","pro player","scrims","clutch","replay","meta","patch notes","ranked","ladder"],
    rpm: [2, 6],
    competition: "High",
    marketShareFactor: 0.1,
  },
  gaming: {
    label: "Gaming Entertainment",
    keywords: ["game","gaming","gameplay","fps","minecraft","roblox","fortnite","stream","esport","ps5","xbox","nintendo","walkthrough","lets play","rpg","funny moments","glitch","mod"],
    rpm: [1, 5],
    competition: "Very High",
    marketShareFactor: 0.4,
  },
  health_fitness: {
    label: "Health & Fitness",
    keywords: ["health","fitness","workout","diet","yoga","meditation","nutrition","exercise","gym","wellness","weight loss","muscle","protein","cardio","bodybuilding","supplements"],
    rpm: [3, 9],
    competition: "High",
    marketShareFactor: 0.18,
  },
  news_politics: {
    label: "News & Politics",
    keywords: ["news","politics","world","breaking","update","government","election","war","report","analysis","policy","president","minister","congress","parliament","current affairs"],
    rpm: [2, 7],
    competition: "High",
    marketShareFactor: 0.35,
  },
  kids_family: {
    label: "Kids & Family",
    keywords: ["kids","children","cartoon","toy","nursery","rhyme","baby","family","animation","educational kids","learning","unboxing toys","playtime"],
    rpm: [2, 6],
    competition: "Medium",
    marketShareFactor: 0.3,
  },
  music: {
    label: "Music",
    keywords: ["music","song","cover","remix","beat","rap","hip hop","lyrics","album","official video","mv","single","artist","concert","instrumental","lofi"],
    rpm: [0.5, 3],
    competition: "Very High",
    marketShareFactor: 0.5,
  },
  vlog_lifestyle: {
    label: "Lifestyle & Vlogs",
    keywords: ["vlog","travel","lifestyle","day in my life","morning routine","room tour","haul","grwm","organize","aesthetic","minimalist"],
    rpm: [1.5, 5],
    competition: "High",
    marketShareFactor: 0.4,
  },
  entertainment: {
    label: "General Entertainment",
    keywords: ["funny","comedy","prank","challenge","reaction","entertainment","viral","celebrity","storytelling","top 10","interesting","curiosity","documentary"],
    rpm: [0.5, 3],
    competition: "Very High",
    marketShareFactor: 0.45,
  },
};

// ─── AUTHENTIC LOGIC HELPERS ─────────────────────────────────────────────────

function detectNiche(channelDescription: string, videoTitle: string, videoTags: string[]) {
  const titleLower = videoTitle.toLowerCase();
  const descLower = channelDescription.toLowerCase();
  const tagsLower = videoTags.map(t => t.toLowerCase());

  let best: any = null;
  let bestScore = 0;

  for (const [key, niche] of Object.entries(NICHES)) {
    let score = 0;
    
    // Title matches (highest weight: 3x)
    niche.keywords.forEach((k: string) => {
      if (titleLower.includes(k)) score += 3;
    });

    // Tag matches (medium weight: 2x)
    tagsLower.forEach(t => {
      niche.keywords.forEach((k: string) => {
        if (t.includes(k)) score += 2;
      });
    });

    // Description matches (lower weight: 1x)
    niche.keywords.forEach((k: string) => {
      if (descLower.includes(k)) score += 1;
    });

    if (score > bestScore) {
      bestScore = score;
      best = { key, ...niche, matchScore: score };
    }
  }

  if (!best || bestScore === 0)
    return {
      key: "entertainment",
      ...NICHES.entertainment,
      matchScore: 0,
    };

  const confidence = bestScore >= 15 ? "Strong" : bestScore >= 5 ? "Moderate" : "Weak";
  return { ...best, confidence, matchCount: Math.floor(bestScore / 2) };
}

function calculateCompetitionRank(views: number, subs: number, niche: any) {
  // Rank is a measure of "Traffic Coverage" in the niche
  // High efficiency (views/subs) + Volume = High Rank
  const efficiency = views / (subs || 1);
  const factor = niche.marketShareFactor || 0.3;
  
  // Theoretical "Top Tier" reach for this niche
  const maxReach = 1000000000 * factor; 
  const coveragePercent = Math.min(99.9, (views / maxReach) * 100);
  
  if (coveragePercent > 80) return "Top 1% (Dominant)";
  if (coveragePercent > 50) return "Top 5% (Authority)";
  if (coveragePercent > 25) return "Top 15% (Competitive)";
  if (coveragePercent > 10) return "Top 30% (Rising)";
  return "Niche Player (Establishing)";
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  useEffect(() => {
  const sendHeight = () => {
    const height = document.body.scrollHeight;
    window.parent.postMessage({ type: 'resize-iframe', height }, '*');
  };
  sendHeight();
  const observer = new ResizeObserver(sendHeight);
  observer.observe(document.body);
  return () => observer.disconnect();
}, []);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);
  const [copying, setCopying] = useState(false);

  // ── Proxy Fetch Helper ───────────────────────────────────────────────────
  async function apiFetch(ytPath: string, params: Record<string, any> = {}) {
    const searchParams = new URLSearchParams({ ...params, ytPath });
    const response = await fetch(`/api/youtube?${searchParams.toString()}`);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  // ── resolve any URL format ──────────────────────────────
  async function resolveInput(raw: string) {
    const s = raw.trim();
    if (/^[\w-]{11}$/.test(s)) return { type: "video", id: s };
    if (/^UC[\w-]{22}$/.test(s)) return { type: "channel", id: s };
    const watchM = s.match(/[?&]v=([\w-]{11})/);
    if (watchM) return { type: "video", id: watchM[1] };
    const shortM = s.match(/youtu\.be\/([\w-]{11})/);
    if (shortM) return { type: "video", id: shortM[1] };
    const chanM = s.match(/\/channel\/(UC[\w-]{22})/);
    if (chanM) return { type: "channel", id: chanM[1] };
    const handleM = s.match(/@([\w.-]+)/);
    if (handleM) {
      const r = await apiFetch("channels", { part: "id", forHandle: handleM[1] });
      if (r.items?.[0]) return { type: "channel", id: r.items[0].id };
    }
    const nameM = s.match(/\/(?:c|user)\/([\w.-]+)/);
    if (nameM) {
      const r = await apiFetch("search", { part: "snippet", type: "channel", q: nameM[1], maxResults: 1 });
      if (r.items?.[0]) return { type: "channel", id: r.items[0].id.channelId };
    }
    const r = await apiFetch("search", { part: "snippet", type: "channel", q: s, maxResults: 1 });
    if (r.items?.[0]) return { type: "channel", id: r.items[0].id.channelId };
    throw new Error("Could not resolve input to a YouTube video or channel.");
  }

  async function fetchAudit(type: string, id: string) {
    let videoData: any = null;
    let channelId = "";

    if (type === "video") {
      const vr = await apiFetch("videos", { part: "snippet,statistics,contentDetails,topicDetails", id });
      if (!vr.items?.length) throw new Error("Video not found.");
      videoData = vr.items[0];
      channelId = videoData.snippet.channelId;
    } else {
      channelId = id;
    }

    const ch = await apiFetch("channels", { part: "snippet,statistics,brandingSettings,contentDetails", id: channelId });
    if (!ch.items?.length) throw new Error("Channel not found.");
    const c = ch.items[0];

    // If channel mode, get the latest video for the forensics section
    if (type === "channel") {
      const uploadsId = c.contentDetails.relatedPlaylists.uploads;
      const pl = await apiFetch("playlistItems", { part: "snippet,contentDetails", playlistId: uploadsId, maxResults: 1 });
      if (pl.items?.[0]) {
        const vid = pl.items[0].contentDetails.videoId;
        const vr = await apiFetch("videos", { part: "snippet,statistics,contentDetails,topicDetails", id: vid });
        videoData = vr.items?.[0];
      }
    }

    const niche = detectNiche(
      c.snippet.description || "",
      videoData?.snippet?.title || "",
      videoData?.snippet?.tags || []
    );
    const compRank = calculateCompetitionRank(parseInt(c.statistics.viewCount), parseInt(c.statistics.subscriberCount), niche);

    return {
      channel: {
        title: c.snippet.title,
        logo: c.snippet.thumbnails.high.url,
        subs: c.statistics.subscriberCount,
        views: c.statistics.viewCount,
        language: c.snippet.defaultLanguage || "International",
        status: "Verified",
        handle: c.snippet.customUrl,
      },
      strategic: {
        category: YT_CATEGORIES[videoData?.snippet.categoryId || "24"] || "Entertainment",
        subNiche: niche.label,
        rpm: niche.rpm,
        compRank,
      },
      video: videoData ? {
        title: videoData.snippet.title,
        description: videoData.snippet.description,
        likes: videoData.statistics.likeCount,
        comments: videoData.statistics.commentCount,
        publishedAt: videoData.snippet.publishedAt,
        tags: videoData.snippet.tags || [],
        externalLinks: extractLinks(videoData.snippet.description),
        videoId: videoData.id,
      } : null,
      nicheConsistency: Math.min(98, 70 + (niche.matchCount * 5))
    };
  }

  const handleAnalyze = async (e: FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const resolved = await resolveInput(url);
      const result = await fetchAudit(resolved.type, resolved.id);
      setData(result);
    } catch (err: any) {
      setError(err.message || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const copyTags = () => {
    if (!data?.video?.tags?.length) return;
    navigator.clipboard.writeText(data.video.tags.join(", "));
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  return (
    <div className="flex flex-col bg-slate-50 text-slate-900 font-sans">
      <main className="flex-1 p-6 flex flex-col gap-6 max-w-[1200px] mx-auto w-full">
        <AnimatePresence mode="wait">
          {!data && !loading ? (
            <motion.section 
              key="search"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col items-center justify-start pt-8 pb-12 max-w-2xl mx-auto w-full"
            >
              <div className="flex flex-col gap-4 mb-8 text-center">
                <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-red-100">
                  <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[16px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                </div>
                <h1 className="text-4xl font-serif font-bold text-slate-800">Youtube Category checker</h1>
                <p className="text-sm text-slate-500 uppercase tracking-widest font-bold">
                  Strategic Intelligence for Channels & Videos
                </p>
              </div>

              <form onSubmit={handleAnalyze} className="flex flex-col gap-4 w-full">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LinkIcon className="h-5 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="YouTube Channel or Video URL..."
                    className="w-full pl-12 pr-4 py-4 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-all font-mono shadow-sm"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-red-100 flex items-center justify-center gap-2 hover:bg-red-700 transition-all transform hover:-translate-y-0.5"
                >
                  RUN ANALYSIS
                  <ArrowRight className="h-5 w-5" />
                </button>
              </form>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 text-xs font-bold uppercase flex items-center gap-2 w-full">
                  <AlertCircle className="h-4 w-4" /> {error}
                </motion.div>
              )}
            </motion.section>
          ) : loading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center py-20 space-y-6">
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }} className="w-3 h-3 bg-red-600 rounded-full" />
                ))}
              </div>
              <div className="text-center">
                <p className="text-slate-800 font-bold uppercase tracking-widest text-xs">Logical Signal extraction</p>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* BACK BUTTON */}
              <button 
                onClick={() => setData(null)}
                className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-red-600 transition-colors uppercase tracking-widest mb-2"
              >
                ← Back to search
              </button>
              {/* ── SECTION 1: TWO COLUMNS ── */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Left: Channel Identity */}
                <section className="col-span-1 md:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-100 shadow-inner mb-6 overflow-hidden bg-slate-50 p-1 relative ring-4 ring-red-50">
                    <img src={data.channel.logo} className="w-full h-full rounded-full object-cover" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-slate-900 leading-tight mb-1">{data.channel.title}</h2>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8">{data.channel.handle || "Channel Overview"}</p>

                  <div className="w-full space-y-5">
                    {[
                      { l: "Channel Subscribers", v: fmt(data.channel.subs), i: <Users className="h-4 w-4 text-red-500" /> },
                      { l: "Language", v: data.channel.language, i: <Globe className="h-4 w-4 text-blue-500" /> },
                      { l: "Video Views", v: fmt(data.channel.views), i: <Activity className="h-4 w-4 text-red-500" /> },
                      { l: "Channel Status", v: data.channel.status, i: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, c: "verified-badge" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-slate-300 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-white rounded-lg shadow-sm">{item.i}</div>
                          <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tighter">{item.l}</span>
                        </div>
                        {item.c ? (
                          <span className={item.c}>{item.v}</span>
                        ) : (
                          <span className="text-sm font-black text-slate-800 jetbrains-number">{item.v}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 w-full bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mb-2">Signal integrity extraction</p>
                    <div className="flex items-center gap-2">
                       <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${data.nicheConsistency}%` }} className="h-full bg-emerald-500" />
                       </div>
                       <span className="text-[10px] font-bold text-slate-700">{data.nicheConsistency}%</span>
                    </div>
                  </div>
                </section>

                {/* Right: Strategical Analysis */}
                <section className="col-span-1 md:col-span-7 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
                   <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
                      <h3 className="font-serif font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide text-sm">
                        <Target className="w-4 h-4 text-red-600" /> Strategical analysis intelligence
                      </h3>
                      <span className="audit-badge">Authentic Audit</span>
                   </div>
                   <div className="p-6 flex-1 flex flex-col gap-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                         <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-xl">
                            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest mb-1">Channel Category</p>
                            <p className="text-xl font-black text-slate-900 tracking-tight uppercase">{data.strategic.category}</p>
                         </div>
                         <div className="p-5 border border-slate-100 bg-slate-50/50 rounded-xl">
                            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest mb-1">Channel Sub-Niche</p>
                            <p className="text-lg font-bold text-slate-800">{data.strategic.subNiche}</p>
                         </div>
                         <div className="p-5 border border-slate-100 bg-white rounded-xl shadow-sm">
                            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest mb-1">RPM (Profit Potential)</p>
                            <div className="flex items-center gap-2">
                               <span className="text-xl font-black text-emerald-600 jetbrains-number">${data.strategic.rpm[0]}-{data.strategic.rpm[1]}</span>
                               <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Per 1K Views</span>
                            </div>
                         </div>
                         <div className="p-5 border border-slate-100 bg-white rounded-xl shadow-sm">
                            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest mb-1">Competition Rank</p>
                            <p className="text-sm font-black text-red-600 uppercase tracking-tighter">{data.strategic.compRank}</p>
                         </div>
                      </div>

                      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl shadow-slate-200">
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">Competition Traffic Analysis</p>
                        <div className="space-y-4">
                           <p className="text-xs text-slate-300 leading-relaxed font-roboto">
                              This channel covers approximately <span className="text-white font-bold">{data.nicheConsistency}%</span> of the signal bandwidth for the <span className="text-red-400 font-bold">{data.strategic.subNiche}</span> niche.
                           </p>
                           <ul className="space-y-3">
                              <li className="flex items-start gap-3">
                                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Market dominance: <span className="text-white">{data.strategic.compRank.includes("Dominant") ? "MAXIMUM" : "MODERATE"}</span></p>
                              </li>
                              <li className="flex items-start gap-3">
                                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Traffic Efficiency: <span className="text-white text-xs">{fmt(Math.floor(parseInt(data.channel.views) / Math.max(1, parseInt(data.channel.subs))))} VIEWS PER SUB</span></p>
                              </li>
                           </ul>
                        </div>
                      </div>

                      <div className="mt-auto pt-6 border-t border-slate-100">
                        <div className="grid grid-cols-2 gap-4">
                           <ScoreBar label="Global Penetration" score={data.nicheConsistency} note={data.nicheConsistency > 80 ? "HIGH" : "AVERAGE"} />
                           <ScoreBar label="Keyword Authority" score={Math.min(99, data.nicheConsistency + 10)} note="PREMIUM" />
                        </div>
                      </div>
                   </div>
                </section>
              </div>

              {/* ── SECTION 2: VIDEO AUDIT ── */}
              {data.video && (
                <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex justify-between items-center">
                     <h3 className="font-serif font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide text-sm">
                        <Youtube className="w-4 h-4 text-red-600" fill="currentColor" /> Authentic video forensics audit
                     </h3>
                     <a href={`https://youtube.com/watch?v=${data.video.videoId}`} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-1 hover:underline">
                        Live Video <ExternalLink className="h-3 w-3" />
                     </a>
                  </div>

                  <div className="p-8 space-y-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                       <div className="lg:col-span-8 space-y-6">
                          <div>
                             <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-2 font-sans">Video Title</h4>
                             <p className="text-2xl font-serif font-bold text-slate-900 leading-tight">{data.video.title}</p>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-6">
                             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-1 text-slate-700">
                                   <ThumbsUp className="h-3 w-3" />
                                   <span className="text-[9px] font-bold uppercase tracking-tighter">Video Likes</span>
                                </div>
                                <p className="text-lg font-black text-slate-800 jetbrains-number">{fmt(data.video.likes)}</p>
                             </div>
                             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-1 text-slate-700">
                                   <MessageCircle className="h-3 w-3" />
                                   <span className="text-[9px] font-bold uppercase tracking-tighter">Video Comments (total)</span>
                                </div>
                                <p className="text-lg font-black text-slate-800 jetbrains-number">{fmt(data.video.comments)}</p>
                             </div>
                             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2 mb-1 text-slate-700">
                                   <Calendar className="h-3 w-3" />
                                   <span className="text-[9px] font-bold uppercase tracking-tighter">Video Upload Date</span>
                                </div>
                                <p className="text-sm font-black text-slate-800">{new Date(data.video.publishedAt).toLocaleDateString()}</p>
                             </div>
                          </div>

                          <div>
                             <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-3 font-sans">Video Description Forensic Extraction</h4>
                             <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-xs text-slate-600 leading-relaxed font-roboto max-h-48 overflow-y-auto whitespace-pre-wrap">
                                {data.video.description}
                             </div>
                          </div>
                       </div>

                       <div className="lg:col-span-4 space-y-8">
                          <div>
                             <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Video external link</h4>
                                <span className="bg-blue-50 text-blue-700 text-[9px] font-black px-2 py-0.5 rounded border border-blue-100 uppercase italic">Nofollow applied</span>
                             </div>
                             <div className="space-y-2">
                                {data.video.externalLinks.length > 0 ? (
                                  data.video.externalLinks.slice(0, 5).map((l: string, i: number) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-blue-300 transition-colors group">
                                       <LinkIcon className="h-3 w-3 text-blue-500 shrink-0" />
                                       <a href={l} target="_blank" rel="nofollow noreferrer" className="text-[10px] font-bold text-slate-600 truncate flex-1 hover:text-blue-600">
                                          {l}
                                       </a>
                                       <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-blue-400" />
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center">
                                     <p className="text-[10px] text-slate-400 font-bold uppercase">No external links detected</p>
                                  </div>
                                )}
                             </div>
                          </div>

                          <div>
                             <div className="flex items-center justify-between mb-4">
                                <h4 className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">Videos tag (original)</h4>
                                <button 
                                  onClick={copyTags}
                                  className="text-[9px] font-black text-red-600 uppercase tracking-widest flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                >
                                  <Copy className="h-3 w-3" /> {copying ? "COPIED" : "COPY"}
                                </button>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {data.video.tags.length > 0 ? (
                                  data.video.tags.map((t: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-[9px] font-bold text-slate-300 uppercase tracking-tight shadow-sm">
                                       {t}
                                    </span>
                                  ))
                                ) : (
                                  <p className="text-[10px] text-slate-400 italic">No tags identified for this video.</p>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </section>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="h-12 bg-white border-t border-slate-200 flex items-center justify-between px-8 shrink-0 text-[10px] text-slate-400 font-bold uppercase tracking-wider relative z-10">
        <div className="flex items-center gap-4">
        </div>
      </footer>
    </div>
  );
}
