// js/script.js

// --- Global Scope Variables & Initial Setup ---
let currentPage = 1; // Current page for pagination
const totalPages = 5; // Total pages for blog pagination (adjust as needed)
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('page')) {
    currentPage = parseInt(urlParams.get('page'), 10) || 1;
}
let bgImages = []; // Array for background image URLs
let currentBgIndex = 0; // Index for current background image

// --- Function Definitions ---

/**
 * Updates the pagination buttons based on the current page and total pages.
 */
function updatePagination() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageButtonsContainer = document.getElementById('pageButtons');

    if (!prevBtn || !nextBtn || !pageButtonsContainer) return;

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;

    pageButtonsContainer.innerHTML = '';

    const maxVisiblePages = 5;
    let startPage, endPage;

    if (totalPages <= maxVisiblePages) {
        startPage = 1;
        endPage = totalPages;
    } else {
        const maxPagesBeforeCurrent = Math.floor((maxVisiblePages - 1) / 2);
        const maxPagesAfterCurrent = Math.ceil((maxVisiblePages - 1) / 2);

        if (currentPage <= maxPagesBeforeCurrent + 1) {
            startPage = 1;
            endPage = maxVisiblePages;
        } else if (currentPage >= totalPages - maxPagesAfterCurrent) {
            startPage = totalPages - maxVisiblePages + 1;
            endPage = totalPages;
        } else {
            startPage = currentPage - maxPagesBeforeCurrent;
            endPage = currentPage + maxPagesAfterCurrent;
        }
    }

    if (startPage > 1) {
        const firstPageButton = document.createElement('button');
        firstPageButton.textContent = 1;
        firstPageButton.onclick = () => goToPage(1);
        pageButtonsContainer.appendChild(firstPageButton);
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'pagination-ellipsis';
            pageButtonsContainer.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.onclick = () => goToPage(i);
        if (currentPage === i) {
            pageButton.className = 'active';
        }
        pageButtonsContainer.appendChild(pageButton);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.className = 'pagination-ellipsis';
            pageButtonsContainer.appendChild(ellipsis);
        }
        const lastPageButton = document.createElement('button');
        lastPageButton.textContent = totalPages;
        lastPageButton.onclick = () => goToPage(totalPages);
        pageButtonsContainer.appendChild(lastPageButton);
    }
}

/**
 * Navigates to the previous blog page.
 */
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        navigateToPage();
    }
}

/**
 * Navigates to the next blog page.
 */
function nextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        navigateToPage();
    }
}

/**
 * Redirects the browser to the correct blog page URL based on currentPage.
 */
function navigateToPage() {
    if (isNaN(currentPage) || currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    window.location.href = `blog_page${currentPage}.html?page=${currentPage}`;
}

/**
 * Navigates to a specific blog page number.
 * @param {number} pageNumber - The page number to navigate to.
 */
function goToPage(pageNumber) {
    currentPage = pageNumber;
    navigateToPage();
}

/**
 * Toggles the sidebar visibility and updates the toggle button icon/state.
 * Handles mobile-specific behavior (shifting the button).
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.getElementById('toggle-btn');
    if (!sidebar || !toggleButton) return;

    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    const isMobile = window.innerWidth <= 800; // Match CSS breakpoint

    if (isCollapsed) {
        toggleButton.textContent = '☰'; // Hamburger icon when closed
        toggleButton.classList.remove('toggle-btn-shifted'); // Always remove shift when closed
        toggleButton.style.transform = 'rotate(0deg)';
        toggleButton.blur(); // Remove focus
    } else {
        toggleButton.textContent = '✕'; // Close icon ('X') when open
        if (isMobile) {
            toggleButton.classList.add('toggle-btn-shifted'); // Shift button only on mobile when open
            toggleButton.style.transform = 'rotate(180deg)'; // Rotate 'X'
        } else {
            toggleButton.classList.remove('toggle-btn-shifted'); // Ensure no shift on desktop
            toggleButton.style.transform = 'rotate(0deg)';
            // Icon remains '✕' on desktop when open
        }
    }
}

/**
 * Copies the text content of a sibling <code> element to the clipboard.
 * @param {Event} event - The click event from the copy button.
 */
function copyCode(event) {
    const button = event.target;
    const codeElement = button.closest('.post-code')?.querySelector('code');

    if (!codeElement || !navigator.clipboard) {
        console.error("Cannot find code element or Clipboard API not supported.");
        button.textContent = '复制失败';
        setTimeout(() => { button.textContent = '复制代码'; }, 2000);
        return;
    }

    const originalText = button.textContent;
    navigator.clipboard.writeText(codeElement.innerText).then(() => {
        button.textContent = '✔️ 已复制!';
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('copied');
        }, 2000);
    }).catch((err) => {
        console.error('Copy failed:', err);
        button.textContent = '复制出错';
        setTimeout(() => { button.textContent = originalText; }, 2000);
    });
}

/**
 * Clears the value of the search input field.
 */
function clearSearch() {
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.value = '';
        searchPosts(); // Re-run search to show all posts
    }
}

/**
 * Filters blog posts based on the search input value.
 * (Simple implementation matching title or paragraph content).
 */
function searchPosts() {
    const searchInput = document.getElementById('search');
    if (!searchInput) return;
    const searchTerm = searchInput.value.toLowerCase();
    const posts = document.querySelectorAll('#posts-container .post-item, #latest-posts .post-preview');

    posts.forEach(post => {
        const titleElement = post.querySelector('h2 a, h3 a');
        const title = titleElement ? titleElement.textContent.toLowerCase() : '';
        const contentElement = post.querySelector('p');
        const content = contentElement ? contentElement.textContent.toLowerCase() : '';

        if (title.includes(searchTerm) || content.includes(searchTerm)) {
            post.style.display = 'flex'; // Show matching posts
        } else {
            post.style.display = 'none'; // Hide non-matching posts
        }
    });
}

/**
 * Changes the background image with a fade transition.
 */
function changeBackground() {
    const backgroundElement = document.querySelector('.background'); // Get element inside function
    if (!backgroundElement || bgImages.length === 0) return;

    currentBgIndex = (currentBgIndex + 1) % bgImages.length;
    const nextImageUrl = bgImages[currentBgIndex];

    // Preload the next image slightly before starting the transition
    const img = new Image();
    img.src = nextImageUrl;

    img.onload = () => {
        // Use CSS transitions for smooth fading
        backgroundElement.style.opacity = '0'; // Fade out current

        setTimeout(() => {
            backgroundElement.style.backgroundImage = `url(${nextImageUrl})`;
            backgroundElement.style.opacity = 'var(--bg-image-opacity)'; // Fade in new (use CSS variable)
        }, 1000); // Wait for fade-out to complete (matches CSS transition duration)
    };
    img.onerror = () => {
        console.error("Failed to load background image:", nextImageUrl);
        // Optionally skip to the next image or stop the slideshow
    };
}


/**
 * Creates floating particle elements and adds them to the DOM.
 */
function createParticles() {
    const particlesContainer = document.querySelector('.particles') || document.createElement('div');
    if (!document.querySelector('.particles')) {
        particlesContainer.className = 'particles';
        document.body.appendChild(particlesContainer);
    } else {
        particlesContainer.innerHTML = ''; // Clear existing if any
    }

    const numParticles = 50;

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        const size = Math.random() * 5 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.bottom = `${Math.random() * -20 - 10}%`;
        particle.style.animationDuration = `${Math.random() * 10 + 15}s`;
        particle.style.animationDelay = `${Math.random() * 10}s`;
        particle.style.setProperty('--drift', `${(Math.random() - 0.5) * 100}px`);

        const randomType = Math.random();
        if (randomType > 0.85) { // Reduced chance for special shapes
             particle.style.background = 'var(--particle-color-2)'; // Pink from CSS var
             particle.style.borderRadius = '30% 70% 70% 30% / 30% 30% 70% 70%';
             particle.classList.add('type-2'); // Add class for potential theme override
         } else if (randomType > 0.7) { // Slightly higher chance for blue
              particle.style.background = 'var(--particle-color-3)'; // Blue from CSS var
              particle.classList.add('type-3');
         } else {
             particle.style.background = 'var(--particle-color-1)'; // Default white particle
         }

        particlesContainer.appendChild(particle);
    }
}

/**
 * Applies the selected theme to the body and saves the choice.
 * @param {string} themeName - The name of the theme to apply (e.g., 'pastel', 'dark').
 */
function applyTheme(themeName) {
    const bodyElement = document.body;
    const themeButtons = document.querySelectorAll('.theme-button'); // Get buttons inside function

    // Remove existing theme classes
    bodyElement.classList.remove('theme-pastel', 'theme-dark'); // Add others if needed

    // Add the new theme class
    bodyElement.classList.add(`theme-${themeName}`);

    // Update active state on buttons
    themeButtons.forEach(button => {
        button.classList.toggle('active', button.dataset.theme === themeName);
    });

    // Save theme to localStorage
    localStorage.setItem('blogTheme', themeName);
    console.log(`Theme applied: ${themeName}`);
}

// --- DOMContentLoaded Event Listener ---
document.addEventListener('DOMContentLoaded', function () {

    // --- Initial Sidebar State & Toggle Button ---
    const toggleBtn = document.getElementById('toggle-btn');
    const sidebar = document.getElementById('sidebar');
    const isMobile = window.innerWidth <= 800;

    if (toggleBtn && sidebar) {
        if (isMobile) {
            if (!sidebar.classList.contains('collapsed')) {
                sidebar.classList.add('collapsed');
            }
            toggleBtn.classList.remove('toggle-btn-shifted');
            toggleBtn.textContent = '☰';
            toggleBtn.style.transform = 'rotate(0deg)';
        } else {
            toggleBtn.classList.remove('toggle-btn-shifted');
            toggleBtn.textContent = sidebar.classList.contains('collapsed') ? '☰' : '✕';
            toggleBtn.style.transform = 'rotate(0deg)';
        }
        toggleBtn.addEventListener('click', toggleSidebar);
    }

    // --- Theme Initialization & Listeners ---
    const themeButtons = document.querySelectorAll('.theme-button');
    const savedTheme = localStorage.getItem('blogTheme');

    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('pastel'); // Apply default theme if nothing is saved
    }

    themeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const themeName = button.dataset.theme;
            applyTheme(themeName);
        });
    });

    // --- Background Image Setup ---
    const backgroundElement = document.querySelector('.background'); // Get element reference
    const max_pixel_bg = 1024 * 1024;
    const w_bg = 16, h_bg = 9;
    const width_bg = Math.round(Math.sqrt(max_pixel_bg * w_bg / h_bg) / 8) * 8;
    const height_bg = Math.round(Math.sqrt(max_pixel_bg * h_bg / w_bg) / 8) * 8;
    bgImages = [
        `https://image.pollinations.ai/prompt/anime%20scenery,%20dreamy%20pastel%20sky,%20floating%20islands,%20cherry%20blossoms%20falling,%20highly%20detailed%20illustration,%20cinematic%20lighting?width=${width_bg}&height=${height_bg}&seed=${Math.random() * 1000000}&model=flux&nologo=true`,
        `https://image.pollinations.ai/prompt/anime%20style,%20magical%20forest%20at%20night,%20glowing%20mushrooms,%20fireflies,%20mystical%20atmosphere,%20vibrant%20colors,%20fantasy%20art?width=${width_bg}&height=${height_bg}&seed=${Math.random() * 1000000}&model=flux&nologo=true`,
        `https://image.pollinations.ai/prompt/anime%20cityscape%20at%20sunset,%20vaporwave%20aesthetic,%20neon%20lights,%20reflective%20streets,%20beautiful%20detailed%20sky,%208k?width=${width_bg}&height=${height_bg}&seed=${Math.random() * 1000000}&model=flux&nologo=true`,
        `https://image.pollinations.ai/prompt/anime%20girl%20standing%20on%20a%20cliff,%20overlooking%20a%20vast%20ocean,%20windy%20day,%20dynamic%20clouds,%20emotional%20scene,%20studio%20ghibli%20style?width=${width_bg}&height=${height_bg}&seed=${Math.random() * 1000000}&model=flux&nologo=true`
    ];
    if (backgroundElement && bgImages.length > 0) {
        backgroundElement.style.backgroundImage = `url(${bgImages[0]})`;
        // Opacity is set by CSS variable now
        // backgroundElement.style.opacity = 'var(--bg-image-opacity)';
        setInterval(changeBackground, 7000);
    }

    // --- Other Initializations ---
    updatePagination(); // Initialize pagination on blog list pages
    createParticles(); // Create background particles

    // Search input listener
    const searchInput = document.getElementById('search');
    if (searchInput) {
        searchInput.addEventListener('input', searchPosts);
    }

    // Code copy button listener (event delegation)
    const contentArea = document.querySelector('.content');
    if (contentArea) {
        contentArea.addEventListener('click', function(event) {
            if (event.target.classList.contains('copy-button')) {
                copyCode(event);
            }
        });
    }

    // Highlight.js initialization
    if (typeof hljs !== 'undefined') {
        try {
            hljs.highlightAll();
        } catch (e) { console.error("Highlight.js error during highlightAll:", e); }
    } else {
        // Fallback if hljs is loaded async or fails
        document.querySelectorAll('pre code').forEach((block) => {
             if (typeof hljs !== 'undefined') {
                 try { hljs.highlightElement(block); } catch (e) { console.error("Highlight.js error during highlightElement:", e); }
            }
        });
    }

}); // End of DOMContentLoaded