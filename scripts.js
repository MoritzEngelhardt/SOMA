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
const videoViewingDurations = {}; // New object to store video viewing durations

// Insert videos and rating screens
videos.forEach(video => {
    // Initialize duration for each video
    videoViewingDurations[video.id] = { totalDuration: 0, lastStartTime: null };

    // Video Section
    const videoBox = document.createElement("div");
    videoBox.classList.add("screen", "video-box");
    // === FIX: Add data-video-id to videoBox directly ===
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

// Function to handle the transition between screens and log final duration for the current video
container.addEventListener('scroll', () => {
    const videoElements = document.querySelectorAll('.video-box video');
    videoElements.forEach(videoElement => {
        // === FIX: Get videoId directly from videoBox ===
        const videoId = videoElement.closest('.video-box').getAttribute('data-video-id');

        // Only process if it's a valid videoId and it's in our tracking object
        if (videoId && videoViewingDurations[videoId]) {
            const rect = videoElement.getBoundingClientRect();
            // Check if the video is *mostly* out of the visible screen
            const isMostlyOutOfView = (rect.top >= window.innerHeight || rect.bottom <= 0);

            if (isMostlyOutOfView && videoViewingDurations[videoId].lastStartTime) {
                // Video is out of view due to scroll, log duration
                const duration = Date.now() - videoViewingDurations[videoId].lastStartTime;
                videoViewingDurations[videoId].totalDuration += duration;
                videoViewingDurations[videoId].lastStartTime = null; // Reset
            }
        }
    });
});


function scrollToNext() {
    if (currentIndex < screens.length - 1) {
        // Before scrolling to the next, check if the current screen is a video and record its duration
        const currentScreen = screens[currentIndex];
        if (currentScreen.classList.contains('video-box')) {
            const videoElement = currentScreen.querySelector('video');
            // === FIX: Get videoId directly from videoBox ===
            const videoId = videoElement.closest('.video-box').getAttribute('data-video-id');

            if (videoId && videoViewingDurations[videoId] && videoViewingDurations[videoId].lastStartTime) {
                const duration = Date.now() - videoViewingDurations[videoId].lastStartTime;
                videoViewingDurations[videoId].totalDuration += duration;
                videoViewingDurations[videoId].lastStartTime = null; // Reset
            }
        }
        currentIndex++;
        screens[currentIndex].scrollIntoView({ behavior: 'smooth' });
    }
}

function scrollToPrevious() {
    if (currentIndex > 0) {
        // Before scrolling to the previous, check if the current screen is a video and record its duration
        const currentScreen = screens[currentIndex];
        if (currentScreen.classList.contains('video-box')) {
            const videoElement = currentScreen.querySelector('video');
            // === FIX: Get videoId directly from videoBox ===
            const videoId = videoElement.closest('.video-box').getAttribute('data-video-id');

            if (videoId && videoViewingDurations[videoId] && videoViewingDurations[videoId].lastStartTime) {
                const duration = Date.now() - videoViewingDurations[videoId].lastStartTime;
                videoViewingDurations[videoId].totalDuration += duration;
                videoViewingDurations[videoId].lastStartTime = null; // Reset
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
        // Ensure ratingBox is found before trying to get attribute
        const videoId = ratingBox ? ratingBox.getAttribute("data-video-id") : null;
        const questionType = starContainer.getAttribute("data-question"); // Get "videoRating" or "purchaseLikelihood"

        if (videoId) { // Only proceed if videoId is valid
            starContainer.querySelectorAll(".star").forEach(star => {
                star.classList.toggle("selected", parseInt(star.getAttribute("data-value")) <= parseInt(ratingValue));
            });

            // Ensure we store both ratings separately
            if (!ratings[videoId]) {
                ratings[videoId] = { videoRating: null, purchaseLikelihood: null };
            }

            // Assign the correct value based on question type
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
        // === FIX: Get videoId directly from videoBox ===
        const videoId = videoElement.closest('.video-box').getAttribute('data-video-id');
        if (videoId && videoViewingDurations[videoId] && videoViewingDurations[videoId].lastStartTime) {
            const duration = Date.now() - videoViewingDurations[videoId].lastStartTime;
            videoViewingDurations[videoId].totalDuration += duration;
            videoViewingDurations[videoId].lastStartTime = null;
        }
    });
});
