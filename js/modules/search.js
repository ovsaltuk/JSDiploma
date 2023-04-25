import { createDomEl } from "./rendering";
export function search (containerID, inputID) {
  const $container = document.getElementById(containerID);
  const $searchInput = document.getElementById(inputID);

  $searchInput.addEventListener('input', () => {
    $resultField = createDomEl($container, 'div', '', ['result-field']);
  })
}