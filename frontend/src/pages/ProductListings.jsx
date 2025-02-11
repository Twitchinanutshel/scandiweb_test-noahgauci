import { useQuery, gql } from '@apollo/client';
import React from 'react'
const GET_PRODUCTS = gql`
  query {
    products {
      id
      name
      inStock
      description
      category
      brand
    }
  }
`;

function ProductListings() {
  const { loading, error, data } = useQuery(GET_PRODUCTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Product Listings</h1>
      <ul>
        {data.products.map(product => (
          <li key={product.id}>
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Category: {product.category}</p>
            <p>Brand: {product.brand}</p>
            <p>In Stock: {product.inStock ? 'Yes' : 'No'}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductListings