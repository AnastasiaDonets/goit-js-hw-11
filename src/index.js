import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '34776135-c2da03be0c2ba8614e7d82d4c';
const BASE_URL = 'https://pixabay.com/api/';

const lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
});

const refs = {
  form: document.querySelector('#search-form'),
  card: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

let searchQuerry = '';
let currentPage = 1;

refs.form.addEventListener('submit', onSearchImg);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

function onSearchImg(e) {
  resetPage();
  e.preventDefault();
  clearBox();
  searchQuerry = e.currentTarget.elements.searchQuery.value.trim();
  const url = `${BASE_URL}?key=${API_KEY}&q=${searchQuerry}&type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${currentPage}`;
  if (searchQuerry === '') {
    refs.loadMoreBtn.classList.add('is-hidden');
    Notiflix.Notify.failure('Enter something.');
  } else {
    fetchImage(url).then(cards => {
      if (cards.total === 0) {
        refs.loadMoreBtn.classList.add('is-hidden');
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        Notiflix.Notify.success(`Hooray! We found ${cards.totalHits} images.`);
      }
    });
  }
}
// Ось це працює, але чим відрізняється від закоментованого нижче?
async function fetchImage(url) {
  try {
    const response = await axios(url);
    const cards = response.data;
    refs.card.insertAdjacentHTML('beforeend', renderImgs(cards));
    currentPage += 1;
    refs.loadMoreBtn.classList.remove('is-hidden');
    lightbox.refresh();
    return cards;
  } catch {
    refs.loadMoreBtn.classList.add('is-hidden');
    Notiflix.Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

function onLoadMore() {
  const url = `${BASE_URL}?key=${API_KEY}&q=${searchQuerry}&type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${currentPage}`;
  fetchImage(url);
}

function renderImgs(cards) {
  return cards.hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<div class="img-card">
<a class='gallery--link' href='${largeImageURL}'><img class='gallery--image' src="${webformatURL}" alt="${tags}" loading="lazy" width='360' height='260'/></a>
<div class="info">
  <p class="info-item">
    <b>Likes:${likes}</b>
  </p>
  <p class="info-item">
    <b>Views:${views}</b>
  </p>
  <p class="info-item">
    <b>Comments:${comments}</b>
  </p>
  <p class="info-item">
    <b>Downloads:${downloads}</b>
  </p>
</div>
</div>`;
      }
    )
    .join('');
}

function clearBox() {
  refs.card.innerHTML = '';
}

function resetPage() {
  currentPage = 1;
}
