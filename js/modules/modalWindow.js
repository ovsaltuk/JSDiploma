import { createDomEl, renderList } from "./rendering.js";
import { iconsObj } from "./icons.js";
import { getClient ,addStudent, changeClient as changeClientServer, deleteClient as deleteClientServer} from "./api.js";
import { URL, getServerList } from "./api.js";

export async function createModalWindow (title, script, object) {
  let saveBtnContent = 'Сохранить';
  let cancelBtnContent = 'Отмена'
  if (script === 'delete') {
    saveBtnContent = 'Удалить';
  }
  if(script === 'change') {
    cancelBtnContent = 'Удалить клиента';
  }

  const $modal = createDomEl(document.body, 'div', '', ['modal'], [{name: 'id', value: 'modal'}]);
  const $loader = createDomEl(false, 'div', '', ['modal__window-loader']);
  $loader.insertAdjacentHTML('beforeend', iconsObj.preloader);
  const $modalWindow = createDomEl($modal, 'div', '', ['modal__window']);
  const $closeBtn = createDomEl($modalWindow, 'button', '', ['reset-btn', 'close-btn']);
  const $title = createDomEl($modalWindow, 'h2', title, ['modal__title']);
  if(script === 'change') createDomEl($title, 'span', `ID: ${object.id}`);
  // if (script === 'change' || script === 'save') {
    
  // }
  const $form = createDomEl($modalWindow, 'form', '', ['modal__form'], [{name: 'action', value: '#'}, {name: 'id', value: 'modalForm'}]);
  const $formContWrapperRequired = createDomEl($form, 'div', '', ['modal__wrapper-required']);
  const $surnameInput = createInput($formContWrapperRequired, 'Фамилия', 'surname', true,);
  const $name = createInput($formContWrapperRequired, 'Имя', 'name', true);
  const $lastName = createInput($formContWrapperRequired, 'Отчество', 'lastName');
  const $formContWrapperContacts = createDomEl($form, 'div', '', ['modal__wrapper-contacts']);
  const $addFieldBtn = createDomEl($formContWrapperContacts, 'button','Добавить контакт', ['reset-btn', 'add-field'], [{name: 'id', value: 'addField'}]);
  $addFieldBtn.insertAdjacentHTML('afterbegin', iconsObj.plus);
  const $buttonWrapper = createDomEl($form, 'div' , '', ['button-wrapper']);
  
  const $saveBtn = createDomEl($buttonWrapper, 'button', saveBtnContent, ['reset-btn', 'save-btn']);
  const $cancelBtn = createDomEl($buttonWrapper, 'button', cancelBtnContent, ['reset-btn', 'cancel-btn']);

  if(script === 'change') {
    location.hash = `${object.id}`;
    $modalWindow.append($loader);
    const client = await getClient(URL, object.id);
    $surnameInput.value = client.surname;
    $name.value = client.name;
    $lastName.value = client.lastName;
    if (client.contacts.length > 0) {
      for (const contact of client.contacts) {
        $formContWrapperContacts.prepend(createContactInput(contact.value ,revertCotactType(contact.type)));
      }
    }
    $loader.remove();
  } 
  if(script === 'delete') {
    $formContWrapperRequired.classList.add('hidden');
    $formContWrapperContacts.classList.add('hidden');
    $title.classList.add('text-align-center');
    const $alertMessage = createDomEl(false, 'span','Вы действительно хотите удалить данного клиента?', ['alert-message']);
    $buttonWrapper.prepend($alertMessage);
  }
  //добавление поля контакта
  $addFieldBtn.addEventListener('click', (e) => {
    e.preventDefault();
    $formContWrapperContacts.insertBefore(createContactInput(), $addFieldBtn);
    addContactIsAvaible();
  })
  //события на кнопку сохранить
  $saveBtn.addEventListener('click', async (e) => {
    //cкрипт save - создание нового клиента
    e.preventDefault();
    const contactsList = $modal.querySelectorAll('.contact');
    const contactsNewClient = [];
    for (const contact of contactsList) {
      const type = addContactType(contact.querySelector('.select__current-value').textContent);
      const value = contact.querySelector('input').value;
      
      contactsNewClient.push({type: type, value: value});
    }
    const client = {
      name: $name.value,
      surname: $surnameInput.value, 
      lastName: $lastName.value,
      contacts: contactsNewClient 
    };
    if (script === 'change') {
      const validateArr = $modal.querySelectorAll('input[required]');
      if(validateFields(validateArr, $buttonWrapper)){
        const response = await changeClientServer(URL, client, object.id);
        addErrorMessage(response, $buttonWrapper, $modal);
      }
    }
    if(script === 'save') {
      //валидация форм
      const validateArr = $modal.querySelectorAll('input[required]');
      if(validateFields(validateArr, $buttonWrapper)){
        $modalWindow.append($loader);
        const response = await addStudent(URL, client);
        addErrorMessage(response, $buttonWrapper, $modal);
        $loader.remove();
      }
    }
    if(script === 'delete') {
      addErrorMessage(await deleteClientServer(URL, object.id), $buttonWrapper, $modal);
    }
    renderList((await getServerList(URL)).list, tableBody);
    
  });
  //события на кнопку отмена
  $cancelBtn.addEventListener('click', async () => {
    if (script === 'change') {
      await deleteClientServer(URL, object.id);
    }
    renderList((await getServerList(URL)).list, tableBody);
    closeModal($modal);
  });
  //анимация открытия окна
  setTimeout(() => {
      $modalWindow.classList.add('scale');
  }, 100);
  
  //закрытие формы
  $closeBtn.addEventListener('click', () => {
    closeModal($modal)
  });
  $modal.addEventListener('keydown', (e)=> {
    if (e.keyCode === 27) {
      closeModal($modal);
    };
  });

  $modal.addEventListener('click', event => {
    if (event.target === event.currentTarget) closeModal($modal);
  })
}
function createInput(container, labelValue, id, isRequired = false, type = 'text', errorMessageCont) {
  const $inputWrapper = createDomEl(container, 'div', '', ['modal__input-wrapper']);
  const $label = createDomEl($inputWrapper, 'label', labelValue, ['modal__form-label'], [{name: 'for', value: id}]);
  const $input = createDomEl($inputWrapper, 'input', '', ['reset-input', 'modal__form-input'], [{name: 'type', value: type}, {name: id, value: id}]);
  if(isRequired) {
    createDomEl($label, 'span', '*');
    $input.setAttribute('required', '');
    createDomEl($label, 'span', '', ['input-error']);
    $input.addEventListener('input', () => {
      validateFields([$input]);
    });
  }
  return $input;
}
function closeModal(modal) {
    modal.remove();
}
function createContactInput(inputValue = '', currentValue = 'Телефон', selectListValues = [
    'VK', 'Facebook', 'Телефон', 'Доп.телефон', 'Другое'
  ]) {
    const $contactItem = createDomEl(false, 'div', '', ['contact']);
    const $selectWrapper = createDomEl($contactItem, 'div', '', ['select']);
    const $currentValue = createDomEl($selectWrapper, 'div', currentValue, ['select__current-value']);
    const $selectList = createDomEl($selectWrapper, 'ul', '', ['select__list', 'reset-list']);
    $currentValue.insertAdjacentHTML('beforeend', iconsObj.arrow);
    for (const select of selectListValues) {
      createDomEl($selectList, 'ul', select, ['select__list-item', 'reset-list-item']);
    }
    const $contactInput = createDomEl($contactItem, 'input', '', ['reset-input', 'contact__input'], [{name: 'required', value: ''}]);
    $contactInput.value = inputValue;
    const $deleteBtn  = createDomEl($contactItem, 'button', '', ['reset-btn', 'contact__btn']);
    $deleteBtn.insertAdjacentHTML('afterbegin', iconsObj.cancel);

    //раскрытие селекта
    $currentValue.addEventListener('click', () => {
      $selectList.classList.toggle('visible');
      $currentValue.classList.toggle('open');
    });
    //удаление формы контакта
    $deleteBtn.addEventListener('click', () => {
      $contactItem.remove();
      addContactIsAvaible();
    });
    //массив селектов
    const selectors = $selectList.querySelectorAll('.select__list-item');
    //смена текущего значения при выборе селекта
    for (const selector of selectors) {
      selector.addEventListener('click', event => {
        for (const selector of selectors) {
          selector.classList.remove('hidden');
        }
        $currentValue.textContent = selector.textContent;
        $currentValue.insertAdjacentHTML('beforeend', iconsObj.arrow);
        selector.classList.add('hidden');
        $currentValue.classList.remove('open');
        $selectList.classList.remove('visible');
      })
    }
    //закрытие селекта по клику не на него
    const modal = document.getElementById('modal');
    modal.addEventListener('click', e => {
      if (e.target !== $currentValue && e.target !== $selectList) {
        $currentValue.classList.remove('open');
        $selectList.classList.remove('visible');
      }
    });
    
    //валидация
    $contactInput.addEventListener('input', () => {
      validateFields([$contactInput]);
    })
    return $contactItem;
}
function addContactType(string) {
  let type;
  if(string === 'Телефон' || string === 'Доп.телефон') {
    type = 'phone';
  }
  if(string === 'VK') {
    type = 'vk';
  }
  if(string === 'Facebook') {
    type = 'fb';
  }
  if(string === 'Другое') {
    type = 'other';
  }
  return type;
}
function revertCotactType(string) {
  let type;
  if(string === 'vk') {
    type = 'VK';
  } else if(string === 'fb') {
    type = 'Facebook';
  } else if(string === 'phone') {
    type = 'Телефон';
  } else {
    type = 'Другое'
  }

  return type;
}
function addErrorMessage(response, container, modal) {
  if(response.status === 200 || response.status === 201){
    closeModal(modal);
  } else {
    const $message = createDomEl(false, 'span', 'Что то пошло не так...', ['error-message']);
    if (response.status === 404 || response.status === 422 || response.status[0] === 5) {
      $message.textContent = `${response.statusText}`;
    }
    
    const $currentMessage = container.querySelector('.error-message');
    if ($currentMessage !== null) {
      $currentMessage.remove();
    }
    container.prepend($message);
  }
}
function validateFields(inputsArr, errorMessageContainer) {
  let isValid = true
  for (const input of inputsArr) {
    if(!input.value.trim()){
      input.classList.remove('valid');
      input.classList.add('invalid');
      const $message = createDomEl(false, 'span', 'Что то пошло не так...', ['error-message']);
      isValid = false;
      const $currentMessage = errorMessageContainer.querySelector('.error-message');
      if ($currentMessage !== null) {
        $currentMessage.remove();
      }
      errorMessageContainer.prepend($message);
    } else {
      input.classList.remove('invalid');
      input.classList.add('valid');
    }
    
  }
  return isValid;
}
export function addContactIsAvaible(contactClass = '.contact', btnID = 'addField') {
  const inputArr = document.querySelectorAll(contactClass);
  const $btn = document.getElementById(btnID);
  if (inputArr.length >= 10) {
    $btn.setAttribute('disabled', '');
    $btn.classList.add('hidden');
  } else {
    $btn.removeAttribute('disabled');
    $btn.classList.remove('hidden');
  }
}
export function addNewClient() {
  createModalWindow('Новый клиент', 'save');
};
export function changeClient(object) {
  createModalWindow('Изменить данные', 'change', object);
}
export function deleteClient(id) {
  createModalWindow('Удалить клиента', 'delete', id);
}





