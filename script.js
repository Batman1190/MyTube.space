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
        platform === 'YouTube' ? 'youtube-section' : 'dailymotion-section'
    ).querySelector('.video-gallery');
    container.innerHTML = '';
    
    const maxVisibleVideos = window.innerWidth <= 768 ? 4 : 10;
    const limitedVideos = videos.slice(0, maxVisibleVideos);
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const iframe = entry.target;
                if (!iframe.src && iframe.dataset.src) {
                    iframe.src = iframe.dataset.src;
                    iframe.parentElement.classList.add('loading');
                    iframe.addEventListener('load', () => {
                        iframe.classList.add('loaded');
                        iframe.parentElement.classList.remove('loading');
                    }, { once: true });
                }
                observer.unobserve(iframe);
            }
        });
    }, { threshold: 0.1, rootMargin: '50px' });

    limitedVideos.forEach(video => {
        if (!video.id) return;
        const videoUrl = platform === 'YouTube' 
            ? `https://www.youtube.com/embed/${video.id}?mute=1&enablejsapi=1` 
            : `https://www.dailymotion.com/embed/video/${video.id}?mute=1&api=1`;
        
        const videoDiv = document.createElement('div');
        videoDiv.className = 'video-container';
        videoDiv.innerHTML = `
            <iframe data-src="${videoUrl}" frameborder="0" allowfullscreen loading="lazy"></iframe>
            <p><strong>${video.title}</strong></p>
            <div class="loading-indicator">Loading...</div>
        `;

        const iframe = videoDiv.querySelector('iframe');
        
        iframe.addEventListener('error', () => {
            console.error(`Failed to load video: ${video.id}`);
            videoDiv.innerHTML = `
                <div class="video-error">
                    <p>Failed to load video. Please try refreshing.</p>
                </div>
            `;
        }, { once: true });

        const cleanup = () => {
            observer.unobserve(iframe);
            iframe.src = 'about:blank';
            iframe.remove();
            videoDiv.remove();
        };

        if ('IntersectionObserver' in window) {
            const cleanupObserver = new IntersectionObserver((entries) => {
                if (!entries[0].isIntersecting) {
                    cleanup();
                    cleanupObserver.disconnect();
                }
            }, { threshold: 0 });
            cleanupObserver.observe(videoDiv);
        }

        container.appendChild(videoDiv);
        observer.observe(iframe);
    });

    if (videos.length > maxVisibleVideos) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'load-more-btn';
        loadMoreBtn.textContent = 'Load More Videos';
        loadMoreBtn.onclick = () => {
            const nextBatch = videos.slice(maxVisibleVideos, videos.length);
            displayResults(nextBatch, platform);
            loadMoreBtn.remove();
        };
        container.appendChild(loadMoreBtn);
    }
}
