import React from "react";

const formatCurrency = (amount) => `$${amount.toLocaleString()}`;

function ProductCard({ product, reason, highlighted = false, animated = false, animationDelay = "0ms" }) {
  return (
    <article
      className={`product-card ${highlighted ? "product-card-highlight" : ""} ${
        animated ? "recommendation-card" : ""
      }`}
      style={{ animationDelay }}
    >
      <p className="product-category">{product.category}</p>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">{"\uD83D\uDCB0"} {formatCurrency(product.price)}</p>
      {reason ? <p className="product-reason">{"\uD83E\uDDE0"} Reason: {reason}</p> : null}
    </article>
  );
}

export default ProductCard;
