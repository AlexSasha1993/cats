// Инициализация массива избранных котиков из localStorage или пустого массива, если данных нет
let favoriteCats = JSON.parse(localStorage.getItem('favoriteCats')) || [];
// Массив для всех загруженных котиков
let allCats = [];
// Текущая страница загрузки
let currentPage = 0;
// Количество котиков на одной странице
const catsPerPage = 100;
// Флаг для предотвращения дублирующих запросов при загрузке
let loading = false;
// Флаг, указывающий, что все котики загружены
let allCatsLoaded = false;
// Текущая вкладка (все котики или избранные)
let currentTab = 'all';
// Функция для загрузки всех котиков
function loadAllCats() {
  currentTab = 'all';
  fetchCats();
}
// Функция для загрузки избранных котиков
function loadFavoriteCats() {
  currentTab = 'favorites';
  displayCats(favoriteCats, 'favorites');
}
// Функция для отправки запроса на загрузку котиков
function fetchCats() {
  // Если уже идет загрузка или все котики загружены, прерываем выполнение
  if (loading || allCatsLoaded) {
    return;
  }
  // Устанавливаем флаг загрузки в true
  loading = true;
  // Увеличиваем номер страницы
  currentPage++;
  // Отправляем запрос на API для получения котиков
  fetch(
    `https://api.thecatapi.com/v1/images/search?limit=${catsPerPage}&page=${currentPage}`
  )
    .then((response) => {
      // Если котики не получены, выводим сообщение и устанавливаем флаг, что все котики загружены
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((cats) => {
      if (cats.length === 0) {
        console.log('No more cats to load');
        allCatsLoaded = true;
        return;
      }
      // Добавляем загруженных котиков в массив всех котиков
      allCats = allCats.concat(cats);
      // Отображаем котиков на странице
      displayCats(allCats, 'all');
    })
    // Выводим ошибку в консоль, если что-то пошло не так при загрузке
    .catch((error) => {
      console.error('Error fetching cats:', error);
    })
    .finally(() => {
      // Снимаем флаг загрузки после завершения запроса
      loading = false;
      // Проверяем, нужно ли загружать еще котиков (если достигнут конец страницы)
      checkIfEndReached();
    });
}
// Функция для отображения котиков на странице
function displayCats(cats, tab) {
  // Получаем контейнер для котиков из DOM
  const catContainer = document.getElementById('catContainer');
  // Очищаем контейнер перед добавлением новых котиков
  catContainer.innerHTML = '';
  // Проходим по каждому котику в массиве и добавляем его на страницу
  cats.forEach((cat) => {
    if (!cat || !cat.url) {
      return;
    }
    // Создаем элемент div для котика
    const catCard = document.createElement('div');
    catCard.classList.add('cat-card');
    // Создаем элемент img для изображения котика
    const img = document.createElement('img');
    img.src = cat.url;
    img.alt = 'Cute Cat';
    // Создаем кнопку для добавления/удаления избранного
    const favoriteButton = document.createElement('button');
    const isFav = isFavorite(cat);
    favoriteButton.innerHTML = isFav ? '❤️' : '🤍';
    favoriteButton.classList.add('favorite');
    favoriteButton.id = `favoriteButton_${cat.url}`;
    favoriteButton.addEventListener('click', () => toggleFavorite(cat, tab));
    // Если котик избранный, устанавливаем красный цвет
    if (isFav) {
      favoriteButton.style.color = 'red';
    }
    // Добавляем элементы на страницу
    catCard.appendChild(img);
    catCard.appendChild(favoriteButton);
    catContainer.appendChild(catCard);
  });

  // Вызываем функцию обновления вкладок после отображения котиков
  updateTabs();
}
// Функция для добавления/удаления избранного
function toggleFavorite(cat, tab) {
  // Ищем индекс котика в массиве избранных
  const index = favoriteCats.findIndex(
    (favCat) => favCat && favCat.url === cat.url
  );
  // Если котика нет в избранных, добавляем его
  if (index === -1) {
    favoriteCats.push({ url: cat.url });
  } else {
    // Если котик уже в избранных, удаляем его
    favoriteCats.splice(index, 1);
  }
  // Сохраняем массив избранных в localStorage
  localStorage.setItem('favoriteCats', JSON.stringify(favoriteCats));
  // Получаем кнопку из DOM по уникальному идентификатору
  const favoriteButton = document.getElementById(`favoriteButton_${cat.url}`);
  // Обновляем внешний вид кнопки в зависимости от того, избранный ли котик
  if (isFavorite(cat)) {
    favoriteButton.innerHTML = '❤️';
    favoriteButton.style.color = 'red';
  } else {
    favoriteButton.innerHTML = '🤍';
    favoriteButton.style.color = '';
  }
// Если находимся на вкладке избранных, обновляем ее содержимое после изменения избранного
  if (tab === 'favorites') {
    loadFavoriteCats();
  }
}
// Функция isFavorite проверяет, является ли указанный котик (cat) избранным. В контексте приложения с котиками, это означает, добавлен ли котик в список избранных.
function isFavorite(cat) {
  return (
    cat &&
    cat.url &&
    favoriteCats.some((favCat) => favCat && favCat.url === cat.url)
  );
}
// Функция для проверки, достигнут ли конец страницы
function checkIfEndReached() {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
// Если достигнут конец страницы, загружаем еще котиков
  if (scrollTop + clientHeight >= scrollHeight - 300) {
    console.log('Fetching more cats...');
    fetchCats();
  }
}
// Функция для обновления визуального состояния вкладок
function updateTabs() {
  const allCatsTab = document.getElementById('allCatsTab');
  const favoriteCatsTab = document.getElementById('favoriteCatsTab');
// Устанавливаем класс 'active' для активной вкладки и убираем его с остальных
  if (currentTab === 'all') {
    allCatsTab.classList.add('active');
    favoriteCatsTab.classList.remove('active');
  } else if (currentTab === 'favorites') {
    favoriteCatsTab.classList.add('active');
    allCatsTab.classList.remove('active');
  }
}
// Начальная загрузка всех котиков при открытии страницы
loadAllCats();
checkIfEndReached(); // Вызываем функцию checkIfEndReached после загрузки начальных котиков

//function checkIfEndReached() {
// const catContainer = document.getElementById('catContainer');
// const { scrollTop, offsetHeight, scrollHeight } = document.documentElement;

// Проверяем, доскроллил ли пользователь до нижней части контейнера с котиками
// if (scrollTop + offsetHeight >= catContainer.scrollHeight - 300) {
//  console.log('Fetching more cats...');
//  fetchCats();
// }
//}
// Данный способ начинает грузить бесконечно много котиков. Вылетают ошибки что сервис ругается на такое колличество запросов
