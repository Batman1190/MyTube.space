const youtubeApiKey = 'AIzaSyA43RzI_erBWgxjiYcHcuT5DcrLN9tbORk'; // YouTube API Key

document.getElementById('search-button').addEventListener('click', () => {
    const searchTerm = document.getElementById('search-input').value;
    document.getElementById('youtube-results').innerHTML = '<p>Searching YouTube...</p>';
    searchYouTube(searchTerm);
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

function displayResults(videos, platform) {
    if (!videos || videos.length === 0) return;
    const container = document.getElementById('youtube-results');
    container.innerHTML = '';
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                iframe.src = iframe.dataset.src;
                observer.unobserve(iframe);
            }
        });
    }, { threshold: 0.1 });

    videos.forEach(video => {
        if (!video.id) return;
        const videoUrl = `https://www.youtube.com/embed/${video.id}?mute=1&enablejsapi=1`;
        
        const videoDiv = document.createElement('div');
        videoDiv.className = 'video-container';
        videoDiv.innerHTML = `
            <iframe data-src="${videoUrl}" frameborder="0" allowfullscreen loading="lazy"></iframe>
            <p><strong>${video.title}</strong></p>
        `;

        const iframe = videoDiv.querySelector('iframe');
        
        iframe.onerror = () => {
            console.error(`Failed to load video: ${video.id}`);
            iframe.parentElement.innerHTML = `
                <div class="video-error">
                    <p>Failed to load video. Please try refreshing.</p>
                </div>
            `;
        };

        const cleanup = () => {
            observer.unobserve(iframe);
            iframe.src = 'about:blank';
            iframe.onerror = null;
        };

        new MutationObserver((mutations, obs) => {
            if (!document.contains(iframe)) {
                cleanup();
                obs.disconnect();
            }
        }).observe(document.body, { childList: true, subtree: true });

        container.appendChild(videoDiv);
        observer.observe(iframe);
    });
}