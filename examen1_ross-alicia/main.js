const artworksHtml = document.querySelector('.artworks');
const modal = document.getElementById('artModal');
const closeButton = modal.querySelector('.close');
const searchButton = document.getElementById('searchBtn');
const searchInput = document.getElementById('search');
const historyList = document.getElementById('historyList');

function getHistory() {
    const gotHistory = localStorage.getItem('searchHistory');
    return gotHistory ? JSON.parse(gotHistory) : [];
}

function saveHistory(history){
    localStorage.setItem('searchHistory', JSON.stringify(history));
}

function addToSearchHistory(search){
    const history = getHistory();
    history.unshift(search);
    saveHistory(history);
}

function searchArtWorks(input) {
    fetch('https://api.artic.edu/api/v1/artworks/search?q=' + input)
        .then(response => response.json())
        .then(data => {
            artworksHtml.innerHTML = ''; // Vider les résultats précédents
            data.data.forEach(object => {
                fetchArtworks(object.api_link);
            });
        });
}

function updateHistoryDisplay(){
    const history = getHistory();

    historyList.innerHTML = '';

    history.forEach(search => {
        const li = document.createElement('li');
        li.textContent = search;
        historyList.appendChild(li);
    });
}

searchButton.addEventListener('click', () => {
    const searchValue = searchInput.value.trim(); // Récupérer la valeur d'entrée
    if (searchValue) {
        searchArtWorks(searchValue); // Appeler la fonction de recherche
        addToSearchHistory(searchValue);
    }
});

// Fonction pour rechercher et afficher les œuvres
function fetchArtworks(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const artwork = data.data;

            // Récupérer l'URL d'image
            const artImageId = artwork.image_id
                ? `${data.config.iiif_url}/${artwork.image_id}/full/full/0/default.jpg`
                : 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg'; // Image de remplacement

            // Créer une nouvelle carte d'œuvre
            const artCard = document.createElement('div');
            artCard.classList.add('art-card');

            const img = document.createElement('img');
            img.classList.add('art-image');
            img.src = artImageId; // Définir la source de l'image
            img.alt = artwork.title; // Texte alternatif

            const title = document.createElement('h3');
            title.classList.add('art-title');
            title.textContent = artwork.title; // Titre

            const button = document.createElement('button');
            button.classList.add('detail-button');
            button.textContent = 'Détails';
            button.dataset.url = `https://api.artic.edu/api/v1/artworks/${artwork.id}`; // Ajouter l'URL

            // Ajouter les éléments à la carte 
            artCard.appendChild(img);
            artCard.appendChild(title);
            artCard.appendChild(button);

            artworksHtml.appendChild(artCard); // Ajouter la carte au conteneur
        });
}

// Gestion du clic sur une œuvre pour afficher les détails
artworksHtml.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        const url = event.target.getAttribute('data-url');
        showArtworkDetails(url);
    }
});

// Fonction pour afficher les détails dans le modal
function showArtworkDetails(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const artwork = data.data;

            // Mise à jour du modal avec les détails de l'œuvre
            document.getElementById('modal-title').textContent = artwork.title;
            document.getElementById('modal-image').src = artwork.image_id
                ? `https://www.artic.edu/iiif/2/${artwork.image_id}/full/200,/0/default.jpg`
                : 'https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg';
            document.getElementById('modal-artist').textContent = artwork.artist_title || 'Inconnu';
            document.getElementById('modal-date').textContent = artwork.date_display || 'Inconnu';
            document.getElementById('modal-description').textContent = artwork.thumbnail ? artwork.thumbnail.alt_text : 'Aucune description disponible';
            document.getElementById('modal-material').textContent = artwork.medium_display || 'Non spécifié';
            document.getElementById('modal-terms').textContent = artwork.term_titles ? artwork.term_titles.join(', ') : 'Aucun terme disponible';

            // Afficher le modal
            modal.style.display = 'block';
        });
}

// Fermer le modal quand on clique sur le bouton de fermeture
closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
});

updateHistoryDisplay();