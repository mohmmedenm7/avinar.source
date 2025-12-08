package com.avinar.userapp.ui.cart

import android.app.Application
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.avinar.userapp.data.model.CartData
import com.avinar.userapp.data.network.RetrofitClient
import kotlinx.coroutines.launch

data class CartState(
    val isLoading: Boolean = false,
    val cart: CartData? = null,
    val error: String? = null,
    val orderSuccess: Boolean = false
)

class CartViewModel(application: Application) : AndroidViewModel(application) {
    private val _state = mutableStateOf(CartState())
    val state: State<CartState> = _state
    private val apiService = RetrofitClient.getInstance(application)

    init {
        loadCart()
    }

    fun loadCart() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                val response = apiService.getCart()
                if (response.isSuccessful) {
                    _state.value = _state.value.copy(cart = response.body()?.data, isLoading = false)
                } else {
                    // Handle 404 or other errors
                     _state.value = _state.value.copy(isLoading = false)
                }
            } catch (e: Exception) {
                _state.value = CartState(error = "Error: ${e.message}")
            }
        }
    }

    fun checkoutCash() {
        val cartId = state.value.cart?._id ?: return
        viewModelScope.launch {
             _state.value = _state.value.copy(isLoading = true, error = null)
             try {
                 val response = apiService.createCashOrder(cartId)
                 if (response.isSuccessful) {
                     _state.value = _state.value.copy(isLoading = false, orderSuccess = true, cart = null) // Clear cart locally
                 } else {
                     _state.value = _state.value.copy(isLoading = false, error = "Order failed: ${response.message()}")
                 }
             } catch (e: Exception) {
                 _state.value = _state.value.copy(isLoading = false, error = e.message)
             }
        }
    }
}
