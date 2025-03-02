import { useQuery, gql } from '@apollo/client';
import React from 'react'
const GET_PRODUCTS = gql`
  query GetProducts($category: String!) {
    products(category: $category) {
      id
      name
      inStock
      description
      category
      brand
      gallery {
        id
        product_id
        image_url
      }
    }
  }
`;

function ProductListings({ categoryProp }) {
  const { loading, error, data } = useQuery(GET_PRODUCTS, {
    variables: { category: categoryProp }
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Product Listings</h1>
      <div>
        {data.products.map(product => (
          <div key={product.id} className=''>
            {product.gallery.map(img => (
              <img key={img.product_id} src={img.image_url} />
            ))}
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p>Category: {product.category}</p>
            <p>Brand: {product.brand}</p>
            <p>In Stock: {product.inStock ? 'Yes' : 'No'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductListings