document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const postSlug = urlParams.get('slug');

    if (postSlug) {
        window.location.replace(`blog/${encodeURIComponent(postSlug)}/`);
        return;
    }

    window.location.replace('blog/');
});
