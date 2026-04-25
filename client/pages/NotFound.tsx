import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="px-6 py-8">
        <div className="bg-gray-100 rounded-xl p-12 text-center min-h-[60vh] flex flex-col items-center justify-center">
          <h1 className="font-syne font-bold text-5xl text-black mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-6">
            Oops! Halaman tidak ditemukan
          </p>
          <p className="text-gray-500 mb-8">
            Halaman yang Anda cari tidak ada. Silakan kembali ke beranda atau
            jelajahi aplikasi lainnya.
          </p>
          <Link
            to="/"
            className="inline-block bg-black text-white font-syne font-bold py-3 px-8 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
