document.addEventListener('DOMContentLoaded', function() {
    console.log("myshopvibes.com Facebook Checkout Redirect Script Loaded.");

    // --- Configuration ---
    // This is correctly set to your actual Square Online cart URL.
    const baseCartURL = "https://www.myshopvibes.com/cart"; 

    // --- Function to parse a specific URL parameter ---
    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    // --- Main Logic ---
    let cartItems = [];

    // --- Primary Logic: Check for the 'products' parameter from Meta ---
    const metaProductsParam = getUrlParameter('products');

    if (metaProductsParam) {
        console.log("Found 'products' parameter from Meta:", metaProductsParam);
        const productPairs = metaProductsParam.split(','); // Split by comma-separated items
        
        productPairs.forEach(pair => {
            const parts = pair.split(':'); // Split each item by colon (ID:Quantity)
            if (parts.length === 2) {
                const id = parts[0].trim(); // Get product ID
                const quantity = parseInt(parts[1].trim(), 10); // Get quantity, convert to integer

                if (id && !isNaN(quantity) && quantity > 0) {
                    cartItems.push({ id: id, quantity: quantity });
                } else {
                    console.warn("Skipping malformed product pair from 'products' parameter (ID/Quantity invalid):", pair);
                }
            } else {
                console.warn("Skipping malformed pair format in 'products' parameter (not ID:Quantity format):", pair);
            }
        });
        console.log("Parsed cart items from 'products' parameter:", cartItems);

    } else {
        // --- Fallback Logic: Check for JSON parameters (checkout_info, cart_data, items) ---
        // This will only run if the 'products' parameter is NOT found.
        console.warn("No 'products' parameter found in URL. Checking for JSON parameters (fallback method).");
        let metaCartData = '';
        const potentialMetaJsonParams = ['checkout_info', 'cart_data', 'items']; 
        
        for (const paramName of potentialMetaJsonParams) {
            const paramValue = getUrlParameter(paramName);
            if (paramValue) {
                metaCartData = paramValue;
                console.log(`Found Meta cart data using JSON parameter (fallback): ${paramName}`);
                break; 
            }
        }

        if (metaCartData) {
            try {
                const parsedData = JSON.parse(metaCartData);
                if (parsedData && parsedData.items && Array.isArray(parsedData.items)) {
                    cartItems = parsedData.items;
                    console.log("Parsed cart items from Meta JSON (fallback):", cartItems);
                } else {
                    console.warn("Meta JSON cart data did not match expected 'items' array structure (fallback).");
                }
            } catch (e) {
                console.error("Error parsing Meta JSON cart data (fallback):", e);
            }
        } else {
            console.warn("No recognized Meta cart data parameter found in URL (neither 'products' nor JSON).");
        }
    }

    // --- Handle empty cart scenario if no items were parsed ---
    if (cartItems.length === 0) {
        console.warn("No valid cart items were parsed from Meta's URL. Redirecting to base cart page.");
        window.location.replace(baseCartURL); 
        return; 
    }

    // --- Construct the final Square Online cart URL for redirection ---
    let squareCartParams = [];
    cartItems.forEach(item => {
        // Ensure 'id' is a string and 'quantity' is a positive number as expected by Square
        if (item.id && typeof item.id === 'string' && item.quantity && typeof item.quantity === 'number' && item.quantity > 0) {
            squareCartParams.push(`${item.id}=${item.quantity}`);
        } else {
            console.warn("Skipping malformed or invalid cart item during Square URL construction (ID/Quantity invalid):", item);
        }
    });

    if (squareCartParams.length > 0) {
        const finalRedirectURL = `${baseCartURL}?${squareCartParams.join('&')}`;
        console.log("Successfully constructed Square Online cart URL. Redirecting to:", finalRedirectURL);
        window.location.replace(finalRedirectURL); // This is the final redirect!
    } else {
        console.warn("After parsing, no valid cart items could be formatted for Square Online. Redirecting to base cart.");
        window.location.replace(baseCartURL); 
    }
});

```http://googleusercontent.com/image_generation_content/7