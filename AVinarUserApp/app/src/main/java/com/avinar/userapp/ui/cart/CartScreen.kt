package com.avinar.userapp.ui.cart

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.rememberAsyncImagePainter
import com.avinar.userapp.data.model.CartItem

@Composable
fun CartScreen(
    viewModel: CartViewModel = viewModel()
) {
    val state = viewModel.state.value

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("Your Cart", style = MaterialTheme.typography.headlineMedium)
        Spacer(modifier = Modifier.height(16.dp))

        if (state.isLoading) {
             Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (state.cart == null || state.cart.cartItems.isEmpty()) {
             Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Your cart is empty")
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(state.cart.cartItems) { item ->
                    CartItemRow(item)
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text("Total: $${state.cart.totalCartPrice}", style = MaterialTheme.typography.titleLarge)
            Button(
                onClick = { viewModel.checkoutCash() }, 
                modifier = Modifier.fillMaxWidth(),
                enabled = !state.isLoading
            ) {
                if (state.isLoading) {
                     CircularProgressIndicator(modifier = Modifier.size(20.dp), color = MaterialTheme.colorScheme.onPrimary)
                } else {
                    Text("Checkout (Cash)")
                }
            }
            if (state.orderSuccess) {
                Text("Order Placed Successfully!", color = MaterialTheme.colorScheme.primary)
            }
        }
    }
}

@Composable
fun CartItemRow(item: CartItem) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Row(modifier = Modifier.padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
            Image(
                painter = rememberAsyncImagePainter(item.product.imageCover),
                contentDescription = item.product.title,
                modifier = Modifier.size(80.dp),
                contentScale = ContentScale.Crop
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(item.product.title, style = MaterialTheme.typography.titleMedium)
                Text("$${item.price} x ${item.quantity}", style = MaterialTheme.typography.bodyMedium)
                if (item.color != null) {
                    Text("Color: ${item.color}", style = MaterialTheme.typography.bodySmall)
                }
            }
        }
    }
}
