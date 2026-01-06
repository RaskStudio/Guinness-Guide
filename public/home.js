document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('randomReviewContainer'); // Vi genbruger container-ID'et selvom navnet er lidt off nu
    const header = document.querySelector('h3'); // Vi ændrer overskriften via JS eller HTML

    if(header) header.textContent = 'Top 3 Pints 🏆';

    try {
        const response = await fetch('/api/reviews');
        const reviews = await response.json();

        if (reviews.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #888;">Ingen anmeldelser endnu.</p>';
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

    } catch (error) {
        console.error('Fejl:', error);
        container.innerHTML = '<p style="text-align: center; color: #888;">Kunne ikke hente toplisten.</p>';
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
            <div class="top-score">${formattedScore}</div>
        `;

        list.appendChild(item);
    });

    container.appendChild(list);
}