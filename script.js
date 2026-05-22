// Writing preview on homepage + archive toggle

const PREVIEW_COUNT = 2;

document.addEventListener('DOMContentLoaded', () => {
    loadWriting();
});

async function loadWriting() {
    const previewEl = document.getElementById('writing-preview');
    const archiveEl = document.getElementById('writing-archive');
    const toggleBtn = document.getElementById('writing-toggle');

    if (!previewEl) return;

    try {
        const response = await fetch('data/blogs.json');
        if (!response.ok) throw new Error('Failed to load blogs');
        const blogs = await response.json();

        const preview = blogs.slice(0, PREVIEW_COUNT);
        const rest = blogs.slice(PREVIEW_COUNT);

        preview.forEach((blog) => {
            previewEl.appendChild(createWritingItem(blog));
        });

        if (rest.length > 0 && archiveEl && toggleBtn) {
            rest.forEach((blog) => {
                archiveEl.appendChild(createWritingItem(blog));
            });
            toggleBtn.hidden = false;
            toggleBtn.addEventListener('click', () => {
                const open = !archiveEl.hidden;
                archiveEl.hidden = open;
                toggleBtn.textContent = open ? 'Show earlier writing' : 'Hide earlier writing';
            });
        }
    } catch (error) {
        console.error('Error loading blogs:', error);
        previewEl.innerHTML =
            '<p class="writing-item"><span class="excerpt">Writing archive loads shortly.</span></p>';
    }
}

function createWritingItem(blog) {
    const article = document.createElement('article');
    article.className = 'writing-item';

    const tagsHTML = blog.tags
        ? blog.tags.map((t) => `<span class="writing-tag">${escapeHtml(t)}</span>`).join('')
        : '';

    article.innerHTML = `
        <time datetime="${escapeHtml(blog.date)}">${escapeHtml(blog.date)}</time>
        <h3>${escapeHtml(blog.title)}</h3>
        <div class="writing-body">${blog.content}</div>
        ${tagsHTML ? `<div class="writing-tags">${tagsHTML}</div>` : ''}
    `;

    return article;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
