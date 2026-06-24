const http = require('http');
const https = require('https');

async function fetchProducts() {
  const supplierId = "6a3654577d11e405b83317c5"; // Fallback ID from ViewAllProduct
  const url = `https://seller.inquirybazaar.com/api/product?supplierId=${supplierId}`;
  
  try {
    const res = await fetch(url);
    const json = await res.json();
    const products = json.data || [];
    if (products.length > 0) {
      const p = products[0];
      console.log("Product Name:", p.name || p.productName);
      console.log("Media Array:", JSON.stringify(p.media, null, 2));
      console.log("Primary Image:", JSON.stringify(p.primaryImage, null, 2));
    } else {
      console.log("No products found.");
    }
  } catch (err) {
    console.error("Error:", err);
  }
}

fetchProducts();
