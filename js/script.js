// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');

    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });
    }

    // Handle Order Form File UI
    const orderForm = document.getElementById('orderForm');
    const artworkInput = document.getElementById('artworkInput');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    // Make the fake file upload box clickable
    const uploadBox = orderForm ? orderForm.querySelector('div.border-dashed') : null;
    if (uploadBox && artworkInput && fileNameDisplay) {
        uploadBox.addEventListener('click', () => artworkInput.click());
        artworkInput.addEventListener('change', () => {
            if (artworkInput.files.length > 0) {
                fileNameDisplay.innerText = "Selected File: " + artworkInput.files[0].name;
                fileNameDisplay.classList.remove('hidden');
            }
        });
    }

    // Intersection Observer for fade-in animations on scroll
    const fadeElements = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('opacity-100', 'translate-y-0');
                entry.target.classList.remove('opacity-0', 'translate-y-10');
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => observer.observe(el));

    // Global Lightbox Setup
    let lightbox = document.getElementById('global-lightbox');
    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.id = 'global-lightbox';
        lightbox.className = 'fixed inset-0 z-[100] bg-black/95 flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300 backdrop-blur-sm cursor-zoom-out';
        lightbox.innerHTML = `
            <img id="lightbox-img" src="" class="max-w-[95vw] max-h-[90vh] object-contain rounded-xl shadow-2xl transform scale-95 transition-transform duration-300 cursor-default">
            <button id="lightbox-close" class="absolute top-4 right-4 md:top-8 md:right-8 text-slate-300 hover:text-primary transition-colors p-2 bg-slate-900/50 rounded-full shadow-lg">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;
        document.body.appendChild(lightbox);

        window.openLightbox = function(src) {
            const lbImg = document.getElementById('lightbox-img');
            const lb = document.getElementById('global-lightbox');
            if(lbImg && lb) {
                lbImg.src = src;
                lb.classList.add('opacity-100', 'pointer-events-auto');
                setTimeout(() => lbImg.classList.add('scale-100'), 50);
            }
        };

        const closeLightbox = () => {
            lightbox.classList.remove('opacity-100', 'pointer-events-auto');
            lightbox.querySelector('img').classList.remove('scale-100');
            setTimeout(() => lightbox.querySelector('img').src = '', 300);
        };

        lightbox.addEventListener('click', (e) => {
            if (e.target.id === 'global-lightbox' || e.target.closest('#lightbox-close')) {
                closeLightbox();
            }
        });
    }

    // GitHub API dynamic gallery loading
    const galleryContainer = document.getElementById('gallery-container');
    if (galleryContainer) {
        const githubUser = "AdithyaVimukthi";
        const githubRepo = "Custom-T-Works-web";
        const targetFolder = "images/prev_work";

        fetch(`https://api.github.com/repos/${githubUser}/${githubRepo}/contents/${targetFolder}`)
            .then(response => {
                if (!response.ok) throw new Error("Could not fetch gallery");
                return response.json();
            })
            .then(data => {
                // Filter only image files
                let images = data.filter(file => file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i));
                
                // Sort array to show newest images first (assumes naming convention like dates/timestamps)
                images.reverse();
                
                // If it's the home page, limit to 10 images
                const isRecentWorkPage = document.getElementById('recent-work-page-marker');
                if (!isRecentWorkPage && images.length > 10) {
                    images = images.slice(0, 10);
                }

                galleryContainer.innerHTML = ''; // Clear loading text

                if (images.length === 0) {
                    galleryContainer.innerHTML = '<div class="col-span-full text-center text-slate-400 py-10">No recent work available yet.</div>';
                    return;
                }

                images.forEach((file, index) => {
                    const delay = (index % 5) * 100;
                    const imgSrc = `${targetFolder}/${encodeURIComponent(file.name)}`;
                    
                    const html = `
                        <div class="group relative overflow-hidden rounded-2xl glass aspect-[4/5] object-cover border border-slate-700/50 fade-in opacity-0 translate-y-10 transition-all duration-700 cursor-zoom-in shadow-lg hover:shadow-[0_0_15px_rgba(249,115,22,0.4)]" style="transition-delay: ${delay}ms" onclick="openLightbox('${imgSrc}')">
                            <img src="${imgSrc}" alt="Recent Work" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                            <div class="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <svg class="w-12 h-12 text-white/50 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
                            </div>
                        </div>
                    `;
                    galleryContainer.insertAdjacentHTML('beforeend', html);
                });

                // Re-trigger the intersection observer for dynamically added items
                const newFadeElements = galleryContainer.querySelectorAll('.fade-in');
                newFadeElements.forEach(el => observer.observe(el));
            })
            .catch(error => {
                console.error('Error loading gallery from GitHub:', error);
                galleryContainer.innerHTML = '<div class="col-span-full text-center text-red-400 py-10">Failed to load recent works. Please check your connection.</div>';
            });
    }

    // Google Sheets Reviews Integration
    const reviewsContainer = document.getElementById('reviews-container');
    if (reviewsContainer) {
        const sheetCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQAyiWWpWPOOChgSeVjoRU_83FH9_bAc7r0tLLwjP5jvukPui1h-DgunQFUkTZjqZNl-NgSYOd1dE0O/pub?output=csv";

        fetch(sheetCsvUrl)
            .then(response => response.text())
            .then(csvText => {
                const rows = csvText.split('\n').slice(1); // Skip header
                if (rows.length === 0 || (rows.length === 1 && rows[0].trim() === "")) return;

                // Clear static reviews if we have dynamic ones
                reviewsContainer.innerHTML = '';

                rows.forEach(row => {
                    const columns = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); // Split CSV but ignore commas inside quotes
                    if (columns.length < 2) return;

                    const name = columns[0].replace(/"/g, '').trim();
                    const review = columns[1].replace(/"/g, '').trim();
                    const platform = columns[2] ? columns[2].replace(/"/g, '').trim() : 'Customer Feedback';
                    const initial = name.charAt(0).toUpperCase();

                    const reviewHtml = `
                        <div class="glass p-8 rounded-3xl border border-slate-700/50 relative fade-in opacity-0 translate-y-10 transition-all duration-700">
                            <p class="text-slate-300 text-lg italic mb-6 leading-relaxed">"${review}"</p>
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-xl font-bold text-primary">
                                    ${initial}
                                </div>
                                <div>
                                    <h4 class="text-white font-bold outfit-font">${name}</h4>
                                    <span class="text-sm text-slate-500">${platform}</span>
                                </div>
                            </div>
                        </div>
                    `;
                    reviewsContainer.insertAdjacentHTML('beforeend', reviewHtml);
                });

                // Trigger observer for new reviews
                const newReviewElements = reviewsContainer.querySelectorAll('.fade-in');
                newReviewElements.forEach(el => observer.observe(el));
            })
            .catch(err => console.error('Error fetching reviews:', err));
    }

    // Dynamic Materials Loading (from CSV)
    const materialSelect = document.getElementById('material-select');
    if (materialSelect) {
        fetch('materials.csv')
            .then(response => response.text())
            .then(csvText => {
                const lines = csvText.split('\n').slice(1); // Skip header
                if (lines.length === 0) return;

                // Keep the first option if you want, or clear all
                materialSelect.innerHTML = '';
                
                lines.forEach(line => {
                    const material = line.trim();
                    if (material) {
                        const option = document.createElement('option');
                        option.textContent = material;
                        option.value = material;
                        materialSelect.appendChild(option);
                    }
                });
            })
            .catch(err => console.error('Error loading materials:', err));
    }

    // Dynamic Size Charts & Sizes Logic
    const apparelTypeSelect = document.getElementById('apparel-type-select');
    const sizeSelect = document.getElementById('size-select');
    const sizeChartContainer = document.getElementById('size-chart-container');
    const sizeChartImg = document.getElementById('size-chart-img');

    if (apparelTypeSelect && sizeSelect) {
        const updateApparelConfig = () => {
            const type = apparelTypeSelect.value;
            let chartSrc = "";
            let sizes = ["Small (S)", "Medium (M)", "Large (L)", "Extra Large (XL)", "XXL"];
            let showSizes = true;

            if (type.includes("T-Shirt") || type.includes("Hoodie") || type.includes("Shirt")) {
                chartSrc = "images/size_charts/t_shirt size_chart.jpeg";
            } else if (type.includes("Trouser")) {
                chartSrc = "images/size_charts/trousers size_chart.jpeg";
                sizes = ["28", "30", "32", "34", "36", "38", "40"];
            } else if (type.includes("Shorts")) {
                chartSrc = "images/size_charts/shorts size_chart.jpeg";
            } else if (type.includes("Skinnies")) {
                chartSrc = "images/size_charts/skinny size_chart.jpeg";
            } else if (type.includes("Cap")) {
                showSizes = false;
                chartSrc = ""; // No size chart for caps
            }

            // Update Size Chart
            if (chartSrc) {
                sizeChartImg.src = chartSrc;
                sizeChartContainer.classList.remove('hidden');
            } else {
                sizeChartContainer.classList.add('hidden');
            }

            // Update Sizes Dropdown
            if (showSizes) {
                sizeSelect.parentElement.classList.remove('hidden');
                sizeSelect.innerHTML = sizes.map(s => `<option value="${s}">${s}</option>`).join('');
            } else {
                sizeSelect.parentElement.classList.add('hidden');
            }
        };

        apparelTypeSelect.addEventListener('change', updateApparelConfig);
        // Run once on load to set initial state
        updateApparelConfig();
    }

    // MULTI-ITEM ORDER LOGIC
    const addItemBtn = document.getElementById('addItemBtn');
    const itemsList = document.getElementById('itemsList');
    const orderSummarySection = document.getElementById('orderSummarySection');
    const orderSummaryInput = document.getElementById('orderSummaryInput');
    const itemCountBadge = document.getElementById('itemCount');
    let orderItems = [];

    function updateItemsUI() {
        if (!itemsList || !orderSummarySection || !itemCountBadge) return;

        if (orderItems.length > 0) {
            orderSummarySection.classList.remove('hidden');
            orderSummarySection.classList.add('fade-in', 'opacity-100', 'translate-y-0');
        } else {
            orderSummarySection.classList.add('hidden');
        }

        itemCountBadge.innerText = `${orderItems.length} Item${orderItems.length !== 1 ? 's' : ''}`;
        
        itemsList.innerHTML = orderItems.map((item, index) => `
            <div class="flex items-center justify-between p-4 bg-slate-900/80 border border-slate-700/50 rounded-2xl group hover:border-primary/50 transition-all">
                <div class="flex items-center gap-4">
                    <div class="w-5 h-5 rounded-full border border-slate-600 shadow-sm" style="background-color: ${item.color}"></div>
                    <div>
                        <p class="text-white font-bold text-sm">${item.qty}x ${item.type} (${item.size || 'N/A'})</p>
                        <p class="text-slate-500 text-xs">${item.material}</p>
                    </div>
                </div>
                <button type="button" onclick="removeItem(${item.id})" class="text-slate-500 hover:text-red-400 p-2 transition-colors rounded-lg hover:bg-red-400/10">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
            </div>
        `).join('');

        // Update hidden field for submission
        const summaryText = orderItems.map((item, i) => 
            `Item ${i+1}: Qty: ${item.qty} | Type: ${item.type} | Size: ${item.size} | Material: ${item.material} | Color: ${item.color}`
        ).join('\n');
        orderSummaryInput.value = summaryText;
    }

    if (addItemBtn) {
        addItemBtn.addEventListener('click', (e) => {
            const apparelType = document.getElementById('apparel-type-select').value;
            const material = document.getElementById('material-select').value;
            const sizeSelect = document.getElementById('size-select');
            const size = sizeSelect.parentElement.classList.contains('hidden') ? 'N/A' : sizeSelect.value;
            const quantityInput = document.getElementById('quantity-input');
            const quantity = quantityInput.value;
            
            // Get selected color
            const colorInput = document.querySelector('input[name="color"]:checked');
            const colorValue = colorInput ? colorInput.value : 'N/A';
            
            const item = {
                id: Date.now(),
                type: apparelType,
                material: material,
                size: size,
                qty: quantity,
                color: colorValue
            };

            orderItems.push(item);
            updateItemsUI();
            
            // Success animation on button
            const originalHtml = addItemBtn.innerHTML;
            addItemBtn.innerHTML = `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Added!`;
            addItemBtn.classList.add('bg-green-600', 'border-green-500');
            
            setTimeout(() => {
                addItemBtn.innerHTML = originalHtml;
                addItemBtn.classList.remove('bg-green-600', 'border-green-500');
            }, 1500);

            // Scroll to summary if it's the first item
            if (orderItems.length === 1) {
                orderSummarySection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    window.removeItem = (id) => {
        orderItems = orderItems.filter(item => item.id !== id);
        updateItemsUI();
    };

    // Ensure form includes the items summary on submission
    if (orderForm) {
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // --- CONFIGURATION: PASTE YOUR GOOGLE SCRIPT URL HERE ---
            const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyL54bQRX-de8XLbBokBK_l08AbmQJOOOomABLZgCpcHFg8lBWTtGI-I73eGcI0ZtQk/exec"; 
            // -------------------------------------------------------

            const submitBtn = document.getElementById('orderSubmitBtn');
            const statusMsg = document.getElementById('orderStatus');
            const originalText = submitBtn.innerHTML;

            // Basic Validation: Ensure at least one item or fields filled
            const formData = new FormData(orderForm);
            const data = Object.fromEntries(formData.entries());
            
            // Add order summary
            data.OrderSummary = orderSummaryInput.value || `1. ${data.Quantity}x ${data.ApparelType} (${data.Size}) - ${data.Material}`;

            // Show Loading State
            submitBtn.disabled = true;
            submitBtn.innerHTML = `
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
            `;
            statusMsg.innerText = "Submitting your order...";
            statusMsg.className = "text-slate-400 mt-4 block text-center italic";
            statusMsg.classList.remove('hidden');

            const sendData = async (payload) => {
                try {
                    const response = await fetch(GOOGLE_SCRIPT_URL, {
                        method: 'POST',
                        mode: 'no-cors', // Apps Script requires no-cors often for simple posts
                        body: JSON.stringify(payload),
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    // Note: with 'no-cors', we can't read the response body, but if it doesn't throw, it likely worked.
                    // If you want to handle exact success, you'd need the Script to handle CORS, but this is simpler.
                    
                    statusMsg.innerText = "✅ Order submitted successfully! We will contact you soon.";
                    statusMsg.className = "text-green-400 font-bold mt-4 block text-center p-3 bg-green-400/10 border border-green-400/20 rounded-xl";
                    orderForm.reset();
                    orderItems = [];
                    updateItemsUI();
                    if(fileNameDisplay) fileNameDisplay.classList.add('hidden');
                    
                    // Reset Button
                    submitBtn.classList.remove('from-primary', 'to-secondary');
                    submitBtn.classList.add('bg-green-600');
                    submitBtn.innerHTML = "Success!";
                    
                } catch (error) {
                    console.error('Error:', error);
                    statusMsg.innerText = "❌ Error submitting order. Please try again or call us.";
                    statusMsg.className = "text-red-400 font-bold mt-4 block text-center p-3 bg-red-400/10 border border-red-400/20 rounded-xl";
                } finally {
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = originalText;
                        submitBtn.classList.remove('bg-green-600');
                        submitBtn.classList.add('bg-gradient-to-r', 'from-primary', 'to-secondary');
                    }, 4000);
                }
            };

            // Handle File (Artwork)
            const file = artworkInput.files[0];
            if (file) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = async () => {
                    data.fileData = reader.result.split(',')[1]; // Base64 content
                    data.fileName = file.name;
                    data.fileType = file.type;
                    await sendData(data);
                };
            } else {
                await sendData(data);
            }
        });
    }

});
