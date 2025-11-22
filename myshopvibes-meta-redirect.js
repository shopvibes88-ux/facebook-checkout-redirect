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
                
                console.log("Successfully constructed Square Online cart URL. Initiating click redirect:", finalRedirectURL);

                // *** FIX FOR: Uncaught (in promise) Error: Missing cart cookie ***
                // Simulate a user click to help Square's session/cookie setup.
                
                const link = document.createElement('a');
                link.href = finalRedirectURL;
                link.style.display = 'none'; // Keep it hidden
                document.body.appendChild(link);
                
                // Use a short delay before clicking to ensure all DOM elements are stable
                setTimeout(function() {
                    link.click();
                    document.body.removeChild(link);
                }, 100); 
                
                // If the simulated click fails, we fall back to a standard redirect after 1 second
                setTimeout(function() {
                    console.warn("Simulated click failed to redirect. Falling back to window.location.replace.");
                    window.location.replace(finalRedirectURL);
                }, 1000);
                
                // *** END FIX ***

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
