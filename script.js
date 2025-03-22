const youtubeApiKey = 'AIzaSyA43RzI_erBWgxjiYcHcuT5DcrLN9tbORk'; // YouTube API Key

document.getElementById('search-button').addEventListener('click', () => {
    const searchTerm = document.getElementById('search-input').value;
    document.getElementById('youtube-results').innerHTML = '<p>Searching YouTube...</p>';
    document.getElementById('dailymotion-results').innerHTML = '<p>Searching Dailymotion...</p>';
    searchYouTube(searchTerm);
    searchDailymotion(searchTerm);
});

function searchYouTube(query) {
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${query}&key=${youtubeApiKey}`)
        .then(response => response.json())
        .then(data => {
            if (data.items) {
                const formattedVideos = data.items.map(video => ({
                    id: video.id.videoId,
                    title: video.snippet.title
                }));
                displayResults(formattedVideos, 'YouTube');
            }
        })
        .catch(error => {
            console.error('YouTube API Error:', error);
        });
}

function searchDailymotion(query) {
    fetch(`https://api.dailymotion.com/videos?search=${query}&fields=id,title&limit=10&language=en`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (!data) {
                throw new Error('Invalid response from Dailymotion API');
            }
            if (data.error) {
                throw new Error(`Dailymotion API Error: ${data.error.message || 'Unknown error'}`);
            }
            if (data.list && data.list.length > 0) {
                const formattedVideos = data.list.map(video => ({
                    id: video.id,
                    title: video.title
                }));
                displayResults(formattedVideos, 'Dailymotion');
            } else {
                document.getElementById('dailymotion-results').innerHTML = 
                    '<p>No videos found. Try a different search term.</p>';
            }
        })
        .catch(error => {
            console.error('Dailymotion API Error:', error);
            let errorMessage = 'Unable to load Dailymotion results.';
            if (error.message.includes('HTTP error! status: 429')) {
                errorMessage += ' Too many requests. Please wait a moment and try again.';
            } else if (error.message.includes('HTTP error! status: 403')) {
                errorMessage += ' Access denied. Please try again later.';
            } else if (error.message.includes('HTTP error! status: 503')) {
                errorMessage += ' Service temporarily unavailable. Please try again later.';
            } else {
                errorMessage += ' Please try again later.';
            }
            document.getElementById('dailymotion-results').innerHTML = `<p>${errorMessage}</p>`;
        });
}

function displayResults(videos, platform) {
    if (!videos || videos.length === 0) return;
    const container = document.getElementById(
        platform === 'YouTube' ? 'youtube-results' : 'dailymotion-results'
    );
    container.innerHTML = '';
    videos.forEach(video => {
        if (!video.id) return;
        const videoUrl = platform === 'YouTube' 
            ? `https://www.youtube.com/embed/${video.id}?mute=1` 
            : `https://www.dailymotion.com/embed/video/${video.id}?mute=1`;
        container.innerHTML += `
            <div class="video-container">
                <iframe src="${videoUrl}" frameborder="0" allowfullscreen></iframe>
                <p><strong>${video.title}</strong></p>
            </div>
        `;
    });
}
