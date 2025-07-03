document.addEventListener('DOMContentLoaded', function() {
    // Update cart count on all pages
    updateCartCount();
    
    // Load appropriate content based on page
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index.html') {
        loadFeaturedBooks();
    } else if (path === '/books' || path === '/books.html') {
        loadAllBooks();
        setupSearch();
    } else if (path === '/cart' || path === '/cart.html') {
        loadCartItems();
        setupCartEvents();
    }
});

// Book data would normally come from the backend API
async function fetchBooks() {
    try {
        const response = await fetch('/api/books');
        const books = await response.json();
        return books;
    } catch (error) {
        console.error('Error fetching books:', error);
        return [];
    }
}

async function loadFeaturedBooks() {
    const books = await fetchBooks();
    const featuredBooksContainer = document.getElementById('featured-books');
    
    // Get 4 random featured books
    const featuredBooks = books.sort(() => 0.5 - Math.random()).slice(0, 4);
    
    featuredBooksContainer.innerHTML = featuredBooks.map(book => createBookCard(book)).join('');
    
    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

async function loadAllBooks() {
    const books = await fetchBooks();
    const allBooksContainer = document.getElementById('all-books');
    
    allBooksContainer.innerHTML = books.map(book => createBookCard(book)).join('');
    
    // Add event listeners to "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

function createBookCard(book) {
    return `
        <div class="book-card" data-id="${book.id}">
            <div class="book-image">${book.title.charAt(0)}</div>
            <div class="book-details">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">${book.author}</p>
                <span class="book-price">$${book.price.toFixed(2)}</span>
                <button class="add-to-cart" data-id="${book.id}">Add to Cart</button>
            </div>
        </div>
    `;
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    searchBtn.addEventListener('click', async () => {
        const searchTerm = searchInput.value.toLowerCase();
        const books = await fetchBooks();
        const filteredBooks = books.filter(book => 
            book.title.toLowerCase().includes(searchTerm) || 
            book.author.toLowerCase().includes(searchTerm)
        );
        
        const allBooksContainer = document.getElementById('all-books');
        allBooksContainer.innerHTML = filteredBooks.map(book => createBookCard(book)).join('');
        
        // Add event listeners to "Add to Cart" buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', addToCart);
        });
    });
    
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            searchBtn.click();
        }
    });
}

// Cart functionality
function getCart() {
    const cart = localStorage.getItem('bookstore-cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('bookstore-cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('#cart-count').forEach(element => {
        element.textContent = totalItems;
    });
}

async function addToCart(e) {
    const bookId = e.target.getAttribute('data-id');
    const books = await fetchBooks();
    const book = books.find(b => b.id == bookId);
    
    if (!book) return;
    
    const cart = getCart();
    const existingItem = cart.find(item => item.id == bookId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: book.id,
            title: book.title,
            price: book.price,
            quantity: 1
        });
    }
    
    saveCart(cart);
    alert(`${book.title} added to cart!`);
}

function loadCartItems() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        document.getElementById('cart-total').textContent = '0.00';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => createCartItem(item)).join('');
    updateCartTotal();
}

function createCartItem(item) {
    return `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item-info">
                <div class="cart-item-image">${item.title.charAt(0)}</div>
                <div>
                    <div class="cart-item-title">${item.title}</div>
                    <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            </div>
            <div class="cart-item-quantity">
                <button class="decrease-quantity">-</button>
                <span>${item.quantity}</span>
                <button class="increase-quantity">+</button>
                <button class="remove-item">Remove</button>
            </div>
        </div>
    `;
}

function updateCartTotal() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cart-total').textContent = total.toFixed(2);
}

function setupCartEvents() {
    document.getElementById('cart-items').addEventListener('click', function(e) {
        const cartItem = e.target.closest('.cart-item');
        if (!cartItem) return;
        
        const bookId = cartItem.getAttribute('data-id');
        const cart = getCart();
        const itemIndex = cart.findIndex(item => item.id == bookId);
        
        if (e.target.classList.contains('increase-quantity')) {
            cart[itemIndex].quantity += 1;
        } else if (e.target.classList.contains('decrease-quantity')) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1;
            } else {
                cart.splice(itemIndex, 1);
            }
        } else if (e.target.classList.contains('remove-item')) {
            cart.splice(itemIndex, 1);
        }
        
        saveCart(cart);
        loadCartItems();
    });
    
    document.getElementById('checkout-btn').addEventListener('click', function() {
        const cart = getCart();
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }
        
        // In a real app, this would redirect to a checkout page or process payment
        alert('Proceeding to checkout! This would connect to a payment processor in a real app.');
        
        // Clear cart after checkout
        saveCart([]);
        loadCartItems();
    });
}