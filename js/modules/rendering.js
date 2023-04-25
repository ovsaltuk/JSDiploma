import { iconsObj } from "./icons.js";
import { changeClient, deleteClient, addContactIsAvaible } from "./modalWindow.js";
import { getServerList, URL } from "./api.js";
export const tableBody = document.getElementById('tableBody');



export function renderList(arr, container) {
  container.innerHTML = '';
  for (const client of arr) {
    container.append(renderItem(client));
  }
};
export function createDomEl(container = false, tag, content = "", addClass = [], setAttrs = [],) {
  const domEl = document.createElement(tag);
  addAttributes(domEl, setAttrs);
  addClasses(domEl, addClass);
  domEl.textContent = content;
  if (container !== false) {
    container.append(domEl);
  }
  return domEl;
};
export function sortArr(arr, prop, dir = false) {
  if (prop === 'name') {
    return arr.sort((a,b) => {
      if (dir ? `${a.surname} ${a.name} ${a.lastName}`.toLowerCase() < `${b.surname} ${b.name} ${b.lastName}`.toLowerCase() : `${a.surname} ${a.name} ${a.lastName}`.toLowerCase() > `${b.surname} ${b.name} ${b.lastName}`.toLowerCase()) return -1;
    });
  }

  return arr.sort((a, b) => {
    if (dir ? a[prop] > b[prop] : a[prop] < b[prop]) return -1;
  });
};
function renderItem(itemObj) {
  const $item = document.createElement('tr'); 
  $item.setAttribute('id', `${itemObj.id}`);
  createDomEl($item, 'th', `${itemObj.id}`, [], [{name: 'scope', value: 'row'}]);
  createDomEl($item, 'td', `${itemObj.surname} ${itemObj.name} ${itemObj.lastName}`);
  const $dateOfCreate = createDomEl($item, 'td', `${getDateString(itemObj.createdAt).dateStr}`);
  createDomEl($dateOfCreate, 'span', `${getDateString(itemObj.createdAt).timeStr}`);
  const $dateLastChange = createDomEl($item, 'td', `${getDateString(itemObj.updatedAt).dateStr}`);
  createDomEl($dateLastChange, 'span', `${getDateString(itemObj.updatedAt).timeStr}`);
  const $contacts = createDomEl($item, 'td', '', ['contacts']); //ячейка контактов
  const $contactsWrapper = createDomEl($contacts, 'div', '', ['contacts__wrapper']); //ячейка контактов
  const $btnContainer = createDomEl($item, 'td', '', ['button-group']);
  const $btnChange = createDomEl($btnContainer, 'button', 'Изменить', ['reset-btn', 'action-btn']);
  const $btnDelete = createDomEl($btnContainer, 'button', 'Удалить', ['reset-btn', 'action-btn']);
  createDomEl($btnChange, 'img', '',['icon-change'], [{name: 'src', value: './img/change.svg'}]);
  createDomEl($btnDelete, 'img', '',['icon-delete'], [{name: 'src', value: './img/delete.svg'}]);

  //отрисовка контактов 
  let counter = 0;
  const $moreConttactsBtn = createDomEl(false, 'button', '', ['reset-btn', 'more-contacts-btn']);
  for (const contact of itemObj.contacts) {
    if(counter === 4) {
      if(itemObj.contacts.length > 4) {
        $moreConttactsBtn.textContent = `+${itemObj.contacts.length - 4}`;
        $contactsWrapper.append($moreConttactsBtn);
      }
      break;
    }
    $contactsWrapper.append(createContactBtn(contact));
    counter++;
  }
  $moreConttactsBtn.addEventListener('click', ()=> {
    $contactsWrapper.innerHTML = '';
    for (const contact of itemObj.contacts) {
      $contactsWrapper.append(createContactBtn(contact));
    }
  })

  //событие на кнопку изменить
  $btnChange.addEventListener('click', (e) => {
    e.preventDefault();
    changeClient(itemObj);
    addContactIsAvaible();
  })
  //событие на кнопку удалить
  $btnDelete.addEventListener('click', (e) => {
    e.preventDefault();
    deleteClient(itemObj);
  })



  return $item;
};
function addAttributes(el, arrtArr, ){
  for (const artEl of arrtArr) {
    el.setAttribute(artEl.name, artEl.value);
  }
};
function addClasses(el, classArr) {
  for (const className of classArr) {
    el.classList.add(className);
  }
};
function getDateString(date) {
  const inputDate = new Date(date);
  const day = inputDate.getDate() < 10 ? `0${inputDate.getDate()}` : `${inputDate.getDate()}`;
  const month = inputDate.getMonth() + 1 < 10 ? `0${inputDate.getMonth() + 1}` : `${inputDate.getMonth() + 1}`;
  const dateStr = `${day}.${month}.${inputDate.getFullYear()}`
  const hour = inputDate.getHours() < 10 ? `0${inputDate.getHours()}` : `${inputDate.getHours()}`;
  const minute = inputDate.getMinutes() + 1 < 10 ? `0${inputDate.getMinutes() + 1}` : `${inputDate.getMinutes() + 1}`;
  const timeStr = `${hour}:${minute}`;

  return { dateStr, timeStr };
};
function createContactBtn (contactObj) {
  const $contactBtn = createDomEl(false, 'button', '', ['reset-btn', 'icon-btn']);

  if (iconsObj[contactObj.type] === undefined){
    $contactBtn.insertAdjacentHTML('afterbegin', iconsObj.other);
  } else {
    $contactBtn.insertAdjacentHTML('afterbegin', iconsObj[contactObj.type]);
  }

  const $tooltip = createDomEl($contactBtn, 'div', `${contactObj.type}:`, ['tooltip']);
  createDomEl($tooltip, 'a', `${contactObj.value}`, ['tooltip__link'], [{name: 'href', value: `${contactObj.value}`}]);

  // осуществить добавление к ссылке нужного атрибута 

  return $contactBtn;
};

//поиск
const TIMEOUT = 300;
let timeout;
let selectTimeout;
const $container = document.getElementById('searchResult');
const $searchInput = document.getElementById('search');
export function search() {
  $searchInput.addEventListener('input', () => {
    clearTimeout(timeout); 
    timeout = setTimeout(async ()=>{
      const response = await getServerList(URL);
      $container.innerHTML = '';
      const $resultField = createDomEl($container, 'div', '', ['result-field']);
      const $resultList = createDomEl($resultField, 'ul', '', ['reset-list', 'search-list']);
      const inputValue = $searchInput.value;
      for (const iterator of response.list) {
        const fullName = `${iterator.name}${iterator.surname}${iterator.lastName}`.toLowerCase().trim();
        if(!inputValue.toLowerCase().trim()){
          $container.innerHTML = '';
        }
        if(fullName.includes(inputValue.toLowerCase().trim())) {
          const $listItem = createDomEl($resultList, 'li', '', ['search-list__item']);
          const $listLink = createDomEl($listItem, 'a', `${iterator.surname} ${iterator.name} ${iterator.lastName}`, ['reset-link', 'search-list__link'], [{name: 'href', value: `#${iterator.id}`}]);
          //подсветить выбранный элемент при переходе по ссылке
          $listLink.addEventListener('click', () => {
            const $target = document.getElementById(`${iterator.id}`);
            $target.classList.add('selected');
            clearTimeout(selectTimeout);
            selectTimeout = setTimeout(()=>{
              $target.classList.remove('selected');
              $container.innerHTML = '';
            }, TIMEOUT * 2)

            
          })
        }
      }
        //плавная прокрутка по якорям
        const anchors = document.querySelectorAll('a[href*="#"]')
        for (let anchor of anchors) {
          anchor.addEventListener('click', function (e) {
            e.preventDefault()
            
            const blockID = anchor.getAttribute('href').substr(1)
            
            document.getElementById(blockID).scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            })
          })
        }
    }, TIMEOUT);
  });
}


