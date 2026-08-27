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
   appending to this list; nothing else needs to change.

   `retired` marks a source whose URL has been verified dead rather than
   temporarily unreachable, with the date and the evidence. A retired source is
   still fetched, in case the institution restores it, but it is excluded from
   the "N of M answering" count and named separately. Reporting five permanent
   404s as though they were today's failures overstates the health of the wire
   in one direction and understates it in the other: it looks like a flaky
   pipeline rather than what it is, which is five institutions that stopped
   publishing RSS. Delete the field the moment a feed answers again. */

export default [
  // ---- US monetary policy and the rate that prices everything ----
  { id: "fed-monetary", name: "Federal Reserve", label: "Monetary policy", category: "rates",
    url: "https://www.federalreserve.gov/feeds/press_monetary.xml" },
  { id: "fed-all", name: "Federal Reserve", label: "Press releases", category: "rates",
    url: "https://www.federalreserve.gov/feeds/press_all.xml" },
  { id: "fed-speeches", name: "Federal Reserve", label: "Speeches", category: "rates",
    url: "https://www.federalreserve.gov/feeds/speeches.xml" },

  // Two sources were removed on 27 August 2026 for the same reason EIA and
  // Google News are absent: their real feeds are disallowed by robots.txt.
  //   Bank for International Settlements: configured URL 404s,
  //     bis.org/doclist/press_rlses.rss is robots-disallowed.
  // Bureau of Economic Analysis was removed on 27 August 2026. Its configured
  // feed returned 404 and its real feed at apps.bea.gov is robots-disallowed,
  // which is the same reason EIA and Google News are absent. Verified, not
  // assumed: both URLs were fetched.

  // ---- the data prints that move the curve ----
  { id: "bls", name: "Bureau of Labor Statistics", label: "Economic indicators", category: "macro",
    url: "https://www.bls.gov/feed/bls_latest.rss" },
  { id: "treasury", name: "U.S. Treasury", label: "Press releases", category: "rates",
    url: "https://home.treasury.gov/news/press-releases/feed",
    retired: "27 August 2026: /news/press-releases/feed, /rss and /rss/press.xml all return 404." },

  // ---- markets plumbing and enforcement ----
  { id: "sec", name: "Securities and Exchange Commission", label: "Press releases", category: "markets",
    url: "https://www.sec.gov/news/pressreleases.rss" },

  // ---- the rest of the world's central banks ----
  { id: "ecb", name: "European Central Bank", label: "Press", category: "rates",
    url: "https://www.ecb.europa.eu/rss/press.html" },
  { id: "boe", name: "Bank of England", label: "News", category: "rates",
    url: "https://www.bankofengland.co.uk/rss/news" },
  { id: "imf", name: "International Monetary Fund", label: "News", category: "macro",
    url: "https://www.imf.org/en/News/RSS?Language=ENG",
    retired: "27 August 2026: the RSS route serves HTML, not a feed." },

  // ---- the Gulf, which is the half nobody else aggregates ----
  { id: "uae-cb", name: "Central Bank of the UAE", label: "News", category: "gulf",
    url: "https://www.centralbank.ae/en/rss/news",
    retired: "27 August 2026: /en/rss/news returns 404." },
  { id: "dubai-media", name: "Dubai Media Office", label: "News", category: "gulf",
    url: "https://mediaoffice.ae/en/rss",
    retired: "27 August 2026: /en/rss returns a 404 page." },
  { id: "wam", name: "Emirates News Agency", label: "Business", category: "gulf",
    url: "https://www.wam.ae/en/rss/business",
    retired: "27 August 2026: /en/rss returns 200 and renders the homepage, a soft 404. Their RSS index no longer lists any feed." },
];
