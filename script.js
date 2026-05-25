// Writing: homepage preview (2 posts) + full archive on writing.html

const PREVIEW_COUNT = 1;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('writing-list')) {
        loadWritingArchive();
    } else {
        loadWritingPreview();
    }
});

async function fetchBlogs() {
    const response = await fetch('data/blogs.json');
    if (!response.ok) throw new Error('Failed to load blogs');
    return response.json();
}

async function loadWritingPreview() {
    const previewEl = document.getElementById('writing-preview');
    const allLink = document.getElementById('writing-all-link');

    if (!previewEl) return;

    try {
        const blogs = await fetchBlogs();
        blogs.slice(0, PREVIEW_COUNT).forEach((blog) => {
            previewEl.appendChild(createWritingItem(blog));
        });

        if (allLink && blogs.length > PREVIEW_COUNT) {
            allLink.textContent = `All writing (${blogs.length} posts) →`;
        }
    } catch (error) {
        console.error('Error loading blogs:', error);
        previewEl.innerHTML =
            '<p class="writing-item"><span class="excerpt">Writing archive could not load. Try again shortly.</span></p>';
    }
}

async function loadWritingArchive() {
    const listEl = document.getElementById('writing-list');
    const statusEl = document.getElementById('writing-status');

    if (!listEl) return;

    try {
        const blogs = await fetchBlogs();
        if (blogs.length === 0) {
            listEl.innerHTML =
                '<p class="writing-item">No posts yet. The next musing publishes Sunday.</p>';
            return;
        }

        blogs.forEach((blog) => {
            listEl.appendChild(createWritingItem(blog));
        });

        if (statusEl) {
            statusEl.hidden = false;
            statusEl.textContent = `${blogs.length} post${blogs.length === 1 ? '' : 's'}, updated each Sunday`;
        }
    } catch (error) {
        console.error('Error loading blogs:', error);
        listEl.innerHTML =
            '<p class="writing-item">Could not load posts. Check that data/blogs.json is reachable.</p>';
    }
}

function createWritingItem(blog) {
    const article = document.createElement('article');
    article.className = 'writing-item';

    const tagsHTML = blog.tags
        ? blog.tags.map((t) => `<span class="writing-tag">${escapeHtml(t)}</span>`).join('')
        : '';

    article.innerHTML = `
        <time datetime="${escapeHtml(blog.dateISO || blog.date)}">${escapeHtml(blog.date)}</time>
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
