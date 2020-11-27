// DOM elements
const $toggleTheme = document.getElementById('toggle-theme'),
	$mainApp = document.getElementById('main-app');

let $select,
	$selectHeader,
	$selectList,
	$countryList,
	$searchForm,
	$searchInput;

// State variables
let countries = null;
let mainAppTemplate = '';

const getMainScreenElements = () => {
	$select = document.getElementById('select');
	$selectHeader = document.getElementById('select-header');
	$selectList = document.getElementById('select-list');
	$countryList = document.getElementById('country-list');
	$searchForm = document.getElementById('search-form');
	$searchInput = document.getElementById('search-input');
};

getMainScreenElements();

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

const filterByCode = (code) => {
	return countries.find(({ alpha3Code }) => alpha3Code === code);
};

const handleError = ({ errorMsg }) => {
	console.log(errorMsg);
	countries = [];
};

const saveToStorage = (data) => {
	localStorage.setItem('countryList', JSON.stringify(data));
};

const renderCountry = ({
	flag,
	name,
	population,
	capital,
	region,
	alpha3Code,
}) => {
	const country = document.createElement('li');
	country.className = 'country__item';
	country.setAttribute('data-code', alpha3Code);
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

const clearContainer = (container) => {
	while (container.lastChild) {
		container.removeChild(container.lastChild);
	}
};

const backScreen = () => {
	const renderMainScreen = ({ animationName }) => {
		if (animationName === 'in') {
			$mainApp.classList.remove(animationName);
			$mainApp.removeEventListener('animationend', renderMainScreen);
			return;
		}
		clearContainer($mainApp);
		$mainApp.classList.remove(animationName);
		console.log(animationName);
		$mainApp.innerHTML = mainAppTemplate;
		$mainApp.classList.add('in');
		getMainScreenElements();
		addEventListeners();
	};
	$mainApp.classList.add('out');
	$mainApp.addEventListener('animationend', renderMainScreen);
};

const renderCountryBorder = (code) => {
	const {
		region,
		name,
		subregion,
		languages,
		currencies,
		borders,
		flag,
		nativeName,
		population,
		capital,
		topLevelDomain,
	} = filterByCode(code);
	let template = `
      <img
        src="${flag}"
        alt="${name}"
        class="country-flag"
      />
      <div class="country-detail__content">
        <h1 class="country-name">${name}</h1>
        <div class="country-meta-grid">
          <p class="country-meta">
            Native Name:
            <span class="country-info">${nativeName}</span>
          </p>
          <p class="country-meta">
            Population:
            <span class="country-info">${population}</span>
          </p>
          <p class="country-meta">
            Region:
            <span class="country-info">${region}</span>
          </p>
          <p class="country-meta">
            Sub Region:
            <span class="country-info">${subregion}</span>
          </p>
          <p class="country-meta">
            Capital:
            <span class="country-info">${capital}</span>
          </p>
          <p class="country-meta">
            Top Level Domain:
            <span class="country-info">${topLevelDomain.join(', ')}</span>
          </p>
          <p class="country-meta">
            Currencies:
            <span class="country-info">${currencies
				.map(({ name }) => name)
				.join(', ')}</span>
          </p>
          <p class="country-meta">
            Languages:
            <span class="country-info">
              ${languages.map(({ name }) => name).join(', ')}
            </span>
          </p>
        </div>
        <div class="borders-container">
          <p class="country-border">Border Countries:</p>
          <div class="country-borders" id="country-borders">
            ${borders
				.map((border) => {
					return `<button class="btn-country">${border}</button>`;
				})
				.join('')}
          </div>
        </div>
      </div>
    `;
	const grid = $mainApp.firstElementChild.lastElementChild;
	clearContainer(grid);
	grid.innerHTML = template;
	// removeMainScreenListeners();
	// document.getElementById('btn-back').addEventListener('click', () => {
	// 	backScreen();
	// });
	document
		.getElementById('country-borders')
		.addEventListener('click', ({ target }) => {
			if (target.classList.contains('btn-country')) {
				renderCountryBorder(target.innerText);
			}
		});
};

const renderCountryDetail = (code) => {
	const renderDetail = ({ animationName }) => {
		if (animationName !== 'out') {
			$mainApp.classList.remove(animationName);
			$mainApp.removeEventListener('animationend', renderDetail);
			return;
		}
		$mainApp.classList.remove('out');
		clearContainer($mainApp);
		let template = `
    <div class="wrapper">
    <button class="btn-back" id="btn-back">
      <i class="fas fa-arrow-left"></i>
      Back
    </button>
    <div class="country-detail__grid">
      <img
        src="${flag}"
        alt="${name}"
        class="country-flag"
      />
      <div class="country-detail__content">
        <h1 class="country-name">${name}</h1>
        <div class="country-meta-grid">
          <p class="country-meta">
            Native Name:
            <span class="country-info">${nativeName}</span>
          </p>
          <p class="country-meta">
            Population:
            <span class="country-info">${population}</span>
          </p>
          <p class="country-meta">
            Region:
            <span class="country-info">${region}</span>
          </p>
          <p class="country-meta">
            Sub Region:
            <span class="country-info">${subregion}</span>
          </p>
          <p class="country-meta">
            Capital:
            <span class="country-info">${capital}</span>
          </p>
          <p class="country-meta">
            Top Level Domain:
            <span class="country-info">${topLevelDomain.join(', ')}</span>
          </p>
          <p class="country-meta">
            Currencies:
            <span class="country-info">${currencies
				.map(({ name }) => name)
				.join(', ')}</span>
          </p>
          <p class="country-meta">
            Languages:
            <span class="country-info">
              ${languages.map(({ name }) => name).join(', ')}
            </span>
          </p>
        </div>
        <div class="borders-container">
          <p class="country-border">Border Countries:</p>
          <div class="country-borders" id="country-borders">
            ${borders
				.map((border) => {
					return `<button class="btn-country">${border}</button>`;
				})
				.join('')}
          </div>
        </div>
      </div>
    </div>
  </div>
    `;
		// Agrega animación de entrada
		$mainApp.classList.add('in');
		$mainApp.innerHTML = template;
		removeMainScreenListeners();
		document.getElementById('btn-back').addEventListener('click', () => {
			backScreen();
		});
		document
			.getElementById('country-borders')
			.addEventListener('click', ({ target }) => {
				if (target.classList.contains('btn-country')) {
					renderCountryBorder(target.innerText);
				}
			});
	};

	const {
		region,
		name,
		subregion,
		languages,
		currencies,
		borders,
		flag,
		nativeName,
		population,
		capital,
		topLevelDomain,
	} = filterByCode(code);
	// Respalda la vista anterior
	mainAppTemplate = $mainApp.innerHTML;
	// Agrega animación de salida
	$mainApp.classList.add('out');
	$mainApp.addEventListener('animationend', renderDetail);
};

const handleKeyDown = (e) => {
	switch (e.code) {
		case 'Escape':
			$select.classList.remove('open');
			break;
	}
};

const handleSelectHeaderClick = () => {
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
};

const handleSelectListClick = ({ target }) => {
	const region = target.innerText;
	if (region === $selectList.innerText) {
		return;
	}
	$select.classList.remove('open');
	document.getElementById('select-overlay').remove();
	filterByRegion(region);
};

const handleSubmit = (e) => {
	e.preventDefault();
	const name = $searchInput.value.trim();
	if (!name) {
		alert('Enter a country name');
		return;
	}
	filterByCountry(name.toUpperCase());
	$searchForm.reset();
};

const handleListClick = ({ target }) => {
	const item = target.closest('.country__item');
	if (item) {
		renderCountryDetail(item.dataset.code);
	}
};

const addEventListeners = () => {
	// Detecta cuando hay que cerrar el select al presionar esc
	document.addEventListener('keydown', handleKeyDown);
	// Abre y cierra el select
	if ($selectHeader) {
		$selectHeader.addEventListener('click', handleSelectHeaderClick);
	}

	// Detecta la región
	if ($selectList) {
		$selectList.addEventListener('click', handleSelectListClick);
	}
	if ($searchForm) {
		$searchForm.addEventListener('submit', handleSubmit);
	}
	if ($countryList) {
		$countryList.addEventListener('click', handleListClick);
	}
};

const removeMainScreenListeners = () => {
	console.log('Eliminando eventos');

	document.removeEventListener('keydown', handleKeyDown);
	$selectHeader.removeEventListener('click', handleSelectHeaderClick);
	$selectList.removeEventListener('click', handleSelectListClick);
	$searchForm.removeEventListener('submit', handleSubmit);
	$countryList.removeEventListener('click', handleListClick);
};

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
		renderCountries({ data: countries });
	}
});

addEventListeners();
