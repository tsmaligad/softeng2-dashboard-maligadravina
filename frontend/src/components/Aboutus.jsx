import React from "react";
import Stickybar from "./Stickybar";
import { api } from "../utils/api";
import AboutDisplay from "./AboutDisplay";
import Footer from "./Footer";

const Aboutus = () => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [data, setData] = React.useState({ heading: "About Us", body: "", images: [] });

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.getAbout(); // { heading, body, images }
        setData(res || { heading: "About Us", body: "", images: [] });
      } catch (e) {
        setError(e.message || "Failed to load About page");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <Stickybar />
      <div className="pt-[72px]">
        <section className="bg-[#4A3600] h-[90px]" />
      </div>

      <main className="flex items-start justify-center bg-[#F5EFEF] ">

        <div className="mt-[70px] w-full max-w-[1200px] mx-auto px-4 pb-16">
          {loading ? (
            <div className="mt-8 text-sm text-[#332601]">Loading…</div>
          ) : error ? (
            <div className="mt-8 text-sm text-red-600">{error}</div>
          ) : (
            <AboutDisplay heading={data.heading} body={data.body} images={data.images} />
          )}
        </div>
        
      </main>
      <Footer />
    </>
    
  );
  
};

export default Aboutus;
