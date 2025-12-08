package com.avinar.userapp.data.network

import com.avinar.userapp.data.model.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponse>

    @POST("auth/signup")
    suspend fun signup(@Body request: SignupRequest): Response<AuthResponse>

    @GET("categories")
    suspend fun getCategories(): Response<CategoryResponse>

    @GET("products")
    suspend fun getProducts(): Response<ProductResponse>

    @GET("cart")
    suspend fun getCart(): Response<CartResponse>

    @POST("cart")
    suspend fun addToCart(@Body request: AddToCartRequest): Response<CartResponse>

    @POST("orders/{cartId}")
    suspend fun createCashOrder(@Path("cartId") cartId: String): Response<Void>
}
