package com.avinar.userapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.avinar.userapp.data.local.TokenManager
import com.avinar.userapp.ui.auth.LoginScreen
import com.avinar.userapp.ui.auth.SignupScreen
import com.avinar.userapp.ui.cart.CartScreen
import com.avinar.userapp.ui.home.HomeScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                AppNavigation(this)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppNavigation(context: ComponentActivity) {
    val navController = rememberNavController()
    val startDestination = if (TokenManager.getToken(context) != null) "home" else "login"

    Scaffold(
        bottomBar = {
             // Simple bottom bar for navigation
             NavigationBar {
                 NavigationBarItem(
                     selected = false,
                     onClick = { navController.navigate("home") },
                     icon = { Text("🏠") },
                     label = { Text("Home") }
                 )
                 NavigationBarItem(
                     selected = false,
                     onClick = { navController.navigate("cart") },
                     icon = { Text("🛒") },
                     label = { Text("Cart") }
                 )
                 NavigationBarItem(
                     selected = false,
                     onClick = { 
                         TokenManager.clearToken(context)
                         navController.navigate("login") {
                             popUpTo("login") { inclusive = true }
                         }
                     },
                     icon = { Text("🚪") },
                     label = { Text("Logout") }
                 )
             }
        }
    ) { innerPadding ->
        NavHost(navController = navController, startDestination = startDestination, modifier = Modifier.padding(innerPadding)) {
            composable("login") {
                LoginScreen(
                    onLoginSuccess = {
                        // Save token logic should be in ViewModel or here
                        // For now assuming ViewModel handled it or we pass a callback that saves it
                        navController.navigate("home") {
                            popUpTo("login") { inclusive = true }
                        }
                    },
                    onNavigateToSignup = { navController.navigate("signup") }
                )
            }
            composable("signup") {
                SignupScreen(
                    onSignupSuccess = {
                         navController.navigate("home") {
                            popUpTo("login") { inclusive = true }
                        }
                    },
                    onNavigateToLogin = { navController.navigate("login") }
                )
            }
            composable("home") {
                HomeScreen()
            }
            composable("cart") {
                CartScreen()
            }
        }
    }
}
