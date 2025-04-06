// Global variables
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
let devices = [];
let charityTotal = 0;

// DOM Elements
const elements = {
  deviceList: document.getElementById('device-list'),
  cartItems: document.getElementById('cart-items'),
  emptyCartMsg: document.getElementById('empty-cart-message'),
  cartSummary: document.getElementById('cart-summary'),
  subtotal: document.getElementById('subtotal'),
  tax: document.getElementById('tax'),
  total: document.getElementById('total'),
  checkoutBtn: document.getElementById('checkout-btn'),
  sellForm: document.getElementById('sell-form'),
  repairForm: document.getElementById('repair-form'),
  donationForm: document.getElementById('donation-form')
};

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  // Load devices data
  fetch('./devices.json')
    .then(response => response.json())
    .then(data => {
      devices = data;
      if (elements.deviceList) renderDevices(devices);
    });

  // Initialize cart
  if (elements.cartItems) renderCart();

  // Form event listeners
  if (elements.sellForm) {
    elements.sellForm.addEventListener('submit', handleSellForm);
  }

  if (elements.repairForm) {
    elements.repairForm.addEventListener('submit', handleRepairForm);
  }

  if (elements.donationForm) {
    elements.donationForm.addEventListener('submit', handleDonation);
    document.querySelectorAll('.donation-option').forEach(btn => {
      btn.addEventListener('click', function() {
        document.getElementById('custom-amount').value = '';
        document.getElementById('custom-amount').value = this.dataset.amount;
      });
    });
  }
});

// Render device cards
function renderDevices(devicesToRender) {
  elements.deviceList.innerHTML = '';
  
  devicesToRender.forEach(device => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden';
    card.innerHTML = `
      <img src="${device.image}" alt="${device.name}" class="w-full h-48 object-cover">
      <div class="p-4">
        <h3 class="text-lg font-bold">${device.name}</h3>
        <p class="text-gray-600 mb-2">$${device.price.toFixed(2)}</p>
        <button class="add-to-cart bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" 
                data-id="${device.id}">
          Add to Cart
        </button>
      </div>
    `;
    elements.deviceList.appendChild(card);
  });

  // Add event listeners to cart buttons
  document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
      const deviceId = parseInt(this.dataset.id);
      addToCart(deviceId);
    });
  });
}

// Cart functions
function addToCart(deviceId) {
  const device = devices.find(d => d.id === deviceId);
  if (!device) return;

  const existingItem = cartItems.find(item => item.id === deviceId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({
      ...device,
      quantity: 1
    });
  }

  updateCart();
  showToast(`${device.name} added to cart`);
}

function updateCart() {
  localStorage.setItem('cartItems', JSON.stringify(cartItems));
  renderCart();
}

function renderCart() {
  elements.cartItems.innerHTML = '';
  
  if (cartItems.length === 0) {
    elements.emptyCartMsg.classList.remove('hidden');
    elements.cartSummary.classList.add('hidden');
    return;
  }

  elements.emptyCartMsg.classList.add('hidden');
  elements.cartSummary.classList.remove('hidden');

  cartItems.forEach(item => {
    const cartItem = document.createElement('div');
    cartItem.className = 'flex items-center border-b py-4';
    cartItem.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
      <div class="ml-4 flex-1">
        <h3 class="font-medium">${item.name}</h3>
        <p class="text-gray-600">$${item.price.toFixed(2)}</p>
      </div>
      <div class="flex items-center">
        <button class="decrease-quantity px-2 py-1 border rounded" data-id="${item.id}">-</button>
        <span class="mx-2">${item.quantity}</span>
        <button class="increase-quantity px-2 py-1 border rounded" data-id="${item.id}">+</button>
        <button class="remove-item ml-4 text-red-500" data-id="${item.id}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    elements.cartItems.appendChild(cartItem);
  });

  // Add event listeners to quantity buttons
  document.querySelectorAll('.increase-quantity').forEach(btn => {
    btn.addEventListener('click', function() {
      const item = cartItems.find(i => i.id === parseInt(this.dataset.id));
      if (item) item.quantity += 1;
      updateCart();
    });
  });

  document.querySelectorAll('.decrease-quantity').forEach(btn => {
    btn.addEventListener('click', function() {
      const item = cartItems.find(i => i.id === parseInt(this.dataset.id));
      if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
          cartItems = cartItems.filter(i => i.id !== item.id);
        }
      }
      updateCart();
    });
  });

  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', function() {
      cartItems = cartItems.filter(i => i.id !== parseInt(this.dataset.id));
      updateCart();
    });
  });

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  elements.subtotal.textContent = `$${subtotal.toFixed(2)}`;
  elements.tax.textContent = `$${tax.toFixed(2)}`;
  elements.total.textContent = `$${total.toFixed(2)}`;
}

// Form handlers
function handleSellForm(e) {
  e.preventDefault();
  const formData = {
    name: document.getElementById('device-name').value,
    price: parseFloat(document.getElementById('device-price').value),
    condition: document.getElementById('device-condition').value,
    description: document.getElementById('device-description').value
  };

  // In a real app, you would send this to your backend
  console.log('Sell form submitted:', formData);
  showToast('Your device has been listed for sale!');
  e.target.reset();
}

function handleRepairForm(e) {
  e.preventDefault();
  const formData = {
    deviceType: document.getElementById('device-type').value,
    issueDescription: document.getElementById('issue-description').value,
    contactInfo: document.getElementById('contact-info').value
  };

  // In a real app, you would send this to your backend
  console.log('Repair form submitted:', formData);
  showToast('Your repair request has been submitted!');
  e.target.reset();
}

function handleDonation(e) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('custom-amount').value) || 0;
  const roundUp = document.getElementById('round-up').checked;
  
  if (amount <= 0 && !roundUp) {
    showToast('Please enter a valid donation amount', 'error');
    return;
  }

  charityTotal += amount;
  showToast(`Thank you for your $${amount.toFixed(2)} donation!`);
  updateProgressBar();
  e.target.reset();
}

// Helper functions
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg ${
    type === 'success' ? 'bg-green-500' : 'bg-red-500'
  } text-white`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function updateProgressBar() {
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    const newWidth = Math.min(100, (charityTotal / 10000) * 100);
    progressBar.style.width = `${newWidth}%`;
  }
}