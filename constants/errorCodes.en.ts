export const EN_MAP: Record<number, string> = {
    // ACCOUNT (200-299)
    208: "Username already exists!",
    209: "Email already exists!",
    220: "Old password is incorrect",
    500: "Internal server error!",

    // SYSTEM & NETWORK (6000-6999)
    6001: "Internal Server Error!",
    6005: "Something went wrong. Please try again later!", // 404 Bad request
    6006: "Internal server error - Invalid response structure!", // Invalid response structure from server

    // USERS (1000-1099)
    1000: "User not found",
    1001: "This email is not registered in our system",
    1002: "User already exists",
    1003: "Invalid login credentials",
    1004: "Access denied",
    1005: "Access forbidden",
    1006: "User does not have sufficient permissions",
    1007: "User account has been locked",
    1008: "User account has been disabled",
    1009: "Password has expired",
    1010: "User account has been disabled",
    1011: "User account has been locked",
    1012: "User account has been deleted",
    1013: "User account is pending verification",

    // OTP (2500-2599)
    2500: "OTP code has expired",
    2501: "OTP code has already been used",
    2502: "Please wait before resending OTP.",
    2504: "Invalid OTP code",
    2505: "OTP code has already been used",
    2509: "Error generating new OTP",
    2510: "Error resending OTP",
    2511: "No OTP code found for this email",
    2512: "OTP code mismatch. Please enter the latest code sent to your email",
    2513: "This OTP code has already been used. Please request a new one",
    2514: "OTP code has expired. Please request a new one",
    2515: "Error verifying OTP",

    // ORDERS & CHECKOUT (3000-3099)
    3001: "Order value is too large. Please reduce the number of products in your order!",

    // WISHLIST (3000-3099 range overlapping in BE)
    3005: "Wishlist name already exists in your list",

    // CART & STOCK (9400-9499)
    9402: "Product is out of stock or insufficient quantity!",

    // CHECKOUT
    110113: "Information payment has expired. Please retry!",

    // OTHER
    895: "You are only allowed a maximum of 3 bank accounts",
    70056: "Cannot delete the default bank account. Please set another account as default first.",
} as const;
