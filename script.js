document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'https://api.coincap.io/v2/assets';

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const top10 = data.data.slice(0, 10);
            const cryptoList = document.getElementById('cryptoList');

            top10.forEach(crypto => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <h3>${crypto.name} (${crypto.symbol})</h3>
                    <p>Rank: ${crypto.rank}</p>
                    <p>Price: $${parseFloat(crypto.priceUsd).toFixed(2)}</p>
                    <button class="viewBtn" data-id="${crypto.id}">press me</button>
                `;
                cryptoList.appendChild(card);
            });
            document.querySelectorAll('.viewBtn').forEach(button => {
                button.addEventListener('click', function () {
                    const cryptoId = this.getAttribute('data-id');
                    showModal(cryptoId);
                });
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});

function showModal(cryptoId) {
    const modal = document.getElementById('cryptoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalRank = document.getElementById('modalRank');
    const modalPrice = document.getElementById('modalPrice');
    const backBtn = document.getElementById('backBtn');
    const ctx = document.getElementById('cryptoChart').getContext('2d');

    modal.style.display = 'block';

    const apiUrl = `https://api.coincap.io/v2/assets/${cryptoId}/history?interval=d1`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const prices = data.data.map(point => ({ x: new Date(point.time).toLocaleDateString(), y: parseFloat(point.priceUsd) }));

            fetch(`https://api.coincap.io/v2/assets/${cryptoId}`)
                .then(response => response.json())
                .then(cryptoData => {
                    modalTitle.textContent = `${cryptoData.data.name} (${cryptoData.data.symbol})`;
                    modalRank.textContent = `Rank: ${cryptoData.data.rank}`;
                    modalPrice.textContent = `Price: $${parseFloat(cryptoData.data.priceUsd).toFixed(2)}`;

                    if (window.cryptoChart) {
                        window.cryptoChart.destroy();
                    }

                    window.cryptoChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: prices.map(point => point.x),
                            datasets: [{
                                label: 'Price in USD',
                                data: prices,
                                borderColor: 'rgba(75, 192, 192, 1)',
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                fill: true
                            }]
                        },
                        options: {
                            scales: {
                                x: {
                                    type: 'time',
                                    time: {
                                        unit: 'day'
                                    }
                                },
                                y: {
                                    beginAtZero: false
                                }
                            }
                        }
                    });
                })
                .catch(error => console.error('Error fetching crypto data:', error));
        })
        .catch(error => console.error('Error fetching chart data:', error));


    document.querySelector('.close').onclick = function () {
        modal.style.display = "none";
    }




    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
}
