// js/main.js

const CARS_URL = 'data/cars.json';

// Общее -----------------------------------------------------------------

async function loadCars() {
  const resp = await fetch(CARS_URL);
  if (!resp.ok) throw new Error('Не удалось загрузить список авто');
  return resp.json();
}

function formatPrice(num) {
  return '$' + num.toLocaleString('en-US');
}

// Инициализация страниц -------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  if (page === 'catalog') {
    initCatalogPage();
  } else if (page === 'car') {
    initCarPage();
  }
});

// Каталог ---------------------------------------------------------------

async function initCatalogPage() {
  const grid = document.getElementById('cars-grid');
  const brandSelect = document.getElementById('filter-brand');
  const yearSelect = document.getElementById('filter-year');
  const sortSelect = document.getElementById('sort-price');

  let allCars = [];
  let filtered = [];

  try {
    allCars = await loadCars();
    filtered = [...allCars];

    // Заполняем фильтры
    fillBrandFilter(allCars, brandSelect);
    fillYearFilter(allCars, yearSelect);

    renderCars(grid, filtered);
  } catch (e) {
    grid.innerHTML = `<p>Ошибка загрузки каталога. Попробуйте позже.</p>`;
    console.error(e);
    return;
  }

  function applyFilters() {
    const brand = brandSelect.value;
    const year = yearSelect.value;
    const sort = sortSelect.value;

    filtered = allCars.filter(car => {
      let ok = true;
      if (brand && car.brand !== brand) ok = false;
      if (year && String(car.year) !== year) ok = false;
      return ok;
    });

    if (sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    renderCars(grid, filtered);
  }

  brandSelect.addEventListener('change', applyFilters);
  yearSelect.addEventListener('change', applyFilters);
  sortSelect.addEventListener('change', applyFilters);
}

function fillBrandFilter(cars, select) {
  const brands = [...new Set(cars.map(c => c.brand))].sort();
  brands.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b;
    opt.textContent = b;
    select.appendChild(opt);
  });
}

function fillYearFilter(cars, select) {
  const years = [...new Set(cars.map(c => c.year))].sort((a,b) => b - a);
  years.forEach(y => {
    const opt = document.createElement('option');
    opt.value = String(y);
    opt.textContent = String(y);
    select.appendChild(opt);
  });
}

function renderCars(container, cars) {
  if (!cars.length) {
    container.innerHTML = '<p>Нет автомобилей по выбранным параметрам.</p>';
    return;
  }

  container.innerHTML = cars.map(car => `
    <article class="car-card">
      <div class="car-img">
        <div class="car-img-inner" style="background-image:url('${car.image || ''}')"></div>
      </div>
      <div class="car-body">
        <h3 class="car-title">${car.brand} ${car.model}</h3>
        <div class="car-badge">${car.year} • ${car.odometer.toLocaleString('en-US')} mi • ${car.engine}</div>
        <div class="car-specs">${car.location} • ${car.status}</div>
        <div class="car-price-row">
          <div class="car-price">${formatPrice(car.price)}</div>
          <div class="car-location">${car.country || 'Georgia'}</div>
        </div>
      </div>
      <div class="car-footer">
        <a class="btn btn-outline" href="car.html?id=${encodeURIComponent(car.id)}">Подробнее</a>
        <span class="link-small">VIN: ${car.vin}</span>
      </div>
    </article>
  `).join('');
}

// Страница одного авто --------------------------------------------------

async function initCarPage() {
  const container = document.getElementById('car-container');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    container.innerHTML = '<p>Не указан ID автомобиля.</p>';
    return;
  }

  try {
    const cars = await loadCars();
    const car = cars.find(c => String(c.id) === String(id));

    if (!car) {
      container.innerHTML = '<p>Автомобиль не найден.</p>';
      return;
    }

    renderCarPage(container, car);
  } catch (e) {
    container.innerHTML = '<p>Ошибка загрузки данных об автомобиле.</p>';
    console.error(e);
  }
}

function renderCarPage(container, car) {
  container.innerHTML = `
    <div class="car-layout">
      <div>
        <div class="car-hero">
          <div class="car-hero-main" style="background-image:url('${car.image || ''}')"></div>
          <div class="car-hero-meta">
            ${car.year} • ${car.odometer.toLocaleString('en-US')} mi • ${car.engine} • ${car.drive}
          </div>
        </div>
        <div class="car-panel">
          <h2>Описание</h2>
          <p>${car.description || 'Подробное описание будет добавлено позже.'}</p>
        </div>
      </div>
      <aside class="car-panel">
        <h2>${car.brand} ${car.model}</h2>
        <div class="price-big">${formatPrice(car.price)}</div>
        <div class="price-note">Ориентировочная цена продажи, возможен пересчёт с учётом курса и налогов.</div>

        <ul class="list">
          <li><strong>Год:</strong> ${car.year}</li>
          <li><strong>Пробег:</strong> ${car.odometer.toLocaleString('en-US')} mi</li>
          <li><strong>Двигатель:</strong> ${car.engine}</li>
          <li><strong>Привод:</strong> ${car.drive}</li>
          <li><strong>Расположение:</strong> ${car.location}</li>
          <li><strong>Статус:</strong> ${car.status}</li>
          <li><strong>VIN:</strong> ${car.vin}</li>
        </ul>

        <div class="contacts">
          <p><strong>Связаться по этому авто:</strong></p>
          <p>Телефон: <a href="tel:+995000000000">+995 …</a></p>
          <p>WhatsApp / Telegram: <a href="https://t.me/your_telegram" target="_blank">@your_telegram</a></p>
        </div>

        <div style="margin-top:16px;">
          <a class="btn btn-primary" href="cars.html">← Вернуться к каталогу</a>
        </div>
      </aside>
    </div>
  `;
}
