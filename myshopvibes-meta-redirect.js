document.addEventListener('DOMContentLoaded', function() {
    // Check if we are on the page intended to process the Facebook checkout redirect
    if (window.location.search.includes('products=') && window.location.pathname.includes('/facebook-checkout')) {
        
        console.log("myshopvibes.com Facebook Checkout Redirect Script Loaded.");

        // --- Configuration ---
        const baseCartURL = "https://www.myshopvibes.com/s/cart"; 

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
            
            // Format the value into the correct Square URL parameter string (ID:QTY,ID:QTY)
            const productsValue = metaProductsParam.replace(/%2C/g, ','); 
            const cartItemsString = productsValue.replace(/,/g, '%2C');
            
            console.log("Formatted products string for Square:", cartItemsString);

            if (cartItemsString.length > 0) {
                const finalRedirectURL = `${baseCartURL}?products=${cartItemsString}`;
                
                // *** NEW FIX: TWO-STEP REDIRECT ***
                // 1. Redirect to base cart URL first (to set cookies/session)
                console.log("STEP 1: Redirecting to base cart URL to establish session:", baseCartURL);
                window.location.replace(baseCartURL); 
                
                // 2. Immediately redirect to the final URL with the products parameter
                // We use a small timeout to let the browser process the first location change, 
                // but since the original page is gone, this relies on the browser history.
                // In practice, this will likely only work in the Square redirect environment.
                setTimeout(function() {
                    console.log("STEP 2: Redirecting to final cart URL:", finalRedirectURL);
                    window.location.replace(finalRedirectURL);
                }, 100); 
                
                // *** END NEW FIX ***

            } else {
                console.warn("No valid product data was parsed. Redirecting to base cart page.");
                window.location.replace(baseCartURL); 
            }

        } else {
            console.warn("No 'products' parameter found in URL. Redirecting to base cart page.");
            window.location.replace(baseCartURL); 
        }
    }
});
