document.addEventListener('DOMContentLoaded', async () => {
    // 3D Nav Interaction
    const nav3d = document.getElementById('nav3d');

    if (nav3d) {
        nav3d.addEventListener('click', () => {
            // Konfetti (Guinness farver)
            if (window.confetti) {
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.8 }, // Start længere nede
                    colors: ['#000000', '#ffffff', '#c9a050'] // Sort, Skum, Guld
                });
            }
        });
    }

    const container = document.getElementById('randomReviewContainer'); // Vi genbruger container-ID'et selvom navnet er lidt off nu
    const header = document.querySelector('h3'); // Vi ændrer overskriften via JS eller HTML

    if(header) header.textContent = 'Top 3 Pints 🏆';

    try {
        const response = await fetch('/api/reviews');
        const reviews = await response.json();

        if (reviews.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #888;">Ingen anmeldelser endnu.</p>';
            const statsContainer = document.getElementById('statsContainer');
            if(statsContainer) statsContainer.innerHTML = '<p style="text-align: center; color: #888; width: 100%;">Ingen data.</p>';
            return;
        }

        // Beregn score for alle
        const reviewsWithScore = reviews.map(r => {
            const score = (parseInt(r.ratingGuinness) + parseInt(r.ratingPour) + parseInt(r.ratingService)) / 3;
            return { ...r, score: score };
        });

        // Sorter efter score (højest først)
        reviewsWithScore.sort((a, b) => b.score - a.score);

        // Tag top 3
        const top3 = reviewsWithScore.slice(0, 3);

        renderTop3(top3, container);
        renderStats(reviewsWithScore);

    } catch (error) {
        console.error('Fejl:', error);
        container.innerHTML = '<p style="text-align: center; color: #888;">Kunne ikke hente toplisten.</p>';
        const statsContainer = document.getElementById('statsContainer');
        if(statsContainer) statsContainer.innerHTML = '';
    }
});

function renderTop3(reviews, container) {
    container.innerHTML = ''; // Ryd loading tekst
    
    const list = document.createElement('div');
    list.className = 'top-list';

    const medals = ['🥇', '🥈', '🥉'];

    reviews.forEach((review, index) => {
        const item = document.createElement('div');
        item.className = 'top-item';
        item.style.cursor = 'pointer'; // Vis at det kan klikkes
        
        // Gør elementet klikbart
        item.onclick = () => showStatDetails(review, review.name);
        
        // Medalje
        const medal = medals[index] || (index + 1) + '.';
        const formattedScore = review.score.toFixed(1);
        const price = review.price ? `${review.price},-` : '';

        item.innerHTML = `
            <div class="top-rank">${medal}</div>
            <div class="top-info">
                <div class="top-name">${review.name}</div>
                <div class="top-price">${price}</div>
            </div>
            <div class="top-score">${formattedScore}/10</div>
        `;

        list.appendChild(item);
    });

    container.appendChild(list);
}

function renderStats(reviews) {
    const statsContainer = document.getElementById('statsContainer');
    if (!statsContainer) return;

    statsContainer.innerHTML = '';

    // 1. Antal steder
    const totalPlaces = reviews.length;

    // 2. Bedst til prisen (Score / Pris)
    const reviewsWithPrice = reviews.filter(r => r.price > 0);
    
    let bestValuePlace = null;
    let maxRatio = -1;

    reviewsWithPrice.forEach(r => {
        if (r.price > 0 && r.score > 0) {
            const ratio = r.score / r.price;
            if (ratio > maxRatio) {
                maxRatio = ratio;
                bestValuePlace = r;
            }
        }
    });

    // 3. Højeste Score (allerede sorteret, så index 0)
    const topPlace = reviews.length > 0 ? reviews[0] : null;
    const topScore = topPlace ? topPlace.score.toFixed(1) : '-';

    // 4. Laveste Pris
    let minPrice = '-';
    let cheapestPlace = null;
    if(reviewsWithPrice.length > 0) {
        minPrice = Math.min(...reviewsWithPrice.map(r => r.price));
        cheapestPlace = reviewsWithPrice.find(r => r.price === minPrice);
    }

    const statsData = [
        { label: 'Besøgte Steder', value: totalPlaces, sub: 'I alt', data: null },
        { 
            label: 'Bedst til prisen', 
            value: bestValuePlace ? bestValuePlace.name : '-', 
            sub: bestValuePlace ? `${bestValuePlace.score.toFixed(1)} / ${bestValuePlace.price} kr.` : '', 
            data: bestValuePlace 
        },
        { label: 'Top Score', value: topScore + '/10', sub: topPlace ? topPlace.name : '', data: topPlace },
        { label: 'Billigste Pint', value: minPrice + ' kr.', sub: 'Bedste pris', data: cheapestPlace }
    ];

    statsData.forEach(stat => {
        const box = document.createElement('div');
        box.className = 'stat-box';
        
        // Gør boksen klikbar hvis der er data
        if (stat.data) {
            box.style.cursor = 'pointer';
            box.onclick = () => showStatDetails(stat.data, stat.label);
        }
        
        box.innerHTML = `
            <div class="stat-box-label">${stat.label}</div>
            <div class="stat-box-value">${stat.value}</div>
            <div class="stat-box-sub">${stat.sub}</div>
        `;
        
        statsContainer.appendChild(box);
    });
}

function showStatDetails(review, title) {
    const modal = document.getElementById('infoModal');
    const content = document.getElementById('infoContent');
    const modalTitle = document.getElementById('infoTitle');
    
    if(!modal || !content) return;

    modalTitle.textContent = title;

    const imageHtml = review.imagePath 
        ? `<img src="${review.imagePath}" alt="${review.name}" loading="lazy">` 
        : '';

    const smokingIcon = review.smoking ? '🚬 Tilladt' : '🚭 Forbudt';
    const priceDisplay = review.price ? `${review.price},-` : '?';
    const totalScore = review.score ? review.score.toFixed(1) : '?';
    
    // Beregn Value Index (nu skaleret til 10-skala)
    const valueIndex = review.price && review.score 
        ? ((review.score / review.price) * 50).toFixed(0) 
        : '?';

    // Genbrug 'card' strukturen fra reviews.html, men uden rediger/slet menuen
    content.innerHTML = `
        <div class="card" style="margin-bottom: 0; box-shadow: none; border: none; background: transparent; padding: 0;">
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
                        <span class="stat-val">${totalScore}/10</span>
                    </div>
                </div>
            </div>

            <p style="color: #ccc; margin-top: 12px; font-style: italic;">"${review.comment}"</p>
            <span class="review-date">${review.date}</span>
        </div>
    `;

    modal.classList.add('active');
    document.body.classList.add('no-scroll');

    // Luk funktioner
    const closeBtn = document.getElementById('closeInfoModal');
    if(closeBtn) {
        closeBtn.onclick = () => {
            modal.classList.remove('active');
            document.body.classList.remove('no-scroll');
        };
    }
    
    window.onclick = (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            document.body.classList.remove('no-scroll');
        }
    };
}