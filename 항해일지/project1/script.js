document.addEventListener('DOMContentLoaded', () => {
    console.log("도토리의 바이브 코딩 대시보드 로드 완료!");
    
    // Smooth scrolling for any internal links (if added in the future)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Add subtle intersection observer animation to video cards
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const videoWrappers = document.querySelectorAll('.video-wrapper');
    videoWrappers.forEach((wrapper, index) => {
        // Initial state
        wrapper.style.opacity = 0;
        wrapper.style.transform = 'translateY(30px)';
        wrapper.style.transition = `opacity 0.6s ease-out ${index * 0.1}s, transform 0.6s ease-out ${index * 0.1}s`;
        
        // Observe
        observer.observe(wrapper);
    });
});