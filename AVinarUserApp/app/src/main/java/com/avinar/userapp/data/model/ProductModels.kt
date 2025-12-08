package com.avinar.userapp.data.model

data class CategoryResponse(
    val results: Int,
    val data: List<Category>
)

data class Category(
    val _id: String,
    val name: String,
    val image: String?
)

data class ProductResponse(
    val results: Int,
    val data: List<Product>
)

data class Product(
    val _id: String,
    val title: String,
    val description: String,
    val price: Double,
    val imageCover: String,
    val quantity: Int,
    val sold: Int,
    val ratingsAverage: Double,
    val ratingsQuantity: Int
)
