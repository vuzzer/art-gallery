import "./ProductListingSection.css";
import React, {useEffect, useState} from "react";

import { useData } from "../../../../contexts/DataProvider.js";
import { getCategoryWiseProducts } from "../../../../helpers/filter-functions/category";
import { getRatedProducts } from "../../../../helpers/filter-functions/ratings";
import { getPricedProducts } from "../../../../helpers/filter-functions/price";
import { getSortedProducts } from "../../../../helpers/filter-functions/sort";
import { getSearchedProducts } from "../../../../helpers/searchedProducts";

import { useUserData } from "../../../../contexts/UserDataProvider.js";

import { ProductCard } from "./ProductCard.jsx";

export const ProductListingSection = () => {
  const { state } = useData();
  const {
    isProductInCart,
    isProductInWishlist,
    wishlistHandler,
    addToCartHandler,
    cartLoading,
    buyNFT,
    fetchMintedProducts
  } = useUserData();

  const {
    allProductsFromApi,
    inputSearch,
    filters: { rating, categories, price, sort },
  } = state;

  const searchedProducts = getSearchedProducts(allProductsFromApi, inputSearch);

  const ratedProducts = getRatedProducts(searchedProducts, rating);

  const categoryProducts = getCategoryWiseProducts(ratedProducts, categories);

  const pricedProducts = getPricedProducts(categoryProducts, price);

  const sortedProducts = getSortedProducts(pricedProducts, sort);


  return (
    <div className="product-card-container">
    {!sortedProducts.length ? (
      <h2 className="no-products-found">
        Sorry, there are no matching products!
      </h2>
    ) : (
      sortedProducts.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          buyNFT={buyNFT}
          addToCartHandler={addToCartHandler}
          wishlistHandler={wishlistHandler}
          isProductInCart={isProductInCart}
          isProductInWishlist={isProductInWishlist}
          fetchMintedProducts={fetchMintedProducts}
          cartLoading={cartLoading}
        />
      ))
    )}
  </div>
  )
};
