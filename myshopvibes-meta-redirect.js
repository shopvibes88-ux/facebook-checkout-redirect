document.addEventListener('DOMContentLoaded', function() {
    // Check if we are on the page intended to process the Facebook checkout redirect
    // We only need to run on a page that has the 'products' parameter and is the correct intermediate page.
    if (window.location.search.includes('products=') && window.location.pathname.includes('/facebook-checkout')) {
        
        console.log("myshopvibes.com Facebook Checkout Redirect Script Loaded.");

        // --- Configuration ---
        // Square Online uses the /s/cart path with the ?products parameter
        const baseCartURL = "https://www.myshopvibes.com/s/cart"; 

        // --- Function to parse a specific URL parameter ---
        function getUrlParameter(name) {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            var results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        };

        // --- Main Logic ---
        let cartItemsString = '';

        // --- Primary Logic: Check for the 'products' parameter from Meta ---
        const metaProductsParam = getUrlParameter('products');

        if (metaProductsParam) {
            console.log("Found 'products' parameter from Meta:", metaProductsParam);
            
            // The value is already in the correct Square format (ID:QTY,ID:QTY)
            // We just need to ensure URL encoding is correct, specifically for the comma.
            const productsValue = metaProductsParam.replace(/%2C/g, ','); // Ensure %2C is handled
            
            // Re-encode the comma separator to be safe
            cartItemsString = productsValue.replace(/,/g, '%2C');
            
            console.log("Formatted products string for Square:", cartItemsString);

        } else {
            console.warn("No 'products' parameter found in URL. Cannot proceed with redirection.");
        }

        // --- Handle empty cart scenario if no items were parsed ---
        if (cartItemsString.length === 0) {
            console.warn("No valid product data was parsed from Meta's URL. Redirecting to base cart page.");
            // Redirect to the base cart, which will show an empty cart page.
            window.location.replace(baseCartURL); 
            return; 
        }

        // --- Construct the final Square Online cart URL for redirection ---
        // Square requires the 'products' parameter with the combined string.
        const finalRedirectURL = `${baseCartURL}?products=${cartItemsString}`;
        
        console.log("Successfully constructed Square Online cart URL. Redirecting to:", finalRedirectURL);
        
        // This is the final redirect!
        window.location.replace(finalRedirectURL); 
    
    } else {
        // console.log('Script is active but not on the target Facebook checkout page.');
    }
});
