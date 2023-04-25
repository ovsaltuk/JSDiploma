export const URL = 'http://localhost:3000/api/clients';

export async function getServerList(URL) {
  // return await (await fetch(URL, {method: 'GET'})).json(); 
  const response = await fetch(URL, {method: 'GET'});
  const list = await response.json();
  return {
    response,
    list
  }
  
};
// добавить нового клиента на сервер
export async function addStudent(URL, user) {
  const response = await fetch(URL, {
    method: "POST",
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json'
    },
  })
  return response;
};
// изменить информацию о клиенте на сервере
export async function changeClient(URL, user, id) {
  const response = await fetch(`${URL}/${id}`, {
    method: "PATCH",
    body: JSON.stringify(user),
    headers: {
      'Content-Type': 'application/json'
    },
  })
  return response;
};
//удалить клиента
export async function deleteClient(URL, id) {
  const response = await fetch(`${URL}/${id}`, {
    method: "DELETE",
  })
  return response;
}
//получить объект клиента
export async function getClient(URL, id) {
  return await (await fetch(`${URL}/${id}`, {method: 'GET'})).json(); 
}






