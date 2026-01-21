// === Discogs credentials ===
const API_TOKEN = 'CBRfbbxnzKDOgysSCObbCdTJxfhLDVIatHVttkEF'; // Replace with your token
const USERNAME = 'Birk38';       // Replace with your username

// Base URL for fetching first page of collection
const COLLECTION_URL = `https://api.discogs.com/users/${USERNAME}/collection/folders/0/releases?per_page=100`;

// DOM Elements
const spinnitBtn = document.getElementById('spinnitBtn');
const playlistBtn = document.getElementById('playlistBtn');
const resultsDiv = document.getElementById('results');

let collection = []; // Store all vinyls

// Fetch user's collection from Discogs
async function fetchCollection() {
    try {
        const response = await fetch(COLLECTION_URL, {
            headers: {
                'Authorization': `Discogs token=${API_TOKEN}`
            }
        });
        const data = await response.json();

        // Map collection to usable format
        collection = data.releases.map(item => {
            const info = item.basic_information;
            return {
                id: info.id,
                title: info.title || 'Unknown Title',
                artist: info.artists ? info.artists.map(a => a.name).join(', ') : 'Unknown Artist',
                year: info.year || 'Unknown Year',
                cover: info.cover_image || 'placeholder.png' // Use a placeholder if no cover
            };
        });

        console.log(`Collection loaded: ${collection.length} vinyls`);
    } catch (err) {
        console.error('Error fetching collection:', err);
        resultsDiv.innerHTML = '<p style="color:red;">Failed to load collection. Check your token and username.</p>';
    }
}

// Utility: pick n random unique items from array
function getRandomItems(arr, n) {
    const copy = [...arr];
    const result = [];
    while (result.length < n && copy.length > 0) {
        const idx = Math.floor(Math.random() * copy.length);
        result.push(copy.splice(idx, 1)[0]);
    }
    return result;
}

// Display single vinyl (Spinnit)
function displaySingle(vinyl) {
    const cover = vinyl.cover ? vinyl.cover : 'placeholder.png';
    resultsDiv.innerHTML = `
        <div class="vinyl">
            <img src="${cover}" alt="${vinyl.title}">
            <div><strong>${vinyl.title}</strong></div>
            <div>${vinyl.artist}</div>
            <div>${vinyl.year}</div>
            <button id="spinnitAgainBtn">Spinnit again</button>
        </div>
    `;

    // Re-pick the vinyl when button clicked
    document.getElementById('spinnitAgainBtn').addEventListener('click', () => {
        displaySingle(getRandomItems(collection, 1)[0]);
    });
}

// Display playlist of 6 vinyls (Spilleliste)
function displayPlaylist(vinyls) {
    resultsDiv.innerHTML = '';
    
    vinyls.forEach((vinyl, idx) => {
        const vinylDiv = document.createElement('div');
        vinylDiv.className = 'vinyl';
        const vinylCover = vinyl.cover ? vinyl.cover : 'placeholder.png';
        vinylDiv.innerHTML = `
            <img src="${vinylCover}" alt="${vinyl.title}">
            <div><strong>${vinyl.title}</strong></div>
            <div>${vinyl.artist}</div>
            <div>${vinyl.year}</div>
            <button class="replaceBtn" data-idx="${idx}" title="Replace vinyl">×</button>

        `;
        resultsDiv.appendChild(vinylDiv);
    });

    // Replace individual vinyl when × button clicked
    document.querySelectorAll('.replaceBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.getAttribute('data-idx'));
            // Exclude already picked vinyls
            const remaining = collection.filter(v => !vinyls.includes(v));
            if (remaining.length === 0) return; // nothing left to pick
            vinyls[index] = getRandomItems(remaining, 1)[0];
            displayPlaylist(vinyls);
        });
    });
}

// Button event listeners
spinnitBtn.addEventListener('click', () => {
    if (collection.length === 0) return;
    displaySingle(getRandomItems(collection, 1)[0]);
});

playlistBtn.addEventListener('click', () => {
    if (collection.length < 6) {
        resultsDiv.innerHTML = '<p>Not enough vinyls in collection to make a playlist.</p>';
        return;
    }
    displayPlaylist(getRandomItems(collection, 6));
});

// Fetch collection on page load
fetchCollection();
