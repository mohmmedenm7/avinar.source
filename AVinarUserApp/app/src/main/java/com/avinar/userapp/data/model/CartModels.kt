package com.avinar.userapp.data.model

data class CartResponse(
    val status: String,
    val data: CartData
)

data class CartData(
    val _id: String,
    val cartItems: List<CartItem>,
    val totalCartPrice: Double
)

data class CartItem(
    val _id: String,
    val product: Product,
    val quantity: Int,
    val color: String,
    val price: Double
)

data class AddToCartRequest(
    val productId: String,
    val quantity: Int = 1,
    val color: String? = null
)
