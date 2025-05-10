import { useQuery, gql } from '@apollo/client';
import React from 'react'
import { Link } from 'react-router-dom';

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
      price {
        id
        product_id
        amount
        currency_label
        currency_symbol
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
      <h1>{categoryProp === 'clothes' ? 'Clothes' : 'Tech'}</h1>
      <div className=' grid grid-cols-3 gap-6 place-items-center'>
        {data.products.map(product => {
          const kebabProductName = product.name.toLowerCase().replace(/\s+/g, '-');
          return (
            <Link data-testid={`product-${kebabProductName}`} to={`/product/${product.id}`} key={product.id}>
              {product.gallery.length > 0 && (

                <div className="relative w-80 h-80">
                  {product.inStock ? null : (
                    <h1 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl text-gray-200 px-2 py-1 rounded">
                      OUT OF STOCK
                    </h1>
                  )}
                  <img
                    alt={`Image of ${product.name}`}
                    src={product.gallery[0]?.image_url}
                    className={`w-80 h-80 object-cover ${!product.inStock ? 'grayscale opacity-50' : ''}`}
                  />
                </div>


              )}
              <h3>{product.name}</h3>
              <h3>
                {product.price.length > 0 ? `${product.price[0]?.currency_symbol}${product.price[0]?.amount.toFixed(2)}` : "No price available"}
              </h3>
            </Link>
          )
        }


        )}
      </div>
    </div>
  );
}

export default ProductListings