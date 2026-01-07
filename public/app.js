document.addEventListener('DOMContentLoaded', () => {
    const reviewsList = document.getElementById('reviewsList');
    const form = document.getElementById('reviewForm');
    
    // Modal & UI Elements
    const modal = document.getElementById('addModal');
    const fabBtn = document.getElementById('fabBtn');
    const closeBtn = document.getElementById('closeModal');
    const modalTitle = document.getElementById('modalTitle');
    const reviewIdInput = document.getElementById('reviewId');
    const fileInput = document.getElementById('image');
    const fileChosenText = document.getElementById('file-chosen');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    // 3D Nav Interaction
    const nav3d = document.getElementById('nav3d');
    if (nav3d) {
        nav3d.addEventListener('click', () => {
            if (window.confetti) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.8 },
                    colors: ['#000000', '#ffffff', '#c9a050']
                });
            }
        });
    }

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
    
    // Fil-input feedback
    if(fileInput && fileChosenText) {
        fileInput.addEventListener('change', () => {
            if(fileInput.files.length > 0) {
                fileChosenText.textContent = 'Valgt: ' + fileInput.files[0].name;
                fileChosenText.style.color = '#c9a050'; // Guld farve for bekræftelse
            } else {
                fileChosenText.textContent = '';
            }
        });
    }

    // Load data
    fetchReviews();

    // Search Functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredReviews = currentReviews.filter(review => 
                review.name.toLowerCase().includes(searchTerm)
            );
            renderReviews(filteredReviews);
        });
    }

    // Open Modal (New Review)
    if(fabBtn) {
        fabBtn.addEventListener('click', () => {
            resetForm();
            openModal();
            // document.getElementById('name').focus(); // Fjernet for at undgå tastatur på mobil
        });
    }

    // Close Modal
    if(closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', (e) => {
        // Close Modal
        if (e.target === modal) {
            closeModal();
        }
        
        // Close Dropdowns if clicking outside
        if (!e.target.matches('.menu-dots')) {
            document.querySelectorAll('.menu-dropdown').forEach(d => {
                d.classList.remove('show');
            });
        }
    });
    
    function openModal() {
        modal.classList.add('active');
        document.body.classList.add('no-scroll'); // Lås baggrunds-scroll
        
        // Scroll til toppen af modal-indholdet
        const modalContent = document.querySelector('.modal-content');
        if(modalContent) {
            modalContent.scrollTop = 0;
        }
    }
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.classList.remove('no-scroll'); // Lås op for baggrunds-scroll
    }

    // Form Submit
    if(form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // UI Feedback: Start Loading
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Gemmer...';
            submitBtn.disabled = true;

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
                    closeModal();
                    fetchReviews(); 
                } else {
                    alert('Fejl under gemning. Prøv igen.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Der skete en netværksfejl.');
            } finally {
                // UI Feedback: Stop Loading
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    function resetForm() {
        form.reset();
        reviewIdInput.value = '';
        modalTitle.textContent = 'Ny Guinness';
        document.getElementById('val-guinness').textContent = '10';
        document.getElementById('ratingGuinness').value = '10';
        document.getElementById('val-pour').textContent = '7';
        document.getElementById('ratingPour').value = '7';
        document.getElementById('val-service').textContent = '7';
        document.getElementById('ratingService').value = '7';
        if(smokingStatus) smokingStatus.textContent = 'Nej';
        if(fileChosenText) fileChosenText.textContent = ''; // Nulstil filtekst
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
        
        reviews.forEach(review => {
            const card = document.createElement('div');
            card.className = 'card';
            
            const imageHtml = review.imagePath 
                ? `<img src="${review.imagePath}" alt="Split the G" loading="lazy">` 
                : '';

            const smokingIcon = review.smoking ? '🚬 Tilladt' : '🚭 Forbudt';
            const priceDisplay = review.price ? `${review.price},-` : '?';

            // Beregn samlet score
            const totalScore = ((parseInt(review.ratingGuinness) + parseInt(review.ratingPour) + parseInt(review.ratingService)) / 3);
            const formattedScore = totalScore.toFixed(1);

            // Beregn Value Index (Score ift. Pris)
            // Nu ud fra 10-skala: (Score / Pris) * 50 giver ca. samme skala som før
            const valueIndex = review.price ? ((totalScore / review.price) * 50).toFixed(0) : '?';

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
                            <span class="stat-val">${review.ratingGuinness}/10</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Ophældning</span>
                            <span class="stat-val">${review.ratingPour}/10</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Service</span>
                            <span class="stat-val">${review.ratingService}/10</span>
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
                        <div class="stat-item">
                            <span class="stat-label">Værdi-Index</span>
                            <span class="stat-val" style="color: var(--guinness-foam);">${valueIndex}</span>
                        </div>
                    </div>
                    
                    <div class="stats-row total-score-row">
                        <div class="stat-item total-score">
                            <span class="stat-label">Samlet Score</span>
                            <span class="stat-val">${formattedScore}/10</span>
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
        
        openModal(); // Brug den nye funktion
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