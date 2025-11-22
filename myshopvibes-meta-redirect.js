document.addEventListener('DOMContentLoaded', function() {
    // Target the specific intermediate redirect page
    if (window.location.search.includes('products=') && window.location.pathname.includes('/facebook-checkout')) {
        
        console.log("myshopvibes.com Facebook Checkout Redirect Script Loaded (API Attempt).");

        // --- Configuration ---
        const finalCartURL = "https://www.myshopvibes.com/s/cart"; 
        // This is a common internal endpoint for Square's cart API
        const apiEndpoint = "https://www.myshopvibes.com/ajax/api/JsonRPC/CommerceV2/?CommerceV2/[Cart::addItem]";

        // --- Function to parse a specific URL parameter ---
        function getUrlParameter(name) {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            var results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        };

        // --- Main Logic ---
        const metaProductsParam = getUrlParameter('products');

        if (metaProductsParam) {
            console.log("Found 'products' parameter from Meta:", metaProductsParam);
            
            // Format products from "ID:QTY,ID:QTY" into an array of objects for the API call
            const productPairs = metaProductsParam.replace(/%2C/g, ',').split(',');
            let apiItems = [];
            
            productPairs.forEach(pair => {
                const parts = pair.split(':');
                if (parts.length === 2 && parts[0] && parseInt(parts[1]) > 0) {
                    apiItems.push({
                        item_id: parts[0],
                        quantity: parseInt(parts[1])
                    });
                }
            });
            
            if (apiItems.length > 0) {
                console.log("Attempting to add items via internal Square API endpoint.");
                
                // Construct the data payload expected by the Cart::addItem RPC endpoint
                const apiPayload = {
                    method: 'CommerceV2::addItem',
                    params: [apiItems]
                };

                // --- API CALL TO ADD ITEMS ---
                fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(apiPayload)
                })
                .then(response => {
                    console.log('API response status:', response.status);
                    return response.json();
                })
                .then(data => {
                    // Success or failure of the API call doesn't matter much if the redirect works
                    console.log("API AddItem response received. Redirecting to cart.");
                    // After the API call, redirect to the cart page. The items should now be in the session.
                    window.location.replace(finalCartURL);
                })
                .catch(error => {
                    // This will likely catch the CSP violation if the fetch is blocked
                    console.error('API AddItem failed (likely CSP block or network error). Falling back to URL redirect.', error);
                    // Fallback to the original URL method, which at least redirects the user
                    window.location.replace(`${finalCartURL}?products=${metaProductsParam.replace(/,/g, '%2C')}`);
                });

            } else {
                console.warn("No valid product data parsed for API call. Redirecting to base cart page.");
                window.location.replace(finalCartURL); 
            }

        } else {
            console.warn("No 'products' parameter found. Redirecting to base cart page.");
            window.location.replace(finalCartURL); 
        }
    }
});
