import React, { useMemo, useState } from "react";
import axios from "axios";
import products from "./products";
import ProductCard from "./components/ProductCard";
import "./App.css";

const filters = ["all", "phone", "laptop", "headphones", "smartwatch"];

function App() {
  const [input, setInput] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const recommendationReasonMap = useMemo(() => {
    return new Map(
      recommendations.map((item) => [item.name?.toLowerCase(), item.reason || "Fits your budget and matches category."])
    );
  }, [recommendations]);

  const visibleProducts = useMemo(() => {
    return activeFilter === "all"
      ? products
      : products.filter((product) => product.category === activeFilter);
  }, [activeFilter]);

  const highlightedProducts = useMemo(() => {
    return products.filter((product) => recommendationReasonMap.has(product.name.toLowerCase()));
  }, [recommendationReasonMap]);

  const getRecommendations = async () => {
    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const response = await axios.post("http://localhost:5000/recommend", {
        userInput: input.trim(),
        products
      });

      const data = response?.data?.recommendations;
      const parsed = Array.isArray(data) ? data : [];
      setRecommendations(parsed);
    } catch (requestError) {
      setRecommendations([]);
      setError("Could not fetch recommendations right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <section className="app-card">
        <h1>AI Product Recommendation System</h1>
        <p className="subtitle">Find products faster with budget and category-aware recommendations.</p>

        <div className="search-row">
          <input
            className="search-input"
            type="text"
            placeholder="e.g., phone under 500"
            value={input}
            onChange={(event) => setInput(event.target.value)}
          />
          <button className="search-button" onClick={getRecommendations} disabled={loading}>
            {loading ? "Searching..." : "Get Recommendations"}
          </button>
        </div>

        <div className="filter-row">
          {filters.map((filter) => (
            <button
              key={filter}
              className={`filter-button ${activeFilter === filter ? "active-filter" : ""}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-wrap">
            <div className="spinner" />
            <p>Fetching recommendations...</p>
          </div>
        ) : null}

        {error ? <p className="error-text">{error}</p> : null}

        <h2>Recommended Products</h2>
        {hasSearched && !loading && !error && highlightedProducts.length === 0 ? (
          <p className="empty-text">No products found</p>
        ) : (
          <div className="product-grid">
            {highlightedProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                reason={recommendationReasonMap.get(product.name.toLowerCase())}
                highlighted
                animated
                animationDelay={`${index * 80}ms`}
              />
            ))}
          </div>
        )}

        <h2>All Products</h2>
        <div className="product-grid">
          {visibleProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              highlighted={recommendationReasonMap.has(product.name.toLowerCase())}
              animated
              animationDelay={`${index * 45}ms`}
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
