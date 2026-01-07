document.addEventListener('DOMContentLoaded', () => {
    const reviewsList = document.getElementById('reviewsList');
    const form = document.getElementById('reviewForm');
    
    // Modal & UI Elements
    const modal = document.getElementById('addModal');
    const optionsModal = document.getElementById('optionsModal');
    const fabBtn = document.getElementById('fabBtn');
    const closeBtn = document.getElementById('closeModal');
    const closeInfoBtn = document.getElementById('closeInfoModal');
    const modalTitle = document.getElementById('modalTitle');
    const reviewIdInput = document.getElementById('reviewId');
    const fileInput = document.getElementById('image');
    const fileChosenText = document.getElementById('file-chosen');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    // Options Modal Buttons
    const btnEdit = document.getElementById('btnEdit');
    const btnDelete = document.getElementById('btnDelete');
    const btnCancelOptions = document.getElementById('btnCancelOptions');
    const optionsReviewId = document.getElementById('optionsReviewId');

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

    // --- Helper Functions (Hoisted) ---

    function setupSlider(inputId, displayId) {
        const input = document.getElementById(inputId);
        const display = document.getElementById(displayId);
        if(input && display) {
            input.addEventListener('input', () => {
                display.textContent = input.value;
            });
        }
    }

    function openModal() {
        modal.classList.add('active');
        document.body.classList.add('no-scroll'); 
        const modalContent = document.querySelector('.modal-content');
        if(modalContent) {
            modalContent.scrollTop = 0;
        }
    }
    
    function closeModal() {
        modal.classList.remove('active');
        document.body.classList.remove('no-scroll'); 
    }

    function openOptionsModal(id, title) {
        optionsReviewId.value = id;
        document.getElementById('optionsTitle').textContent = title;
        optionsModal.classList.add('active');
        document.body.classList.add('no-scroll');
    }

    function closeOptionsModal() {
        optionsModal.classList.remove('active');
        // Check om infoModal stadig er åben, før vi fjerner no-scroll
        if (!document.getElementById('infoModal').classList.contains('active')) {
            document.body.classList.remove('no-scroll');
        }
    }

    // Accordion Toggle Funktion
    function toggleAccordion(id) {
        const content = document.getElementById(`sublist-${id}`);
        const arrow = document.getElementById(`arrow-${id}`);
        
        if (content) {
            content.classList.toggle('open');
            
            if (content.classList.contains('open')) {
                if(arrow) arrow.style.transform = 'rotate(180deg)';
            } else {
                if(arrow) arrow.style.transform = 'rotate(0deg)';
            }
        }
    }

    function openDetailModalFromId(id) {
        const review = currentReviews.find(r => r.id == id);
        if(review) openDetailModal(review);
    }

    function openDetailModal(review) {
        const modal = document.getElementById('infoModal');
        const content = document.getElementById('infoContent');
        const modalTitle = document.getElementById('infoTitle');
        
        if(!modal || !content) return;
    
        modalTitle.textContent = review.name;
    
        const imageHtml = review.imagePath 
            ? `<img src="${review.imagePath}" alt="${review.name}" loading="lazy">` 
            : '';
    
        const smokingIcon = review.smoking ? '🚬 Tilladt' : '🚭 Forbudt';
        const priceDisplay = review.price ? `${review.price},-` : '?';
        const totalScore = ((parseInt(review.ratingGuinness) + parseInt(review.ratingPour) + parseInt(review.ratingService)) / 3).toFixed(1);
        
        const valueIndex = review.price ? ((((parseInt(review.ratingGuinness) + parseInt(review.ratingPour) + parseInt(review.ratingService)) / 3) / review.price) * 50).toFixed(0) : '?';
    
        content.innerHTML = `
            <div class="card" style="margin-bottom: 0; box-shadow: none; border: none; background: transparent; padding: 0; position: relative;">
                
                <!-- Indstillinger knap -->
                <button id="detailOptionsBtn-${review.id}" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); color: #fff; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 1.2rem; cursor: pointer; z-index: 10;">⋮</button>

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
                            <span class="stat-val">${totalScore}/10</span>
                        </div>
                    </div>
                </div>
                <p style="color: #ccc; margin-top: 12px; font-style: italic;">"${review.comment}"</p>
                <span class="review-date">${review.date}</span>
            </div>
        `;
        
        // Bind click event til options knappen
        setTimeout(() => {
            const optsBtn = document.getElementById(`detailOptionsBtn-${review.id}`);
            if(optsBtn) {
                optsBtn.onclick = (e) => {
                    e.stopPropagation();
                    openOptionsModal(review.id, review.name);
                };
            }
        }, 0);
    
        modal.classList.add('active');
        document.body.classList.add('no-scroll');
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        };
    }

    function openEditModal(id) {
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
        
        openModal(); 
    };

    async function deleteReview(id) {
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
        if(fileChosenText) fileChosenText.textContent = ''; 
    }

    function updatePlacesDatalist(reviews) {
        const dataList = document.getElementById('placesList');
        if (!dataList || !reviews) return;
        
        try {
            const uniqueNames = [...new Set(reviews.filter(r => r && r.name).map(r => r.name))];
            uniqueNames.sort();
            dataList.innerHTML = uniqueNames.map(name => `<option value="${name}">`).join('');
        } catch (e) {
            console.warn("Fejl i autocomplete:", e);
        }
    }

    function renderReviews(reviews) {
        if(!reviewsList) return;
        reviewsList.innerHTML = '';

        if(reviews.length === 0) {
            reviewsList.innerHTML = '<p style="text-align:center; color:#666; margin-top:40px;">Ingen anmeldelser endnu.</p>';
            return;
        }

        const groupedReviews = {};
        reviews.forEach(review => {
            const name = review.name.trim(); 
            const key = name.toLowerCase();
            
            if (!groupedReviews[key]) {
                groupedReviews[key] = {
                    name: name,
                    visits: []
                };
            }
            groupedReviews[key].visits.push(review);
        });

        const places = Object.values(groupedReviews).sort((a, b) => a.name.localeCompare(b.name));
        
        places.forEach(place => {
            const visitCount = place.visits.length;
            const latestVisit = place.visits.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
            
            const wrapper = document.createElement('div');
            wrapper.style.marginBottom = '10px';

            const mainItem = document.createElement('div');
            mainItem.className = 'review-item-compact main-item';
            mainItem.style.marginBottom = '0';
            mainItem.style.cursor = 'pointer'; 
            
            if (visitCount > 1) {
                mainItem.style.borderRadius = '12px 12px 0 0';
                mainItem.style.borderBottom = 'none';
                
                mainItem.onclick = function() {
                    toggleAccordion(latestVisit.id);
                };
            } else {
                mainItem.style.borderRadius = '12px';
                mainItem.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
                
                mainItem.onclick = function() {
                    openDetailModalFromId(latestVisit.id);
                };
            }

            const imageSrc = latestVisit.imagePath 
                ? latestVisit.imagePath 
                : 'images/guinness emoji.png';
            
            const imgStyle = latestVisit.imagePath 
                ? '' 
                : 'object-fit: contain; padding: 5px; background: transparent;';

            const avgScore = visitCount > 1 
                ? (place.visits.reduce((sum, r) => sum + ((parseInt(r.ratingGuinness) + parseInt(r.ratingPour) + parseInt(r.ratingService)) / 3), 0) / visitCount).toFixed(1)
                : ((parseInt(latestVisit.ratingGuinness) + parseInt(latestVisit.ratingPour) + parseInt(latestVisit.ratingService)) / 3).toFixed(1);

            let detailsText = '';
            let arrowHtml = '';

            if (visitCount > 1) {
                detailsText = `<span style="color: var(--guinness-gold);">${visitCount} besøg</span> • Senest: ${latestVisit.date}`;
                arrowHtml = `<span class="accordion-arrow" id="arrow-${latestVisit.id}" style="margin-left:10px; color:#666; transition: transform 0.3s;">▼</span>`;
            } else {
                const priceDisplay = latestVisit.price ? `${latestVisit.price},-` : '?';
                const smokingIcon = latestVisit.smoking ? '🚬' : '🚭';
                detailsText = `${priceDisplay} • ${smokingIcon}`;
            }

            mainItem.innerHTML = `
                <img src="${imageSrc}" class="compact-img" style="${imgStyle}" alt="${latestVisit.name}">
                <div class="compact-info">
                    <div class="compact-name">${place.name}</div>
                    <div class="compact-details">${detailsText}</div>
                </div>
                <div class="compact-score">${avgScore}/10</div>
                ${arrowHtml}
            `;

            wrapper.appendChild(mainItem);

            if (visitCount > 1) {
                const subList = document.createElement('div');
                subList.id = `sublist-${latestVisit.id}`;
                subList.className = 'accordion-content';
                
                const sortedVisits = place.visits.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                sortedVisits.forEach(v => {
                    const vScore = ((parseInt(v.ratingGuinness) + parseInt(v.ratingPour) + parseInt(v.ratingService)) / 3).toFixed(1);
                    
                    const subItem = document.createElement('div');
                    subItem.className = 'sub-item';
                    subItem.style.cssText = 'display: flex; justify-content: space-between; padding: 12px 15px; border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; background: rgba(0,0,0,0.2);';
                    
                    subItem.onclick = (e) => {
                        e.stopPropagation();
                        openDetailModalFromId(v.id);
                    };

                    subItem.innerHTML = `
                        <span style="color: #ccc; font-size: 0.9rem;">${v.date}</span>
                        <span style="font-weight: bold; color: var(--guinness-gold); font-size: 0.9rem;">${vScore}/10</span>
                    `;
                    subList.appendChild(subItem);
                });

                wrapper.appendChild(subList);
            }
            
            reviewsList.appendChild(wrapper);
        });
    }

    // --- Init ---
    
    // Sliders & Values setup
    setupSlider('ratingGuinness', 'val-guinness');
    setupSlider('ratingPour', 'val-pour');
    setupSlider('ratingService', 'val-service');

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

    async function fetchReviews() {
        try {
            const response = await fetch('/api/reviews');
            currentReviews = await response.json();
            updatePlacesDatalist(currentReviews);
            renderReviews(currentReviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            if(reviewsList) reviewsList.innerHTML = '<p style="text-align:center;">Kunne ikke hente logbog.</p>';
        }
    }

    // Event Listeners (Resten)
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredReviews = currentReviews.filter(review => 
                review.name.toLowerCase().includes(searchTerm)
            );
            renderReviews(filteredReviews);
        });
    }

    if(fabBtn) {
        fabBtn.addEventListener('click', () => {
            resetForm();
            openModal();
        });
    }

    if(closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if(btnEdit) {
        btnEdit.addEventListener('click', () => {
            closeOptionsModal();
            openEditModal(optionsReviewId.value);
        });
    }
    if(btnDelete) {
        btnDelete.addEventListener('click', () => {
            closeOptionsModal();
            deleteReview(optionsReviewId.value);
        });
    }
    if(btnCancelOptions) {
        btnCancelOptions.addEventListener('click', closeOptionsModal);
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
        if (e.target === document.getElementById('infoModal')) {
            document.getElementById('infoModal').classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
        if (e.target === optionsModal) {
            closeOptionsModal();
        }
    });

    if(closeInfoBtn) {
        closeInfoBtn.addEventListener('click', () => {
            document.getElementById('infoModal').classList.remove('active');
            document.body.classList.remove('no-scroll');
        });
    }

    // --- Start App ---
    // Load data til sidst, når alle funktioner er klar
    fetchReviews();
});