const initialBooks = [
    { id: 1, title: "1984", author: "Джордж Оруэлл", genre: "Фантастика", pages: 328, rating: 5, read: true },
    { id: 2, title: "Мастер и Маргарита", author: "Михаил Булгаков", genre: "Роман", pages: 480, rating: 5, read: true },
    { id: 3, title: "Преступление и наказание", author: "Фёдор Достоевский", genre: "Роман", pages: 671, rating: 4, read: true },
    { id: 4, title: "Гарри Поттер", author: "Дж. К. Роулинг", genre: "Фантастика", pages: 320, rating: 4, read: false },
    { id: 5, title: "Шерлок Холмс", author: "Артур Конан Дойл", genre: "Детектив", pages: 307, rating: 3, read: false }
];

let books = [...initialBooks];
let currentRating = 0;
let isFilterRead = false;
let isHighlighted = false;

document.addEventListener('DOMContentLoaded', () => {
    renderBooks();
    initTable();
    setupEventListeners();
    updateStats();
});

function renderBooks() {
    const container = document.getElementById('booksContainer');
    container.innerHTML = '';
    
    const booksToRender = isFilterRead 
        ? books.filter(book => book.read)
        : books;
    
    booksToRender.forEach(book => {
        const card = document.createElement('div');
        card.className = `book-card ${book.read ? 'read' : ''}`;
        card.dataset.id = book.id;
        card.innerHTML = `
            <h3>${book.title}</h3>
            <p class="author">${book.author}</p>
            <p class="genre">${book.genre} • ${book.pages} стр.</p>
            <div class="rating">${'★'.repeat(book.rating)}${'☆'.repeat(5-book.rating)}</div>
            <div class="actions">
                <button class="btn toggle-read" data-id="${book.id}">
                    ${book.read ? 'Не прочитано' : 'Прочитано'}
                </button>
                <button class="btn delete-book" data-id="${book.id}">🗑️</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function initTable() {
    const tbody = document.querySelector('#readingTable tbody');
    tbody.innerHTML = '';
    
    books.slice(0, 8).forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <a href="#book-${book.id}" class="book-link" data-id="${book.id}">
                    ${book.title}
                </a>
            </td>
            <td>${book.author}</td>
            <td>${book.genre}</td>
            <td>${book.pages}</td>
            <td>${'★'.repeat(book.rating)}</td>
            <td><span class="status ${book.read ? 'read' : 'unread'}">
                ${book.read ? 'Прочитана' : 'Читаю'}
            </span></td>
        `;
        tbody.appendChild(row);
    });
    
    setupBookLinks();
}

function setupEventListeners() {
    //смена темы
    document.getElementById('themeToggle').addEventListener('click', () => {
        document.body.classList.toggle('dark');
    });
    
    //добавление книги
    document.getElementById('submitBook').addEventListener('click', addBook);
    
    //сортировка
    document.getElementById('sortBtn').addEventListener('click', sortBooks);
    
    //управление таблицей
    document.getElementById('highlightBtn').addEventListener('click', highlightTopBooks);
    document.getElementById('filterBtn').addEventListener('click', toggleFilter);
    
    //рейтинг
    document.querySelectorAll('#ratingStars span').forEach(star => {
        star.addEventListener('click', (e) => {
            currentRating = parseInt(e.target.dataset.rating);
            updateStars();
        });
    });
    
    //делегирование для карточек
    document.getElementById('booksContainer').addEventListener('click', (e) => {
        if (e.target.closest('.toggle-read')) {
            const id = parseInt(e.target.closest('.toggle-read').dataset.id);
            toggleReadStatus(id);
        }
        if (e.target.closest('.delete-book')) {
            const id = parseInt(e.target.closest('.delete-book').dataset.id);
            deleteBook(id);
        }
    });
}

function addBook() {
    const title = document.getElementById('bookTitle').value.trim();
    const author = document.getElementById('bookAuthor').value.trim();
    const genre = document.getElementById('bookGenre').value;
    const pages = parseInt(document.getElementById('bookPages').value);
    const errorMsg = document.getElementById('errorMsg');
    
    if (!title || !author || !pages || pages < 1) {
        errorMsg.textContent = 'Заполните все поля корректно';
        return;
    }
    
    if (currentRating === 0) {
        errorMsg.textContent = 'Выберите рейтинг';
        return;
    }
    
    errorMsg.textContent = '';
    
    const newBook = {
        id: Date.now(),
        title,
        author,
        genre,
        pages,
        rating: currentRating,
        read: false
    };
    
    books.push(newBook);
    renderBooks();
	initTable();
    updateStats();
    clearForm();
    
    const card = document.querySelector(`[data-id="${newBook.id}"]`);
}

function toggleReadStatus(id) {
    const book = books.find(b => b.id === id);
    if (book) {
        book.read = !book.read;
        renderBooks();
        updateStats();
        initTable();
    }
}

function deleteBook(id) {
    books = books.filter(book => book.id !== id);
    renderBooks();
    updateStats();
    initTable();
}

function sortBooks() {
    books.sort((a, b) => b.rating - a.rating);
    renderBooks();
}

function highlightTopBooks() {
    const rows = document.querySelectorAll('#readingTable tbody tr');
	if (isHighlighted) {
		rows.forEach(row => {
			const rating = row.cells[4].textContent;
			row.classList.remove('highlighted', rating.includes('★★★★★'));
		});
	}
	else {
		rows.forEach(row => {
			const rating = row.cells[4].textContent;
			row.classList.toggle('highlighted', rating.includes('★★★★★'));
		});
	}
	isHighlighted = !isHighlighted
}

function toggleFilter() {
    isFilterRead = !isFilterRead;
    const btn = document.getElementById('filterBtn');
    btn.textContent = isFilterRead ? 'Показать все' : 'Фильтр: Прочитанные';
    renderBooks();
}

function updateStats() {
    const total = books.length;
    const read = books.filter(b => b.read).length;
    const avgRating = (books.reduce((sum, b) => sum + b.rating, 0) / total).toFixed(1);
    
    document.getElementById('totalBooks').textContent = total;
    document.getElementById('readBooks').textContent = read;
    document.getElementById('avgRating').textContent = avgRating;
    document.getElementById('footerTotal').textContent = total;
    document.getElementById('footerRead').textContent = read;
}

function updateStars() {
    document.querySelectorAll('#ratingStars span').forEach((star, index) => {
        star.classList.toggle('active', index < currentRating);
    });
}

function clearForm() {
    document.getElementById('bookTitle').value = '';
    document.getElementById('bookAuthor').value = '';
    document.getElementById('bookPages').value = '';
    currentRating = 0;
    updateStars();
}

function setupBookLinks() {
    document.querySelectorAll('.book-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const bookId = parseInt(this.dataset.id);
            scrollToBookCard(bookId);
            highlightBookCard(bookId);
        });
    });
}

function scrollToBookCard(bookId) {
    const bookCard = document.querySelector(`.book-card[data-id="${bookId}"]`);
    if (bookCard) {
        bookCard.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
}

function highlightBookCard(bookId) {
    const selectedCard = document.querySelector(`.book-card[data-id="${bookId}"]`);
    if (selectedCard) {
        selectedCard.classList.add('highlighted-card');
        
        setTimeout(() => {
            selectedCard.classList.remove('highlighted-card');
        }, 2000);
    }
}