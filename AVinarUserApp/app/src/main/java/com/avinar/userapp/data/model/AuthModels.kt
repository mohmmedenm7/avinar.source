package com.avinar.userapp.data.model

data class LoginRequest(
    val email: String,
    val password: String
)

data class SignupRequest(
    val name: String,
    val email: String,
    val password: String,
    val passwordConfirm: String
)

data class AuthResponse(
    val status: String,
    val token: String?,
    val data: UserData?
)

data class UserData(
    val user: User
)

data class User(
    val _id: String,
    val name: String,
    val email: String,
    val role: String
)
