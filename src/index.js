import './sass/main.scss';
import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import imageTemplate from './templates/images.hbs';

const refs = {
  form: document.querySelector('.search-form'),
  buttonLoad: document.querySelector('.load-more'),
  gallery: document.querySelector('.gallery'),
  searchBtn: document.querySelector('.search'),
};

const KEY = '27622136-3e895bd2b32539c57254a4c60';
const URL = 'https://pixabay.com/api/';

let page = 1;
let searchQuevery = '';
let countImages = 0;
const perPage = 40;
const orientation = 'horizontal';
const imageType = 'photo';
const safesearch = 'true';
let lightbox = new SimpleLightbox('.gallery a', { captionsData: 'alt', captionDelay: 250 });
lightbox.on('show.simplelightbox', function () {});

async function fetchApi(searchQuevery, page) {
  try {
    const response = await axios.get(
      `${URL}?key=${KEY}&q=${searchQuevery}&image_type=${imageType}&orientation=${orientation}&safesearch=${safesearch}&page=${page}&per_page=${perPage}`,
    );
    const images = response.data;
    if (images.hits.length === 0) {
      throw new Error();
    }

    return images;
  } catch (error) {
    console.log(error);
  }
}

function resetPage() {
  page = 1;
}

function incrementPage() {
  page += 1;
}

function resetGallery() {
  refs.gallery.innerHTML = '';
}

refs.searchBtn.setAttribute('disabled', '');

refs.form.addEventListener('input', event => {
  event.preventDefault();
  searchQuevery = event.currentTarget.elements.searchQuery.value;
  if (!searchQuevery.length) {
    Notify.warning('Please type something');
  } else {
    refs.searchBtn.removeAttribute('disabled');
  }
});

refs.form.addEventListener('submit', event => {
  event.preventDefault();
  searchQuevery = event.currentTarget.elements.searchQuery.value;

  resetPage();
  resetGallery();
  fetchApi(searchQuevery, page)
    .then(images => {
      Notiflix.Notify.success(`Hooray! We found ${images.totalHits} images.`);
      countImages += images.hits.length;
      gallaryAdd(images.hits);
      lightbox.refresh();
      if (countImages === images.totalHits) {
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
      } else if (images.hits.length < 40) {
        refs.buttonLoad.style.display = 'none';
      } else {
        refs.buttonLoad.style.display = 'block';
        loadScroll();
      }
    })
    .catch(error => {
      refs.buttonLoad.style.display = 'none';
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
      );
    });
});

refs.buttonLoad.addEventListener('click', event => {
  event.preventDefault();
  incrementPage();
  refs.buttonLoad.style.display = 'none';

  fetchApi(searchQuevery, page)
    .then(images => {
      countImages += images.hits.length;
      gallaryAdd(images.hits);
      lightbox.refresh();
      if (countImages === images.totalHits) {
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
      } else if (images.hits.length < 40) {
        refs.buttonLoad.style.display = 'none';
      } else {
        refs.buttonLoad.style.display = 'block';
        loadScroll();
      }
    })
    .catch(error => {
      console.log(error);
    });
});

function gallaryAdd(images) {
  refs.gallery.insertAdjacentHTML('beforeend', imageTemplate(images));
}

function loadScroll() {
  const { height: cardHeight } = refs.gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
