// === Discogs credentials ===
const API_TOKEN = 'CBRfbbxnzKDOgysSCObbCdTJxfhLDVIatHVttkEF'; // Replace with your token
const USERNAME = 'Birk38'

// Discogs collection endpoint (first page, 100 items)
const COLLECTION_URL = `https://api.discogs.com/users/${USERNAME}/collection/folders/0/releases?per_page=100`;

const grid = document.getElementById('collectionGrid');

let collection = [];

// Fetch collection from Discogs
async function fetchCollection() {
    try {
        const response = await fetch(COLLECTION_URL, {
            headers: {
                'Authorization': `Discogs token=${API_TOKEN}`
            }
        });

        const data = await response.json();

        collection = data.releases.map(item => {
            const info = item.basic_information;

            return {
                title: info.title || 'Unknown Title',
                artist: info.artists
                    ? info.artists
                          .map(a => a.name.replace(/\s*\(\d+\)/, ''))
                          .join(', ')
                    : 'Unknown Artist',
                year: info.year || '',
                cover: info.cover_image || 'placeholder.png'
            };
        });

        sortByArtist();
        renderCollection();

    } catch (err) {
        console.error('Error fetching collection:', err);
        grid.innerHTML = '<p>Failed to load collection.</p>';
    }
}

// Sort collection alphabetically by artist (A–Z)
function sortByArtist() {
    collection.sort((a, b) =>
        a.artist.localeCompare(b.artist, undefined, { sensitivity: 'base' })
    );
}

// Render collection to grid
function renderCollection() {
    grid.innerHTML = '';

    collection.forEach(vinyl => {
        const vinylDiv = document.createElement('div');
        vinylDiv.className = 'vinyl';

        vinylDiv.innerHTML = `
            <img src="${vinyl.cover}" alt="${vinyl.title}">
            <div><strong>${vinyl.title}</strong></div>
            <div>${vinyl.artist}</div>
            <div>${vinyl.year}</div>
        `;

        grid.appendChild(vinylDiv);
    });
}

// Load collection on page load
fetchCollection();

