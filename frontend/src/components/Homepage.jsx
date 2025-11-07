import React from "react";
import Stickybar from "./Stickybar";
import { Link } from "react-router-dom";
import heroFallback from "../assets/homepagepic.png";
import Footer from "./Footer";
import { api } from "../utils/api";
import Carousel from "react-bootstrap/Carousel";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";


/* Local error boundary so the page never hard-crashes */
class PageBoundary extends React.Component {
  state = { err: null };
  static getDerivedStateFromError(err) {
    return { err };
  }
  componentDidCatch(err, info) {
    console.error("[Homepage boundary]", err, info);
  }
  render() {
    if (this.state.err) {
      return (
        <div className="w-full min-h-screen bg-[#F5EFEF]">
          <Stickybar />
          <section id="home">
            <img src={heroFallback} alt="Hero" className="w-full h-screen object-cover" />
          </section>
          <div className="py-10 px-6 text-red-600">
            Homepage error: {String(this.state.err)}
          </div>
          <Footer />
        </div>
      );
    }
    return this.props.children;
  }
}

/* ✅ NEW Hero Carousel */
/* ✅ HERO CAROUSEL (Bootstrap default arrows + indicators + auto-slide) */
function HeroCarousel({ images }) {
  const [index, setIndex] = React.useState(0);
  const handleSelect = (selectedIndex) => setIndex(selectedIndex);

  return (
    <Carousel
      activeIndex={index}
      onSelect={handleSelect}
      interval={4000}
      controls
      indicators
      fade
      className="w-full h-screen relative"
      prevIcon={<i className="bi bi-chevron-left text-white text-5xl drop-shadow-lg"></i>}
      nextIcon={<i className="bi bi-chevron-right text-white text-5xl drop-shadow-lg"></i>}
    >
      {images.map((url, i) => (
        <Carousel.Item key={i} className="w-full h-screen">
          <img
            src={url || heroFallback}
            alt=""
            className="w-full h-screen object-cover brightness-[0.6]"
            onError={(e) => (e.currentTarget.src = heroFallback)}
          />
        </Carousel.Item>
      ))}
    </Carousel>
  );
}


const API_BASE = "http://localhost:8080";
const abs = (u) => (u ? (u.startsWith("http") ? u : `${API_BASE}${u}`) : null);

export default function Homepage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const [heroUrl, setHeroUrl] = React.useState("");
  const [heroUrls, setHeroUrls] = React.useState([]);

  const [featuredIds, setFeaturedIds] = React.useState([]);
  const [faqIds, setFaqIds] = React.useState([]);

  const [allProducts, setAllProducts] = React.useState([]);
  const [allFaqs, setAllFaqs] = React.useState([]);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [conf, productsRes, faqsRes] = await Promise.all([
          api.getHomepage(),
          api.getProducts(),
          api.getFaqs(),
        ]);

        setHeroUrl(conf?.hero_url || "");
        setHeroUrls(Array.isArray(conf?.hero_urls) ? conf.hero_urls : []);

        setFeaturedIds(Array.isArray(conf?.featured_product_ids) ? conf.featured_product_ids : []);
        setFaqIds(Array.isArray(conf?.faq_ids) ? conf.faq_ids : []);

        const rawProds = Array.isArray(productsRes?.items)
          ? productsRes.items
          : Array.isArray(productsRes)
          ? productsRes
          : [];

        setAllProducts(
          rawProds
            .map((p) => ({
              id: p?.id,
              name: p?.name ?? "",
              price: Number(p?.price ?? p?.base_price ?? 0),
              image_url: abs(p?.image_url),
            }))
            .filter((p) => p.id != null)
        );

        const rawFaqs = Array.isArray(faqsRes?.items)
          ? faqsRes.items
          : Array.isArray(faqsRes)
          ? faqsRes
          : [];

        setAllFaqs(rawFaqs.filter((f) => f && f.id != null));
      } catch (e) {
        setError(e.message || "Failed to load homepage");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const featuredProducts = React.useMemo(() => {
    const set = new Set(featuredIds.map(Number));
    return allProducts.filter((p) => set.has(Number(p.id)));
  }, [featuredIds, allProducts]);

  const selectedFaqs = React.useMemo(() => {
    const set = new Set(faqIds.map(Number));
    return allFaqs.filter((f) => set.has(Number(f.id)));
  }, [faqIds, allFaqs]);

  const heroSrc = heroUrl || heroFallback;

  return (
    <PageBoundary>
      {loading && (
        <div className="w-full min-h-screen bg-[#F5EFEF]">
          <Stickybar />
          <section id="home">
            <img src={heroFallback} className="w-full h-screen object-cover" />
          </section>
          <div className="py-10 px-6 text-[#332601]">Loading…</div>
          <Footer />
        </div>
      )}

      {!loading && error && (
        <div className="w-full min-h-screen bg-[#F5EFEF]">
          <Stickybar />
          <section id="home">
            <img src={heroFallback} className="w-full h-screen object-cover" />
          </section>
          <div className="py-10 px-6 text-red-600">{error}</div>
          <Footer />
        </div>
      )}

      {!loading && !error && (
        <div className="w-full min-h-screen bg-[#F5EFEF]">
          <Stickybar />

          {/* ✅ HERO SECTION (Only part that changed) */}
          <section id="home" className="relative w-full h-screen">
            {heroUrls.length > 0 ? (
              <HeroCarousel images={heroUrls} />
            ) : (
              <img src={heroSrc} className="w-full h-screen object-cover" />
            )}
          </section>

          {/* ✅ EVERYTHING BELOW IS UNTOUCHED */}
          <section className="bg-[#4A3600] mt-[-5px]">
            <div className="h-[95px] flex items-center justify-center">
              <h2 className="mt-[8px] text-3xl font-semibold text-white tracking-normal">
                Featured products
              </h2>
            </div>
          </section>

          {/* ⭐️ FEATURED GRID — 4 fixed per row */}
          <section className="bg-[#F5EFEF] py-[60px] mt-[50px]">
  <div className="w-full max-w-[1200px] mx-auto px-6">
    <div className="grid grid-cols-4 gap-[30px]">
      {featuredProducts.map((p) => (
        <article key={p.id}>
          <Link to={`/products-page/${p.id}`} className="block no-underline">
            <figure className="m-0">

              {/* ✅ Square image with border ON the image; no Tailwind tricks */}
              <div className="aspect-square w-full overflow-hidden border-[3px] border-[#644A07]">
  <img
    src={p.image_url || "/placeholder.png"}
    alt={p.name || "Product"}
    className="w-full h-full object-cover"
    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
  />
</div>




              {/* ✅ Text unchanged */}
              <figcaption className="mt-3 text-left">
                <h3 className="text-[12px] leading-tight text-[#665132]">
                  {p.name}
                </h3>
                <p className="mt-1 text-[15px] font-semibold text-[#332601]">
                  From ₱{p.price.toFixed(2)} PHP
                </p>
              </figcaption>
            </figure>
          </Link>
        </article>
      ))}
    </div>

    {/* ✅ View all with hover underline */}
    <div className="mt-[60px] mb-[90px] flex justify-center">
    <Link
  to="/products-page"
  className="hover:!no-underline text-sm text-[#332601] underline text-decoration-underline underline-offset-2 decoration-[#332601] [text-decoration-thickness:1px]"
>
  View all
</Link>

</div>

  </div>
</section>


          <section className="bg-[#4A3600]">
            <div className="h-[95px] flex items-center justify-center">
              <h2 className="m-0 text-lg font-semibold text-white">Frequently Asked Questions</h2>
            </div>
          </section>

          <section className="bg-[#F5EFEF] pb-[90px]">
            <div className="mt-[80px] space-y-[20px] max-w-[860px] mx-auto px-4">
              {selectedFaqs.map((f, idx) => (
                <details
                  key={f.id}
                  className={`group bg-[#FBF3F3] border-b border-[#decdb9] ${idx > 0 ? "mt-10" : ""}`}
                >
                  <summary className="list-none cursor-pointer flex items-center justify-between px-[20px] py-[30px] text-[#1f1a14]">
                    <span className="text-[18px] md:text-[20px] font-medium">{f.q}</span>

                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="transition-transform duration-200 group-open:rotate-180 text-[#1f1a14]"
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </summary>

                  <div className="px-[40px] mt-[-20px] mb-[20px] pb-6 text-[15px] text-[#332601]/90">
                    {f.a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          <Footer />
        </div>
      )}
    </PageBoundary>
  );
}
