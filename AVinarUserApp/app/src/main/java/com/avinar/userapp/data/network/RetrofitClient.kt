package com.avinar.userapp.data.network

import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {
    // 10.0.2.2 is the localhost for Android Emulator
    private const val BASE_URL = "http://10.0.2.2:8000/api/v1/"

    private var retrofit: Retrofit? = null

    fun getInstance(context: Context): ApiService {
        if (retrofit == null) {
            val client = okhttp3.OkHttpClient.Builder()
                .addInterceptor(AuthInterceptor(context))
                .addInterceptor(okhttp3.logging.HttpLoggingInterceptor().apply {
                    level = okhttp3.logging.HttpLoggingInterceptor.Level.BODY
                })
                .build()

            retrofit = Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
        }
        return retrofit!!.create(ApiService::class.java)
    }
}
