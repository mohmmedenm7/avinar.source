package com.avinar.userapp.ui.auth

import android.app.Application
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.avinar.userapp.data.local.TokenManager
import com.avinar.userapp.data.model.LoginRequest
import com.avinar.userapp.data.model.SignupRequest
import com.avinar.userapp.data.model.User
import com.avinar.userapp.data.network.RetrofitClient
import kotlinx.coroutines.launch

data class AuthState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val error: String? = null,
    val isSuccess: Boolean = false
)

class AuthViewModel(application: Application) : AndroidViewModel(application) {
    private val _state = mutableStateOf(AuthState())
    val state: State<AuthState> = _state
    private val apiService = RetrofitClient.getInstance(application)

    fun login(email: String, password: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                val response = apiService.login(LoginRequest(email, password))
                if (response.isSuccessful && response.body()?.token != null) {
                    val token = response.body()!!.token!!
                    TokenManager.saveToken(getApplication(), token)
                    _state.value = AuthState(isSuccess = true, user = response.body()?.data?.user)
                } else {
                    _state.value = AuthState(error = "Login failed: ${response.message()}")
                }
            } catch (e: Exception) {
                _state.value = AuthState(error = "Error: ${e.message}")
            }
        }
    }

    fun signup(name: String, email: String, password: String, passwordConfirm: String) {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                val response = apiService.signup(SignupRequest(name, email, password, passwordConfirm))
                if (response.isSuccessful && response.body()?.token != null) {
                    val token = response.body()!!.token!!
                    TokenManager.saveToken(getApplication(), token)
                    _state.value = AuthState(isSuccess = true, user = response.body()?.data?.user)
                } else {
                    _state.value = AuthState(error = "Signup failed: ${response.message()}")
                }
            } catch (e: Exception) {
                _state.value = AuthState(error = "Error: ${e.message}")
            }
        }
    }
}
