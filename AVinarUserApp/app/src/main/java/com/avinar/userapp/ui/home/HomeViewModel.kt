package com.avinar.userapp.ui.home

import android.app.Application
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.avinar.userapp.data.model.Category
import com.avinar.userapp.data.model.Product
import com.avinar.userapp.data.network.RetrofitClient
import kotlinx.coroutines.launch

data class HomeState(
    val isLoading: Boolean = false,
    val categories: List<Category> = emptyList(),
    val products: List<Product> = emptyList(),
    val error: String? = null
)

class HomeViewModel(application: Application) : AndroidViewModel(application) {
    private val _state = mutableStateOf(HomeState())
    val state: State<HomeState> = _state
    private val apiService = RetrofitClient.getInstance(application)

    init {
        loadData()
    }

    fun loadData() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                // Fetch categories and products in parallel or sequence
                val categoriesResponse = apiService.getCategories()
                val productsResponse = apiService.getProducts()

                if (categoriesResponse.isSuccessful && productsResponse.isSuccessful) {
                    _state.value = HomeState(
                        categories = categoriesResponse.body()?.data ?: emptyList(),
                        products = productsResponse.body()?.data ?: emptyList()
                    )
                } else {
                    _state.value = HomeState(error = "Failed to load data")
                }
            } catch (e: Exception) {
                _state.value = HomeState(error = "Error: ${e.message}")
            }
        }
    }
}
