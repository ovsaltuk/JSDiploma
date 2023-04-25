import * as oveFunctions from "./modules/isWebp.js";
import { getServerList, URL, getClient } from "./modules/api.js";
import { renderList, tableBody, sortArr, search } from "./modules/rendering.js";
import { addNewClient, changeClient } from "./modules/modalWindow.js";


oveFunctions.isWebp();
(async () => {
  let hash = location.hash.substring(1);
  if (hash) {
    let client = await getClient(URL, hash);
    changeClient(client);
  }
  
  //отрисовка таблицы
  renderList(sortArr((await getServerList(URL)).list, 'id'), tableBody);
  //создание нового клиента
  const $addNewClientBtn = document.getElementById('addClient');
  $addNewClientBtn.addEventListener('click', (e) => {
    e.preventDefault;
    addNewClient();
  });
  //прелоадер
  // const preloader = document.getElementById('preloader');
  // window.addEventListener('load', () => {
  //   preloader.classList.add('loader_hide');
  // });
  // window.onload = function () {
  //   preloader.classList.add('loader_hide');
  // }
  //поиск 
  search();
  //сортировка
  const tableHeadings = document.querySelectorAll('th');
  for (const heading of tableHeadings) {
    heading.addEventListener('click', async () => {
      heading.classList.toggle('rotate');

      if(heading.id === 'id') {
        if(heading.classList.value === 'rotate') {
          renderList(sortArr((await getServerList(URL)).list, 'id', true), tableBody);
        } else {
          renderList(sortArr((await getServerList(URL)).list, 'id'), tableBody);
        }
      }

      if (heading.id === 'name') {
        if(heading.classList.value === 'rotate') {
          renderList(sortArr((await getServerList(URL)).list, 'name', true), tableBody);
        } else {
          renderList(sortArr((await getServerList(URL)).list, 'name'), tableBody);
        }
      }

      if (heading.id === 'createDate') {
        if(heading.classList.value === 'rotate') {
          renderList(sortArr((await getServerList(URL)).list, 'createdAt', true), tableBody);
        } else {
          renderList(sortArr((await getServerList(URL)).list, 'createdAt'), tableBody);
        }
      }

      if (heading.id === 'changeDate') {
        if(heading.classList.value === 'rotate') {
          renderList(sortArr((await getServerList(URL)).list, 'updatedAt', true), tableBody);
        } else {
          renderList(sortArr((await getServerList(URL)).list, 'updatedAt'), tableBody);
        }
      }
    });
  }
})();







