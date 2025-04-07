import { useEffect, useState } from "react";
import { BsFillStarFill } from "react-icons/bs";
import Tilt from "react-parallax-tilt";
import { Link } from "react-router-dom";
import { AiOutlineHeart } from "react-icons/ai";
import { AiTwotoneHeart } from "react-icons/ai";


export const ProductCard = ({ product, buyNFT, addToCartHandler, wishlistHandler, isProductInCart, isProductInWishlist, fetchMintedProducts, cartLoading }) => {
  const [isMinted, setIsMinted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenId, setTokenId] = useState(null);

  const {
    _id,
    id,
    name,
    original_price,
    discounted_price,
    category_name,
    is_stock,
    rating,
    reviews,
    trending,
    img,
  } = product;

  useEffect(() => {
    const check = async () => {
      try {
        const {minted, id} = await fetchMintedProducts(name);
        setIsMinted(minted);
        setTokenId(id)
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, [name, fetchMintedProducts]);

  const buy = (id) => {
    if(id){
        buyNFT(id)
    }
  }

  return (
    <Tilt key={_id} tiltMaxAngleX={5} tiltMaxAngleY={5} glareEnable={false} transitionSpeed={2000} scale={1.02}>
      <div className="product-card">
        <Link to={`/product-details/${id}`}>
          <div className="product-card-image">
            <Tilt transitionSpeed={2000} tiltMaxAngleX={15} tiltMaxAngleY={15} scale={1.08}>
              <img src={img} alt="" />
            </Tilt>
          </div>
        </Link>

        <div className="product-card-details">
          <h3>{name}</h3>
          <p className="ratings">
            {rating} <BsFillStarFill color="orange" /> ({reviews} reviews)
          </p>
          <div className="price-container">
            <p className="original-price">${original_price}</p>
            <p className="discount-price">${discounted_price}</p>
          </div>
          <p>Genre: {category_name}</p>
          <div className="info">
            {!is_stock && <p className="out-of-stock">Out of stock</p>}
            {trending && <p className="trending">Trending</p>}
          </div>
        </div>

        <div className="product-card-buttons" style={{ width: 200, marginBottom: 10, marginTop: 5 }}>
          {!loading && isMinted && (
            <button onClick={() => buy(tokenId)} className="cart-btn" style={{ padding: 15, backgroundColor: "#03045e" }}>
              Buy with metamask
            </button>
          )}
        </div>

        <div className="product-card-buttons">
          <button disabled={cartLoading} onClick={() => addToCartHandler(product)} className="cart-btn">
            {!isProductInCart(product) ? "Add To Cart" : "Go to Cart"}
          </button>
          <button onClick={() => wishlistHandler(product)} className="wishlist-btn">
            {!isProductInWishlist(product) ? <AiOutlineHeart size={30} /> : <AiTwotoneHeart color="red" size={30} />}
          </button>
        </div>
      </div>
    </Tilt>
  );
};
