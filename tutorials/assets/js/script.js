// ============================================
// Bakery ERP System - Tutorials Dashboard JS
// Interactive Features & Search Functionality
// ============================================

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
  initSearch();
  initSidebar();
  initScrollspy();
  initTableOfContents();
});

/**
 * Initialize Search Functionality
 * Filters tutorial cards based on search input
 */
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.tutorial-card');

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        card.style.display = '';
        card.classList.add('fade-in');
      } else {
        card.style.display = 'none';
      }
    });

    // Show "no results" message if needed
    const visibleCards = document.querySelectorAll('.tutorial-card[style=""]');
    const noResults = document.getElementById('noResults');
    if (noResults) {
      noResults.style.display = visibleCards.length === 0 ? 'block' : 'none';
    }
  });
}

/**
 * Initialize Sidebar Navigation
 * Sets active links and smooth scrolling
 */
function initSidebar() {
  const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
  
  sidebarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      // Remove active class from all links
      sidebarLinks.forEach(l => l.classList.remove('active'));
      // Add active class to clicked link
      this.classList.add('active');
    });
  });

  // Set initial active link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  sidebarLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/**
 * Initialize Scrollspy for Table of Contents
 * Updates active items as user scrolls
 */
function initScrollspy() {
  const sections = document.querySelectorAll('section[id]');
  if (sections.length === 0) return;

  window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      
      if (scrollY >= sectionTop - 200) {
        current = section.getAttribute('id');
      }
    });

    // Update TOC active item
    const tocLinks = document.querySelectorAll('.toc-link');
    tocLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/**
 * Initialize Table of Contents
 * Smooth scrolling for TOC links
 */
function initTableOfContents() {
  const tocLinks = document.querySelectorAll('a.toc-link, .toc a');
  
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const target = this.getAttribute('href');
      if (target.startsWith('#')) {
        e.preventDefault();
        const element = document.querySelector(target);
        
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Add highlight effect
          element.classList.add('highlight');
          setTimeout(() => {
            element.classList.remove('highlight');
          }, 2000);
        }
      }
    });
  });
}

/**
 * Copy code to clipboard
 * Adds copy functionality to code blocks
 */
function initCodeCopy() {
  const codeBlocks = document.querySelectorAll('pre code');
  
  codeBlocks.forEach(block => {
    const button = document.createElement('button');
    button.className = 'btn btn-sm btn-outline-primary';
    button.innerHTML = '<i class="bi bi-clipboard"></i> Copy';
    button.style.position = 'absolute';
    button.style.top = '0.5rem';
    button.style.right = '0.5rem';
    
    const pre = block.parentElement;
    pre.style.position = 'relative';
    pre.appendChild(button);
    
    button.addEventListener('click', function() {
      const text = block.innerText;
      navigator.clipboard.writeText(text).then(() => {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="bi bi-check"></i> Copied!';
        setTimeout(() => {
          button.innerHTML = originalText;
        }, 2000);
      });
    });
  });
}

/**
 * Initialize Expand/Collapse functionality
 * For collapsible sections
 */
function initCollapsibles() {
  const collapseButtons = document.querySelectorAll('[data-toggle="collapse"]');
  
  collapseButtons.forEach(button => {
    button.addEventListener('click', function() {
      const target = document.querySelector(this.getAttribute('data-target'));
      if (target) {
        target.classList.toggle('show');
        this.classList.toggle('collapsed');
      }
    });
  });
}

/**
 * Initialize Tooltips (if needed)
 * Bootstrap tooltip initialization
 */
function initTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

/**
 * Print Tutorial Guide
 */
function printGuide() {
  window.print();
}

/**
 * Download Guide as PDF (requires additional library)
 */
function downloadPDF() {
  const element = document.body;
  const opt = {
    margin: 10,
    filename: 'bakery-erp-tutorial.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
  };
  
  // Note: Requires html2pdf library
  if (typeof html2pdf !== 'undefined') {
    html2pdf().set(opt).from(element).save();
  } else {
    alert('PDF download requires html2pdf library. Please install it first.');
  }
}

/**
 * Share Tutorial
 */
function shareTutorial(platform) {
  const url = window.location.href;
  const title = document.title;
  let shareUrl = '';

  switch(platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
      break;
    case 'email':
      shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
      break;
  }

  if (shareUrl) {
    window.open(shareUrl, '_blank');
  }
}

/**
 * Highlight Search Terms
 * Highlights search results in text
 */
function highlightSearchTerms(text, searchTerm) {
  if (!searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Rating System
 * Allows users to rate tutorials
 */
function rateTutorial(rating) {
  const stars = document.querySelectorAll('.star-rating i');
  stars.forEach((star, index) => {
    if (index < rating) {
      star.classList.add('active');
    } else {
      star.classList.remove('active');
    }
  });
  
  // Send rating to server (implement as needed)
  console.log('Tutorial rated:', rating, 'stars');
}

/**
 * Initialize Step Navigation
 * Navigate between tutorial steps
 */
function initStepNavigation() {
  const nextButtons = document.querySelectorAll('[data-step="next"]');
  const prevButtons = document.querySelectorAll('[data-step="prev"]');
  
  nextButtons.forEach(button => {
    button.addEventListener('click', function() {
      const currentStep = this.closest('[data-step-content]');
      const nextStep = currentStep?.nextElementSibling;
      
      if (nextStep) {
        currentStep.style.display = 'none';
        nextStep.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
  
  prevButtons.forEach(button => {
    button.addEventListener('click', function() {
      const currentStep = this.closest('[data-step-content]');
      const prevStep = currentStep?.previousElementSibling;
      
      if (prevStep) {
        currentStep.style.display = 'none';
        prevStep.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

/**
 * Bookmark Tutorial
 */
function bookmarkTutorial() {
  const bookmarkBtn = event.target.closest('.btn-bookmark');
  if (bookmarkBtn) {
    bookmarkBtn.classList.toggle('bookmarked');
    const isBookmarked = bookmarkBtn.classList.contains('bookmarked');
    bookmarkBtn.innerHTML = isBookmarked 
      ? '<i class="bi bi-bookmark-fill"></i> Bookmarked' 
      : '<i class="bi bi-bookmark"></i> Bookmark';
  }
}

/**
 * Scroll Progress Indicator
 */
function initScrollProgress() {
  const progressBar = document.querySelector('.scroll-progress-bar');
  if (!progressBar) return;

  window.addEventListener('scroll', function() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = (window.scrollY / docHeight) * 100;
    progressBar.style.width = scrolled + '%';
  });
}

/**
 * Back to Top Button
 */
function initBackToTop() {
  const backToTopBtn = document.querySelector('.back-to-top');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      backToTopBtn.style.display = 'block';
    } else {
      backToTopBtn.style.display = 'none';
    }
  });

  backToTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// Export functions for global use
window.rateTutorial = rateTutorial;
window.shareTutorial = shareTutorial;
window.printGuide = printGuide;
window.downloadPDF = downloadPDF;
window.bookmarkTutorial = bookmarkTutorial;
