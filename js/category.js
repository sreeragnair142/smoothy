   document.addEventListener('DOMContentLoaded', function() {

            const API_BASE_URL = 'http://localhost:5000/api';
            const menuContainer = document.getElementById('dynamic-menu-container');

            // Helper function to get the correct image URL
            const getImageUrl = (imagePath) => {
                if (!imagePath) return 'images/resource/menu-11.jpg'; // Default placeholder
                if (imagePath.startsWith('http')) return imagePath;
                return `${API_BASE_URL}${imagePath}`;
            };
            
            // --- Main function to load the menu ---
            async function loadDynamicMenu() {
                try {
                    // 1. Fetch all active categories
                    const response = await fetch(`${API_BASE_URL}/categories`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    let categories = await response.json();
                    
                    // Filter for active categories, just in case the API doesn't
                    const activeCategories = categories.filter(cat => cat.isActive !== false);

                    if (activeCategories.length === 0) {
                        menuContainer.innerHTML = '<p class="text-center">No smoothie categories found at the moment. Please check back later!</p>';
                        return;
                    }

                    // 2. Build the HTML for tabs and tab content panes
                    let tabButtonsHTML = '<ul class="nav nav-tabs justify-content-center" id="smoothiesTab" role="tablist">';
                    let tabContentHTML = '<div class="tab-content" id="smoothiesTabContent">';

                    for (let i = 0; i < activeCategories.length; i++) {
                        const category = activeCategories[i];
                        const categoryId = category.id || category._id;
                        const isActive = i === 0 ? 'active' : ''; // Make the first tab active

                        // Build the tab button
                        tabButtonsHTML += `
                            <li class="nav-item" role="presentation">
                                <button class="nav-link ${isActive}" id="tab-${categoryId}" data-toggle="tab" data-target="#content-${categoryId}" type="button" role="tab" aria-controls="content-${categoryId}" aria-selected="${i === 0}">
                                    ${category.name}
                                </button>
                            </li>
                        `;
                        
                        // Build the content pane shell with a placeholder for smoothies
                        tabContentHTML += `
                            <div class="tab-pane fade show ${isActive}" id="content-${categoryId}" role="tabpanel" aria-labelledby="tab-${categoryId}">
                                <div class="row clearfix" id="smoothies-for-${categoryId}">
                                    <p class="text-center col-12">Loading ${category.name} smoothies...</p>
                                </div>
                            </div>
                        `;
                    }

                    tabButtonsHTML += '</ul>';
                    tabContentHTML += '</div>';

                    // 3. Inject the main structure into the page
                    menuContainer.innerHTML = `
                        <div class="category-tabs text-center mb-4">${tabButtonsHTML}</div>
                        ${tabContentHTML}
                    `;

                    // 4. Fetch and display smoothies for each category
                    for (const category of activeCategories) {
                         const categoryId = category.id || category._id;
                         fetchAndDisplaySmoothies(categoryId);
                    }

                } catch (error) {
                    console.error('Failed to load menu:', error);
                    menuContainer.innerHTML = '<p class="text-center" style="color: red;">Sorry, we couldn\'t load the menu. Please try refreshing the page.</p>';
                }
            }

            // --- Function to fetch and display smoothies for a single category ---
            async function fetchAndDisplaySmoothies(categoryId) {
                try {
                    // IMPORTANT: Adjust this URL to match your API endpoint for fetching smoothies by category
                    const response = await fetch(`${API_BASE_URL}/smoothies?category=${categoryId}`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch smoothies for category ${categoryId}`);
                    }
                    const smoothies = await response.json();
                    const smoothieContainer = document.getElementById(`smoothies-for-${categoryId}`);
                    
                    if (smoothies.length === 0) {
                         smoothieContainer.innerHTML = `<p class="text-center col-12">No smoothies in this category yet!</p>`;
                         return;
                    }

                    let smoothiesHTML = '';
                    smoothies.forEach(smoothie => {
                         smoothiesHTML += `
                            <div class="menu-column col-lg-6 col-md-12 col-sm-12">
                                <div class="inner-column">
                                    <div class="menu-block">
                                        <div class="inner-box">
                                            <div class="menu-image">
                                                <a href="#"><img src="${getImageUrl(smoothie.image)}" alt="${smoothie.name}" /></a>
                                            </div>
                                            <h6><a href="#">${smoothie.name}</a></h6>
                                            <div class="title">${smoothie.description || 'A delicious treat'}</div>
                                            <div class="price-box">
                                                <span class="price">$${smoothie.price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                         `;
                    });
                    
                    // To make the layout work with pairs, we need to restructure it a bit
                    let finalHtml = '';
                    for(let i = 0; i < smoothies.length; i += 2) {
                        finalHtml += '<div class="menu-column col-lg-6 col-md-12 col-sm-12"><div class="inner-column">';
                        finalHtml += renderSmoothieBlock(smoothies[i]);
                        if (smoothies[i+1]) {
                            finalHtml += renderSmoothieBlock(smoothies[i+1]);
                        }
                        finalHtml += '</div></div>';
                    }


                    smoothieContainer.innerHTML = finalHtml;

                } catch (error) {
                     console.error(`Error loading smoothies for category ${categoryId}:`, error);
                     const smoothieContainer = document.getElementById(`smoothies-for-${categoryId}`);
                     smoothieContainer.innerHTML = `<p class="text-center col-12" style="color: red;">Could not load smoothies.</p>`;
                }
            }
            
            function renderSmoothieBlock(smoothie) {
                if (!smoothie) return '';
                return `
                    <div class="menu-block">
                        <div class="inner-box">
                            <div class="menu-image">
                                <a href="strawberry.html"><img src="${getImageUrl(smoothie.image)}" alt="${smoothie.name}" /></a>
                            </div>
                            <h6><a href="strawberry.html">${smoothie.name}</a></h6>
                            <div class="title">${smoothie.description || 'A delicious treat'}</div>
                            <div class="price-box">
                                <span class="price">$${smoothie.price ? smoothie.price.toFixed(2) : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                `;
            }


            // Start the process
            loadDynamicMenu();

        });