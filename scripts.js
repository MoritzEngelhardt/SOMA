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

  // Insert videos and rating screens
  videos.forEach(video => {
    // Video Section
    const videoBox = document.createElement("div");
    videoBox.classList.add("screen", "video-box");
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
  
    // Set up Intersection Observer to control playback based on visibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Play video when it's in view
            videoElement.play();
          } else {
            // Pause video when it's out of view
            videoElement.pause();
          }
        });
      },
      { threshold: 0.5 } // Trigger when at least 50% of the video is in view
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
  
  function scrollToNext() {
    if (currentIndex < screens.length - 1) {
      currentIndex++;
      screens[currentIndex].scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  function scrollToPrevious() {
    if (currentIndex > 0) {
      currentIndex--;
      screens[currentIndex].scrollIntoView({ behavior: 'smooth' });
    }
  }
  
  // Handle star rating clicks
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("star")) {
      const starContainer = event.target.parentElement;
      const ratingValue = event.target.getAttribute("data-value");
      const videoId = starContainer.closest(".rating-box").getAttribute("data-video-id");
      const questionType = starContainer.getAttribute("data-question"); // Get "videoRating" or "purchaseLikelihood"
  
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
  });
  
  // Next button event listeners
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("next-btn")) {
      scrollToNext();
    }
  });
  
  // Function to download CSV file
  function downloadCSV() {
    const csvRows = ["Video ID,Video Rating,Purchase Likelihood"];
    for (const [videoId, ratingData] of Object.entries(ratings)) {
      csvRows.push(`${videoId},${ratingData.videoRating || "N/A"},${ratingData.purchaseLikelihood || "N/A"}`);
    }
  
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