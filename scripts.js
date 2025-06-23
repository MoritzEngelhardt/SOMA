const videos = [
    { id: 1, src: "video_audio_1.mp4" },
    { id: 2, src: "video_audio_2.mp4" },
    { id: 3, src: "video_audio_3.mp4" },
    { id: 4, src: "video_audio_4.mp4" }
];

// Shuffle videos randomly
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

shuffleArray(videos);

const container = document.getElementById('videoContainer');
const videoViewingDurations = {}; // Object to store video viewing durations

// Insert videos and rating screens
videos.forEach(video => {
    // Initialize duration for each video
    videoViewingDurations[video.id] = { totalDuration: 0, lastStartTime: null };

    // Video Section
    const videoBox = document.createElement("div");
    videoBox.classList.add("screen", "video-box");
    // Add data-video-id to videoBox directly
    videoBox.setAttribute("data-video-id", video.id);
    videoBox.innerHTML = `
      <video loop playsinline>
        <source src="${video.src}" type="video/mp4">
      </video>
    `;
    container.appendChild(videoBox);

    // Rating Section
    const ratingBox = document.createElement("div");
    ratingBox.classList.add("screen", "rating-box");
    ratingBox.setAttribute("data-video-id", video.id);
    ratingBox.innerHTML = `
      <div class="rating-text">Rate this video:</div>
      <div class="stars" data-question="videoRating">
        <span class="star" data-value="1">★</span>
        <span class="star" data-value="2">★</span>
        <span class="star" data-value="3">★</span>
        <span class="star" data-value="4">★</span>
        <span class="star" data-value="5">★</span>
      </div>

      <div class="rating-text">How likely are you to buy this product?</div>
      <div class="stars" data-question="purchaseLikelihood">
        <span class="star" data-value="1">★</span>
        <span class="star" data-value="2">★</span>
        <span class="star" data-value="3">★</span>
        <span class="star" data-value="4">★</span>
        <span class="star" data-value="5">★</span>
      </div>
    `;
    container.appendChild(ratingBox);

    // Get the video element for later use
    const videoElement = videoBox.querySelector("video");

    // Ensure the video plays with sound
    videoElement.muted = false;

    // Set up Intersection Observer to control playback and track duration
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.target === videoElement) { // Ensure we are observing the video element itself
                    const currentVideoId = videoElement.closest('.video-box').getAttribute('data-video-id'); // Get ID directly from videoBox

                    if (entry.isIntersecting) {
                        // Play video when it's in view
                        videoElement.play();
                        // Record start time if not already recorded
                        if (videoViewingDurations[currentVideoId] && !videoViewingDurations[currentVideoId].lastStartTime) {
                            videoViewingDurations[currentVideoId].lastStartTime = Date.now();
                        }
                    } else {
                        // Pause video when it's out of view
                        videoElement.pause();
                        // Calculate and add duration if a start time was recorded
                        if (videoViewingDurations[currentVideoId] && videoViewingDurations[currentVideoId].lastStartTime) {
                            const duration = Date.now() - videoViewingDurations[currentVideoId].lastStartTime;
                            videoViewingDurations[currentVideoId].totalDuration += duration;
                            videoViewingDurations[currentVideoId].lastStartTime = null; // Reset for next intersection
                        }
                    }
                }
            });
        },
        { threshold: 0.8 } // Increased threshold to 80% for more accurate "in view" time
    );

    // Observe the video element
    observer.observe(videoElement);
});

// Add final summary section
const summaryBox = document.createElement("div");
summaryBox.classList.add("screen", "rating-box");
summaryBox.innerHTML = `
  <div class="rating-text">Thank you for rating all videos!</div>
  <button class="download-btn">Download Ratings</button>
`;
container.appendChild(summaryBox);

let currentIndex = 0;
const screens = document.querySelectorAll(".screen");
const ratings = {};

// --- Dragging functionality variables ---
let isDragging = false;
let startY;
let scrollTop;
let scrollTimeout; // For debouncing scroll end

// --- Implement drag to scroll ---
container.addEventListener('mousedown', (e) => {
    // Only respond to left mouse button (button 0)
    if (e.button === 0) {
        isDragging = true;
        startY = e.clientY;
        scrollTop = container.scrollTop;
        container.style.cursor = 'grabbing';
        container.style.userSelect = 'none'; // Prevent text selection
        if (scrollTimeout) clearTimeout(scrollTimeout); // Clear any pending snap
    }
});

container.addEventListener('mouseleave', () => {
    if (isDragging) {
        isDragging = false;
        container.style.cursor = 'grab';
        container.style.removeProperty('user-select');
        snapToNearestScreen(); // Snap when mouse leaves while dragging
    }
});

container.addEventListener('mouseup', () => {
    if (isDragging) { // Only snap if a drag actually happened
        isDragging = false;
        container.style.cursor = 'grab';
        container.style.removeProperty('user-select');
        snapToNearestScreen(); // Snap when mouse button is released
    }
});

container.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent default browser scrolling/selection
    const walk = (e.clientY - startY); // How far mouse has moved
    container.scrollTop = scrollTop - walk; // Adjust scroll position
});

// --- Function to snap to the nearest screen ---
function snapToNearestScreen() {
    if (screens.length === 0) return; // Guard against no screens

    const currentScrollTop = container.scrollTop;

    let closestIndex = 0;
    let minDiff = Infinity; // difference from a perfectly aligned screen top

    screens.forEach((screen, index) => {
        const screenOffsetTop = screen.offsetTop;
        // Calculate the absolute difference between current scroll position and screen's ideal top
        const diff = Math.abs(currentScrollTop - screenOffsetTop);

        if (diff < minDiff) {
            minDiff = diff;
            closestIndex = index;
        }
    });

    // Check if we are already very close to the target screen's top.
    // This prevents unnecessary re-snaps if the user has already scrolled almost perfectly.
    const currentScreenTop = screens[closestIndex].offsetTop;
    // Only scroll if the target index is different from current, or if not perfectly aligned (tolerance of 2px)
    if (closestIndex !== currentIndex || Math.abs(currentScrollTop - currentScreenTop) > 2) {
        currentIndex = closestIndex; // Update the global current index
        screens[currentIndex].scrollIntoView({ behavior: 'smooth' });
    }
    // If already snapped or very close, do nothing.
}


// Function to handle the transition between screens and log final duration for the current video
container.addEventListener('scroll', () => {
    // Debounce the scroll event to trigger snapToNearestScreen only when scrolling stops
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        // Only snap if not currently dragging (to avoid fighting the drag)
        if (!isDragging) {
            snapToNearestScreen();
        }
    }, 100); // Debounce time set to 100ms for responsiveness and stability


    const videoElements = document.querySelectorAll('.video-box video');
    videoElements.forEach(videoElement => {
        const videoId = videoElement.closest('.video-box').getAttribute('data-video-id');

        if (videoId && videoViewingDurations[videoId]) {
            const rect = videoElement.getBoundingClientRect();
            // Using container.clientHeight instead of window.innerHeight for accuracy within the mockup
            const isMostlyOutOfView = (rect.top >= container.clientHeight || rect.bottom <= 0);

            if (isMostlyOutOfView && videoViewingDurations[videoId].lastStartTime) {
                const duration = Date.now() - videoViewingDurations[videoId].lastStartTime;
                videoViewingDurations[videoId].totalDuration += duration;
                videoViewingDurations[videoId].lastStartTime = null;
            }
        }
    });
});


function scrollToNext() {
    if (currentIndex < screens.length - 1) {
        const currentScreen = screens[currentIndex];
        if (currentScreen.classList.contains('video-box')) {
            const videoElement = currentScreen.querySelector('video');
            const videoId = videoElement.closest('.video-box').getAttribute('data-video-id');

            if (videoId && videoViewingDurations[videoId] && videoViewingDurations[videoId].lastStartTime) {
                const duration = Date.now() - videoViewingDurations[videoId].lastStartTime;
                videoViewingDurations[videoId].totalDuration += duration;
                videoViewingDurations[videoId].lastStartTime = null;
            }
        }
        currentIndex++;
        screens[currentIndex].scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToPrevious() {
    if (currentIndex > 0) {
        const currentScreen = screens[currentIndex];
        if (currentScreen.classList.contains('video-box')) {
            const videoElement = currentScreen.querySelector('video');
            const videoId = videoElement.closest('.video-box').getAttribute('data-video-id');

            if (videoId && videoViewingDurations[videoId] && videoViewingDurations[videoId].lastStartTime) {
                const duration = Date.now() - videoViewingDurations[videoId].lastStartTime;
                videoViewingDurations[videoId].totalDuration += duration;
                videoViewingDurations[videoId].lastStartTime = null;
            }
        }
        currentIndex--;
        screens[currentIndex].scrollIntoView({ behavior: 'smooth' });
    }
}


// Handle star rating clicks
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("star")) {
        const starContainer = event.target.parentElement;
        const ratingValue = event.target.getAttribute("data-value");
        const ratingBox = starContainer.closest(".rating-box");
        const videoId = ratingBox ? ratingBox.getAttribute("data-video-id") : null;
        const questionType = starContainer.getAttribute("data-question");

        if (videoId) {
            starContainer.querySelectorAll(".star").forEach(star => {
                star.classList.toggle("selected", parseInt(star.getAttribute("data-value")) <= parseInt(ratingValue));
            });

            if (!ratings[videoId]) {
                ratings[videoId] = { videoRating: null, purchaseLikelihood: null };
            }

            ratings[videoId][questionType] = parseInt(ratingValue);
        }
    }
});

// Next button event listeners
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("next-btn")) {
        scrollToNext();
    }
});

// Function to download CSV file
function downloadCSV() {
    const csvRows = ["Video ID,Video Rating,Purchase Likelihood,Viewing Duration (ms)"]; // Added duration column
    // Iterate over all videos to ensure all durations are included, even if not rated
    videos.forEach(video => {
        const videoId = video.id;
        const ratingData = ratings[videoId] || { videoRating: "N/A", purchaseLikelihood: "N/A" }; // Use "N/A" if no rating
        const duration = videoViewingDurations[videoId] ? videoViewingDurations[videoId].totalDuration : 0;
        csvRows.push(`${videoId},${ratingData.videoRating},${ratingData.purchaseLikelihood},${duration}`);
    });

    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ratings_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    console.log("CSV file is being downloaded...");
}

document.addEventListener("click", (event) => {
    if (event.target.classList.contains("download-btn")) {
        downloadCSV();
    }
});

// Final check for the last viewed video when leaving the page (optional but good for data integrity)
window.addEventListener('beforeunload', () => {
    const videoElements = document.querySelectorAll('.video-box video');
    videoElements.forEach(videoElement => {
        const videoId = videoElement.closest('.video-box').getAttribute('data-video-id');
        if (videoId && videoViewingDurations[videoId] && videoViewingDurations[videoId].lastStartTime) {
            const duration = Date.now() - videoViewingDurations[videoId].lastStartTime;
            videoViewingDurations[videoId].totalDuration += duration;
            videoViewingDurations[videoId].lastStartTime = null;
        }
    });
});
