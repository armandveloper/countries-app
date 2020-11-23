// DOM elements
const $select = document.getElementById('select'),
	$selectHeader = document.getElementById('select-header'),
	$selectList = document.getElementById('select-list'),
	$toggleTheme = document.getElementById('toggle-theme'),
	$countryList = document.getElementById('country-list'),
	$searchForm = document.getElementById('search-form'),
	$searchInput = document.getElementById('search-input');

// State variables
let countries = null;

const getCountries = async () => {
	const url = 'https://restcountries.eu/rest/v2/all';
	const result = { data: null };
	try {
		const response = await fetch(url);
		const data = await response.json();
		result.data = data;
	} catch (err) {
		console.log(err);
		result.error = true;
		result.errorMsg = err;
	}
	return result;
};

const filterByCountry = (country) => {
	let filterList = countries.filter(({ name }) =>
		new RegExp(country).test(name.toUpperCase())
	);
	if (filterList.length === 0) {
		alert('No se hallaron resultados');
		return;
	}
	renderCountries({ data: filterList });
};

const filterByRegion = (region2) => {
	let filterList = countries.filter(({ region }) => region === region2);
	renderCountries({ data: filterList });
};

const handleError = ({ errorMsg }) => {
	console.log(errorMsg);
	countries = [];
};

const saveToStorage = (data) => {
	localStorage.setItem('countryList', JSON.stringify(data));
};

const renderCountry = ({ flag, name, population, capital, region }) => {
	const country = document.createElement('li');
	country.className = 'country__item';
	country.innerHTML = `
  <img class="country__flag" src="${flag}" alt="${name}" />
  <div class="country__body">
    <h2 class="country__name">${name}</h2>
    <p class="country__meta">
      Population:
      <span class="country__info">${population}</span>
    </p>
    <p class="country__meta">
      Region:
      <span class="country__info">${region}</span>
    </p>
    <p class="country__meta">
      Capital:
      <span class="country__info">${capital}</span>
    </p>
  </div>
  `;
	$countryList.appendChild(country);
};

const renderCountries = ({ data }) => {
	clearCountryList();
	data.forEach(renderCountry);
};

const clearCountryList = () => {
	while ($countryList.lastChild) {
		$countryList.removeChild($countryList.lastChild);
	}
};

// Detecta cuando hay que cerrar el select al presionar esc
document.addEventListener('keydown', (e) => {
	switch (e.code) {
		case 'Escape':
			$select.classList.remove('open');
			break;
	}
});
// Abre y cierra el select
$selectHeader.addEventListener('click', ({ target }) => {
	const isOpen = $select.classList.toggle('open');
	if (isOpen) {
		// Crea un overlay invisible que permite detectar un click fuera del select para cerrarlo (similar a un modal)
		const overlay = document.createElement('div');
		overlay.className = 'select__overlay';
		overlay.id = 'select-overlay';
		document.body.appendChild(overlay);
		overlay.addEventListener('click', ({ target }) => {
			if (overlay.classList.contains('select__overlay')) {
				target.remove();
				$select.classList.toggle('open');
			}
		});
	}
});
// Detecta la región
$selectList.addEventListener('click', ({ target }) => {
	const region = target.innerText;
	$select.classList.remove('open');
	document.getElementById('select-overlay').remove();
	filterByRegion(region);
});
// Cambia el tema de la apliación
$toggleTheme.addEventListener('click', () => {
	document.body.classList.toggle('dark');
	$toggleTheme.firstElementChild.classList.toggle('fas');
	$toggleTheme.firstElementChild.classList.toggle('far');
	localStorage.setItem(
		'themeIsDark',
		document.body.classList.contains('dark')
	);
});
$searchForm.addEventListener('submit', (e) => {
	e.preventDefault();
	const name = $searchInput.value.trim();
	if (!name) {
		alert('Enter a country name');
		return;
	}
	filterByCountry(name.toUpperCase());
	$searchForm.reset();
});
document.addEventListener('DOMContentLoaded', () => {
	// Detecta la preferencia de color del sistema y la almacenada en Local Storage
	const theme = window.matchMedia('(prefers-color-scheme: dark)');
	const isDark = JSON.parse(localStorage.getItem('themeIsDark'));
	if (theme.matches && isDark) {
		document.body.classList.add('dark');
		$toggleTheme.firstElementChild.className = 'fas fa-moon';
	}
	// Carga los países
	countries = JSON.parse(localStorage.getItem('countryList')) || null;
	if (!countries) {
		getCountries()
			.then(({ data }) => {
				renderCountries({ data });
				countries = data;
				saveToStorage(data);
			})
			.catch(handleError);
	} else {
		console.log('Está en el strg');
		renderCountries({ data: countries });
	}
});
