import { useQuery, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';

const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      name
      inStock
      description
      category
      brand
      gallery {
        id
        image_url
      }
      price {
        amount
        currency_symbol
      }
      attributes {
        id
        name
        type
        items {
          id
          item_id
          displayValue
          value
      }
    }
    }
  }
`;

function ProductDetails() {
  const { addToCart } = useCart();
  const [selectedAttributes, setSelectedAttributes] = useState({});

  const handleAddToCart = () => {
    if (Object.keys(selectedAttributes).length !== product.attributes.length) {
      alert('Please select all options');
      return;
    }
    addToCart(product, selectedAttributes);
  };

  const { id } = useParams();
  const { loading, error, data } = useQuery(GET_PRODUCT, { variables: { id } });

  const [mainImage, setMainImage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (data && data.product?.gallery.length > 0 && !mainImage) {
      setMainImage(data.product.gallery[0].image_url);
    }
  }, [data, mainImage]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const product = data.product;

  const goToPrevImage = () => {
    const prevIndex = (currentIndex - 1 + product.gallery.length) % product.gallery.length;
    setMainImage(product.gallery[prevIndex].image_url);
    setCurrentIndex(prevIndex);
  };

  const goToNextImage = () => {
    const nextIndex = (currentIndex + 1) % product.gallery.length;
    setMainImage(product.gallery[nextIndex].image_url);
    setCurrentIndex(nextIndex);
  };

  return (
    <div className="flex justify-center space-x-4">
      <div className="flex space-x-4" data-testid="product-gallery">
        <div className="flex flex-col space-y-5 overflow-y-auto max-h-[400px]">
          {product.gallery.map((product_image) => (
            <img
              key={product_image.id}
              src={product_image.image_url}
              alt="product thumbnail"
              className="w-16 h-16 cursor-pointer object-cover"
              onClick={() => {
                setMainImage(product_image.image_url);
                setCurrentIndex(product.gallery.findIndex(image => image.image_url === product_image.image_url));
              }}
            />
          ))}
        </div>
        <div className="relative">
          <img
            src={mainImage}
            alt={`Main image of ${product.name}`}
            className="w-[400px] h-[400px] object-cover"
          />
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2"
            onClick={goToPrevImage}
          >
            &#8592;
          </button>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 p-2"
            onClick={goToNextImage}
          >
            &#8594;
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-2 items-start max-w-[320px]">
        <h1>{product.name}</h1>

        <div className="flex flex-col space-y-4">
          {product.attributes.map((product_attribute) => {
            const kebabAttributeName = product_attribute.name.toLowerCase().replace(/\s+/g, '-');
            return (
              <div key={product_attribute.id} data-testid={`product-attribute-${kebabAttributeName}`}>
                <p className="font-semibold">{product_attribute.name}:</p>
                <div className="flex space-x-2 mt-1">
                  {product_attribute.items.map((item) => {
                    const isSelected = selectedAttributes[product_attribute.name] === item.value;
                    return (
                      <button
                        key={item.id}
                        className={`border px-3 py-1 rounded ${isSelected ? 'bg-black text-white' : 'bg-white text-black'}`}
                        onClick={() =>
                          setSelectedAttributes((prev) => ({
                            ...prev,
                            [product_attribute.name]: item.value,
                          }))
                        }
                        disabled={!product.inStock}
                      >
                        {product_attribute.type === 'swatch' ? (
                          <span
                            className="block w-6 h-6 rounded"
                            style={{ backgroundColor: item.value }}
                          ></span>
                        ) : (
                          item.displayValue
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <p>Price:</p>
        <p>
          {product.price[0]?.currency_symbol}
          {product.price[0]?.amount.toFixed(2)}
        </p>

        <button
          onClick={handleAddToCart}
          className="py-3 w-full bg-green-500"
          data-testid="add-to-cart"
        >
          Add to Cart
        </button>

        <p
          className="break-words overflow-y-auto max-h-[180px]"
          data-testid="product-description"
        >
          {product.description}
        </p>
      </div>
    </div>
  );
}

export default ProductDetails;