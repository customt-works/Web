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

});
