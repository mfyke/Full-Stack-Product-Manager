const categoryForm = document.getElementById('category-form');
const categoryContainer = document.getElementById('category-container');
const modalContent = document.getElementById('modal-content');
const modal = document.getElementById('category-modal')
const editFormSection = document.getElementById('edit-form-section');
const pBtn = document.getElementById('product-btn');
const tBtn = document.getElementById('tag-btn');

// ? Add event listener to navigate to product page
pBtn.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = '/';
})

// ? Add event listener to navigate to tag page
tBtn.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = '/tag';
})

// ? When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}

// ? Handler for form submit to add a new category
const handleFormSubmit = (e) => {
  e.preventDefault();

  const categoryName = document.getElementById('categoryName').value.trim();

  const newCategory = {
    category_name: categoryName
  };

  document.getElementById('categoryName').value = '';

  fetch('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newCategory),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.category_name) {
        render();
      } else {
        console.log(data);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    })
}

categoryForm.addEventListener('submit', handleFormSubmit);


// ? Get a list of existing categories from the server
const getCategories = () =>
  fetch('/api/categories', {
    method: 'GET', // ? or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    // ? body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      // ? sort by ascending id before returning
      const compare = (a,b) => {
        if ( a.id < b.id ){
          return -1;
        }
        if ( a.id > b.id ){
          return 1;
        }
        return 0;
      }
    
      return data.sort(compare);
    })
    .catch((error) => {
      console.error('Error:', error);
    });

// ? Handler for view products button
const handleCardClick = (e) => {
  modalContent.innerHTML = '';

  e.preventDefault();
  const categoryId = e.currentTarget.dataset.id;

  fetch(`/api/categories/${categoryId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const productHeader = document.createElement('h2');
      productHeader.classList.add('p-2', 'm-0');
      productHeader.textContent = "Products";

      modalContent.appendChild(productHeader);

      // ? render a card for each piece of data
      const products = data.products;

      products.map((product) => {
        const productCard = document.createElement('div');
        productCard.classList.add('card', 'mb-3', 'm-3');

        const productHeader = document.createElement('h4');
        productHeader.classList.add(
          'card-header',
          'bg-primary',
          'text-light',
          'p-2',
          'm-0'
        );

        productHeader.innerHTML = `${product.product_name}`;

        const productDetails = document.createElement('div');
        productDetails.classList.add('card-body', 'bg-light', 'p-2');
        productDetails.innerHTML = `<p>Stock: ${product.stock}</p>
        <p>Price: ${product.price}</p>
        `

        productCard.appendChild(productHeader);
        productCard.appendChild(productDetails);
        modalContent.appendChild(productCard);
      })

      modal.style.display = "block";
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

// ? Handler for deleting a category
const handleDelete = (e) => {
  e.preventDefault();

  fetch(`/api/categories/${e.target.dataset.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => response.json())
    .then((data) => {
      render();
    })
    .catch((error) => {
      console.error("Error: ", error);
    })
}

// ? Handler to cancel editing
const cancelEdit = (e) => {
  e.preventDefault();

  editFormSection.innerHTML = '';
}

// ? Handler for submission of the edit form
const handleEditSubmit = (e) => {
  e.preventDefault();

  const categoryId = e.target.dataset.id;

  const categoryName = document.getElementById('editName').value.trim();

  const editCategory = { category_name: categoryName };

  editFormSection.innerHTML = '';

  fetch(`/api/categories/${categoryId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(editCategory),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        render();

      } 
    })
    .catch((error) => {
      console.error("Error:", error);
    })

}

// ? Handler for when the edit button is clicked
const handleEditButtonClick = async (e) => {
  try {
    // ? insert a new form above the add form that is populated with the info from the category that is being edited with a save button
    const categoryId = e.target.dataset.id;
    // ? get specific info for category to edit
    const resp = await fetch(`/api/categories/${categoryId}`);
    const category = await resp.json();

    // ? clear current editing form section
    editFormSection.innerHTML = '';

    // ? build editing form with a background color to distinguish it from add form
    const editForm = document.createElement('form');
    editForm.setAttribute('id', 'edit-form');
    editForm.setAttribute('data-id', categoryId);
    editForm.classList.add('flex-row', 'justify-center', 'justify-space-between-md', 'align-center', 'bg-info', 'py-2');

    // ? add editing title
    const editingTitle = document.createElement('h4');
    editingTitle.classList.add('text-light', 'p-4', 'm-0');
    editingTitle.textContent = "Now Editing..."

    // ? create div for input
    const inputDiv1 = document.createElement('div');
    inputDiv1.classList.add('col-12');

    // ? create first input and populate it
    const input1 = document.createElement('input');
    input1.setAttribute('name', 'editName');
    input1.setAttribute('id', 'editName');
    input1.setAttribute('value', category.category_name);
    input1.classList.add('form-input', 'w-100');

    // ? create submit button
    const submitDiv = document.createElement('div');
    submitDiv.classList.add('col-12', 'col-lg-6');

    const sumbitBtn = document.createElement('button');
    sumbitBtn.textContent = "Save Edits";
    sumbitBtn.classList.add('btn', 'btn-primary', 'btn-block', 'py-3');
    sumbitBtn.setAttribute('type', 'submit');

    submitDiv.appendChild(sumbitBtn);

    // ? create cancel button
    const cancelDiv = document.createElement('div');
    cancelDiv.classList.add('col-12', 'col-lg-6')

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = "Cancel Editing"
    cancelBtn.classList.add('btn', 'btn-danger', 'btn-block', 'py-3');
    cancelBtn.setAttribute('id', 'cancelEdit');
    cancelBtn.addEventListener('click', cancelEdit)

    cancelDiv.appendChild(cancelBtn);

    inputDiv1.appendChild(input1);

    editForm.appendChild(editingTitle);
    editForm.appendChild(inputDiv1);
    editForm.appendChild(submitDiv);
    editForm.appendChild(cancelDiv);

    editForm.addEventListener('submit', handleEditSubmit);

    editFormSection.appendChild(editForm);
    // ? scroll to top of window so user can see edit form
    window.scrollTo(0,0);
  } catch (e) {
    console.error(e);
  }
}

const createCard = (category) => {
  // ? Create card
  const cardEl = document.createElement('div');
  cardEl.classList.add('card', 'mb-3', 'm-3');
  cardEl.setAttribute('key', category.id);

  // ? Create card header
  const cardHeaderEl = document.createElement('h4');
  cardHeaderEl.classList.add(
    'card-header',
    'bg-primary',
    'text-light',
    'p-2',
    'm-0'
  );
  cardHeaderEl.innerHTML = `${category.category_name} </br>`;

  // ? render an edit button that has the id of the category stored and a click event listener
  const editButtonDiv = document.createElement('div');
  editButtonDiv.classList.add('text-right');

  const editButton = document.createElement('button');
  editButton.classList.add('btn', 'btn-info', 'edit-button', 'm-1');
  editButton.textContent = 'Edit Category';
  editButton.setAttribute('data-id', category.id);
  editButton.addEventListener('click', handleEditButtonClick);
  editButtonDiv.appendChild(editButton);
  cardHeaderEl.appendChild(editButtonDiv);

  // ? render a delete button that has the id of the category stored and a click event listener.
  const deleteButtonDiv = document.createElement('div');
  deleteButtonDiv.classList.add('text-right');

  const deleteButton = document.createElement('button');
  deleteButton.classList.add('btn', 'btn-danger', 'delete-button', 'm-1');
  deleteButton.textContent = 'Delete Category';
  deleteButton.setAttribute('data-id', category.id);
  deleteButton.addEventListener('click', handleDelete);

  deleteButtonDiv.appendChild(deleteButton);
  cardHeaderEl.appendChild(deleteButtonDiv);

  // ? Create card body
  const cardBodyEl = document.createElement('div');
  cardBodyEl.classList.add('card-body', 'bg-light', 'p-2');

  // ? Create button
  const viewProductsButton = document.createElement('button');
  viewProductsButton.classList.add('btn', 'btn-primary');
  viewProductsButton.textContent = 'View Products';
  viewProductsButton.setAttribute('data-id', category.id);
  viewProductsButton.addEventListener('click', handleCardClick);

  cardBodyEl.appendChild(viewProductsButton);

  // ? Append the header and body to the card element
  cardEl.appendChild(cardHeaderEl);
  cardEl.appendChild(cardBodyEl);


  // ? Append the card element to the category container in the DOM
  categoryContainer.appendChild(cardEl);
};

// ? When the page loads, get all the categories
const render = () => {
  categoryContainer.innerHTML = '';
  getCategories().then((data) => data.forEach((category) => createCard(category)));
}

render();
