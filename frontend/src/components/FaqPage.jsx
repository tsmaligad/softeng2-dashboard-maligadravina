import React from "react";
import Stickybar from "./Stickybar";
import Footer from "./Footer";
import { api } from "../utils/api";

const FaqPage = () => {
  const [faqs, setFaqs] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await api.getFaqs();
        const arr = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
        arr.sort(
          (a, b) =>
            (Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)) ||
            (Number(a.id ?? 0) - Number(b.id ?? 0))
        );
        setFaqs(arr);
      } catch (e) {
        setError(e.message || "Failed to load FAQs");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Stickybar />
      {/* ✅ keep your header exactly the same */}
      <div className="pt-[72px]">
        <section className="bg-[#4A3600] h-[90px] " />
      </div>

      <main className="flex items-start justify-center bg-[#F5EFEF]">

      <div className="w-full max-w-[1200px] mx-auto px-4 mb-[120px]">

          <h1 className="text-5xl font-kapakana italic text-left text-[#332601] mt-[70px] mb-4">
            Frequently Asked Questions
          </h1>
          <hr className="border-t border-[#8b7760]" />

          {/* ▼ Accordion block with the same CSS as Homepage FAQs */}
          {loading && (
            <div className="mt-[40px] text-sm text-[#332601]">Loading…</div>
          )}
          {error && (
            <div className="mt-[40px] text-sm text-red-600">{error}</div>
          )}

          {!loading && !error && (
            <section className="bg-transparent pb-[20px]">
              <div className="mt-[40px] space-y-[20px] max-w-[860px] mx-auto px-0">
                {faqs.length === 0 ? (
                  <div className="text-sm text-[#332601]">No FAQs yet.</div>
                ) : (
                  faqs.map((f, idx) => (
                    <details
                      key={f.id}
                      className={`group bg-[#FBF3F3] border-b border-[#decdb9] ${
                        idx > 0 ? "mt-10" : ""
                      }`}
                    >
                      <summary className="list-none cursor-pointer flex items-center justify-between px-[20px] py-[30px] text-[#1f1a14]">
                        <span className="text-[18px] md:text-[20px] font-medium">
                          {f.q}
                        </span>
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

                      <div className="px-[40px] mt-[-20px] mb-[20px] pb-6 text-[15px] text-[#332601]/90 whitespace-pre-line">
                        {f.a}
                      </div>
                    </details>
                  ))
                )}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default FaqPage;
