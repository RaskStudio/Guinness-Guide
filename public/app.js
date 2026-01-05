document.addEventListener('DOMContentLoaded', () => {
    const reviewsList = document.getElementById('reviewsList');
    const form = document.getElementById('reviewForm');
    
    // Modal & UI Elements
    const modal = document.getElementById('addModal');
    const fabBtn = document.getElementById('fabBtn');
    const closeBtn = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const reviewIdInput = document.getElementById('reviewId');

    // Global variabel
    let currentReviews = [];

    // Sliders & Values setup
    setupSlider('ratingGuinness', 'val-guinness');
    setupSlider('ratingPour', 'val-pour');
    setupSlider('ratingService', 'val-service');

    function setupSlider(inputId, displayId) {
        const input = document.getElementById(inputId);
        const display = document.getElementById(displayId);
        if(input && display) {
            input.addEventListener('input', () => {
                display.textContent = input.value;
            });
        }
    }

    // Toggle Smoking Text
    const smokingInput = document.getElementById('smoking');
    const smokingStatus = document.getElementById('smoking-status');
    if(smokingInput && smokingStatus) {
        smokingInput.addEventListener('change', () => {
            smokingStatus.textContent = smokingInput.checked ? 'Ja' : 'Nej';
        });
    }

    // Load data
    fetchReviews();

    // Open Modal (New Review)
    if(fabBtn) {
        fabBtn.addEventListener('click', () => {
            resetForm();
            modal.classList.add('active');
            document.getElementById('name').focus();
        });
    }

    // Close Modal
    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    window.addEventListener('click', (e) => {
        // Close Modal
        if (e.target === modal) {
            modal.classList.remove('active');
        }
        
        // Close Dropdowns if clicking outside
        if (!e.target.matches('.menu-dots')) {
            document.querySelectorAll('.menu-dropdown').forEach(d => {
                d.classList.remove('show');
            });
        }
    });

    // Form Submit
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData();
            formData.append('name', document.getElementById('name').value);
            formData.append('ratingGuinness', document.getElementById('ratingGuinness').value);
            formData.append('ratingPour', document.getElementById('ratingPour').value);
            formData.append('ratingService', document.getElementById('ratingService').value);
            formData.append('smoking', document.getElementById('smoking').checked);
            formData.append('price', document.getElementById('price').value);
            formData.append('comment', document.getElementById('comment').value);
            
            const imageFile = document.getElementById('image').files[0];
            if (imageFile) {
                formData.append('image', imageFile);
            }

            const id = reviewIdInput.value;
            const url = id ? `/api/reviews/${id}` : '/api/reviews';
            const method = id ? 'PUT' : 'POST';

            try {
                const response = await fetch(url, {
                    method: method,
                    body: formData
                });

                if (response.ok) {
                    resetForm();
                    modal.classList.remove('active');
                    fetchReviews(); 
                } else {
                    alert('Fejl under gemning');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    function resetForm() {
        form.reset();
        reviewIdInput.value = '';
        modalTitle.textContent = 'Ny Guinness';
        document.getElementById('val-guinness').textContent = '5';
        document.getElementById('val-pour').textContent = '3';
        document.getElementById('val-service').textContent = '3';
        if(smokingStatus) smokingStatus.textContent = 'Nej';
    }

    async function fetchReviews() {
        try {
            const response = await fetch('/api/reviews');
            currentReviews = await response.json();
            renderReviews(currentReviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            if(reviewsList) reviewsList.innerHTML = '<p style="text-align:center;">Kunne ikke hente logbog.</p>';
        }
    }

    function renderReviews(reviews) {
        if(!reviewsList) return;
        reviewsList.innerHTML = '';

        if(reviews.length === 0) {
            reviewsList.innerHTML = '<p style="text-align:center; color:#666; margin-top:40px;">Ingen anmeldelser endnu.</p>';
            return;
        }
        
        reviews.reverse().forEach(review => {
            const card = document.createElement('div');
            card.className = 'card';
            
            const imageHtml = review.imagePath 
                ? `<img src="${review.imagePath}" alt="Split the G" loading="lazy">` 
                : '';

            const smokingIcon = review.smoking ? '🚬 Tilladt' : '🚭 Forbudt';
            const priceDisplay = review.price ? `${review.price},-` : '?';

            // Beregn samlet score
            const totalScore = ((parseInt(review.ratingGuinness) + parseInt(review.ratingPour) + parseInt(review.ratingService)) / 3).toFixed(1);


            card.innerHTML = `
                <button class="menu-dots" onclick="toggleMenu(event, '${review.id}')">⋮</button>
                <div id="menu-${review.id}" class="menu-dropdown">
                    <button class="menu-item" onclick="openEditModal('${review.id}')">Rediger</button>
                    <button class="menu-item delete" onclick="deleteReview('${review.id}')">Slet</button>
                </div>

                <div class="review-header">
                    <h3>${review.name}</h3>
                </div>
                
                ${imageHtml}

                <div class="stats-container">
                    <div class="stats-row ratings-row">
                        <div class="stat-item">
                            <span class="stat-label">Guinness</span>
                            <span class="stat-val">${review.ratingGuinness}/5</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Ophældning</span>
                            <span class="stat-val">${review.ratingPour}/5</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Service</span>
                            <span class="stat-val">${review.ratingService}/5</span>
                        </div>
                    </div>

                    <div class="stats-row info-row">
                        <div class="stat-item">
                            <span class="stat-label">Rygning</span>
                            <span class="stat-val">${smokingIcon}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Pris</span>
                            <span class="stat-val">${priceDisplay}</span>
                        </div>
                    </div>
                    
                    <div class="stats-row total-score-row">
                        <div class="stat-item total-score">
                            <span class="stat-label">Samlet Score</span>
                            <span class="stat-val">${totalScore}/5</span>
                        </div>
                    </div>
                </div>

                <p style="color: #ccc; margin-top: 12px; font-style: italic;">"${review.comment}"</p>
                <span class="review-date">${review.date}</span>
            `;
            
            reviewsList.appendChild(card);
        });
    }

    window.toggleMenu = (event, id) => {
        event.stopPropagation();
        
        document.querySelectorAll('.menu-dropdown').forEach(d => {
            if(d.id !== `menu-${id}`) d.classList.remove('show');
        });

        const menu = document.getElementById(`menu-${id}`);
        if(menu) menu.classList.toggle('show');
    };

    window.openEditModal = (id) => {
        const review = currentReviews.find(r => r.id == id);
        if(!review) return;

        reviewIdInput.value = review.id;
        document.getElementById('name').value = review.name;
        document.getElementById('ratingGuinness').value = review.ratingGuinness;
        document.getElementById('ratingPour').value = review.ratingPour;
        document.getElementById('ratingService').value = review.ratingService;
        document.getElementById('price').value = review.price || '';
        document.getElementById('comment').value = review.comment;
        
        document.getElementById('smoking').checked = review.smoking;
        if(smokingStatus) smokingStatus.textContent = review.smoking ? 'Ja' : 'Nej';

        document.getElementById('val-guinness').textContent = review.ratingGuinness;
        document.getElementById('val-pour').textContent = review.ratingPour;
        document.getElementById('val-service').textContent = review.ratingService;

        modalTitle.textContent = 'Rediger Guinness';
        modal.classList.add('active');
    };

    window.deleteReview = async (id) => {
        if(!confirm('Slet denne anmeldelse?')) return;

        try {
            const response = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
            if(response.ok) {
                fetchReviews();
            } else {
                alert('Kunne ikke slette.');
            }
        } catch(e) {
            console.error(e);
        }
    };
});