/* The wire carries primary sources: the release itself, not somebody's summary
   of it. Every one of these is a government, central bank or regulator feed,
   which means it is public domain or freely redistributable, and it means the
   headline reaching this site is the one the institution actually wrote.

   Wire services and newspapers are deliberately absent. Their headlines are
   licensed, their photographs more so, and a site that republishes them is an
   aggregator competing with ten thousand other aggregators. This set is not
   aggregated anywhere else for a reader who owns property in the Gulf and
   holds markets exposure abroad, which is the whole point.

   A feed that fails is skipped and reported on the status panel. Add one by
   appending to this list; nothing else needs to change. */

export default [
  // ---- US monetary policy and the rate that prices everything ----
  { id: "fed-monetary", name: "Federal Reserve", label: "Monetary policy", category: "rates",
    url: "https://www.federalreserve.gov/feeds/press_monetary.xml" },
  { id: "fed-all", name: "Federal Reserve", label: "Press releases", category: "rates",
    url: "https://www.federalreserve.gov/feeds/press_all.xml" },
  { id: "fed-speeches", name: "Federal Reserve", label: "Speeches", category: "rates",
    url: "https://www.federalreserve.gov/feeds/speeches.xml" },

  // Bureau of Economic Analysis was removed on 27 August 2026. Its configured
  // feed returned 404 and its real feed at apps.bea.gov is robots-disallowed,
  // which is the same reason EIA and Google News are absent. Verified, not
  // assumed: both URLs were fetched.

  // ---- the data prints that move the curve ----
  { id: "bls", name: "Bureau of Labor Statistics", label: "Economic indicators", category: "macro",
    url: "https://www.bls.gov/feed/bls_latest.rss" },
  { id: "treasury", name: "U.S. Treasury", label: "Press releases", category: "rates",
    url: "https://home.treasury.gov/news/press-releases/feed" },

  // ---- markets plumbing and enforcement ----
  { id: "sec", name: "Securities and Exchange Commission", label: "Press releases", category: "markets",
    url: "https://www.sec.gov/news/pressreleases.rss" },

  // ---- the rest of the world's central banks ----
  { id: "ecb", name: "European Central Bank", label: "Press", category: "rates",
    url: "https://www.ecb.europa.eu/rss/press.html" },
  { id: "boe", name: "Bank of England", label: "News", category: "rates",
    url: "https://www.bankofengland.co.uk/rss/news" },
  { id: "bis", name: "Bank for International Settlements", label: "Press releases", category: "markets",
    url: "https://www.bis.org/list/press_rlses/rss.xml" },
  { id: "imf", name: "International Monetary Fund", label: "News", category: "macro",
    url: "https://www.imf.org/en/News/RSS?Language=ENG" },

  // ---- the Gulf, which is the half nobody else aggregates ----
  { id: "uae-cb", name: "Central Bank of the UAE", label: "News", category: "gulf",
    url: "https://www.centralbank.ae/en/rss/news" },
  { id: "dubai-media", name: "Dubai Media Office", label: "News", category: "gulf",
    url: "https://mediaoffice.ae/en/rss" },
  { id: "wam", name: "Emirates News Agency", label: "Business", category: "gulf",
    url: "https://www.wam.ae/en/rss/business" },
];
