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
    fetch(`https://api.dailymotion.com/videos?search=${query}&fields=id,title,thumbnail_url`)
        .then(response => response.json())
        .then(data => {
            if (data.list) {
                const formattedVideos = data.list.map(video => ({
                    id: video.id,
                    title: video.title
                }));
                displayResults(formattedVideos, 'Dailymotion');
            }
        })
        .catch(error => {
            console.error('Dailymotion API Error:', error);
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
            ? `https://www.youtube.com/embed/${video.id}` 
            : `https://www.dailymotion.com/embed/video/${video.id}`;
        container.innerHTML += `
            <div class="video-container">
                <iframe src="${videoUrl}" frameborder="0" allowfullscreen></iframe>
                <p><strong>${video.title}</strong></p>
            </div>
        `;
    });
}
