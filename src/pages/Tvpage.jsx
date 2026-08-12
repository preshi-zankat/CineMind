import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TVDetail from "../components/TVDetail";
import { getTVDetails } from "../lib/tmdb";


export default function TVPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchShow() {
      setLoading(true);
      setError(false);
      try {
        const data = await getTVDetails(id);
        if (!cancelled) setShow(data);
      } catch (err) {
        console.error("Failed to load TV show:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchShow();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p style={{ fontFamily: "Inter" }}>Loading show details...</p>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p style={{ fontFamily: "Inter" }}>Failed to load show details.</p>
        <button
          onClick={() => navigate("/tv")}
          className="px-6 py-2 rounded-full font-semibold"
          style={{ background: "#7C3AED", color: "white" }}
        >
          Back to TV Shows
        </button>
      </div>
    );
  }

  return <TVDetail show={show} onBack={() => navigate(-1)} />;
}