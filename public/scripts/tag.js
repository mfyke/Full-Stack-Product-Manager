const tagForm = document.getElementById('tag-form');
const tagContainer = document.getElementById('tag-container');
const modalContent = document.getElementById('modal-content');
const modal = document.getElementById('tag-modal')
const editFormSection = document.getElementById('edit-form-section');
const pBtn = document.getElementById('product-btn');
const cBtn = document.getElementById('category-btn');

// ? Add event listener to navigate to product page
pBtn.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = '/';
})

// ? Add event listener to navigate to category page
cBtn.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = '/category';
})

// ? When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}

// ? handler for submitting the tag form that adds a new tag to db and renders it
const handleFormSubmit = (e) => {
  e.preventDefault();

  const tagName = document.getElementById('tagName').value.trim();

  const newTag = {
    tag_name: tagName
  };

  document.getElementById('tagName').value = '';

  fetch('/api/tags', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newTag),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.tag_name) {
        render();
      } else {
        console.log(data);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    })
}

// ? add submit event listener to the tag form
tagForm.addEventListener('submit', handleFormSubmit);


// ? Get a list of existing tags from the server
const getTags = () =>
  fetch('/api/tags', {
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
        if ( a.id< b.id ){
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

// ? handler for when the view products button is clicked
const handleCardClick = (e) => {
  modalContent.innerHTML = '';

  e.preventDefault();
  const tagId = e.currentTarget.dataset.id;

  fetch(`/api/tags/${tagId}`, {
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

// ? handler for deleting a tag
const handleDelete = (e) => {
  e.preventDefault();

  fetch(`/api/tags/${e.target.dataset.id}`, {
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

// ? handler to cancel tag edit
const cancelEdit = (e) => {
  e.preventDefault();

  editFormSection.innerHTML = '';
}

// ? handler for tag edit form submission to update the tag in the database
const handleEditSubmit = (e) => {
  e.preventDefault();

  const tagId = e.target.dataset.id;

  const tagName = document.getElementById('editName').value.trim();

  const editTag = { tag_name: tagName };

  editFormSection.innerHTML = '';

  fetch(`/api/tags/${tagId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(editTag),
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

const handleEditButtonClick = async (e) => {
  try {
    // ? insert a new form above the add form that is populated with the info from the tag that is being edited with a save button
    const tagId = e.target.dataset.id;
    // ? get specific info for tag to edit
    const resp = await fetch(`/api/tags/${tagId}`);
    const tag = await resp.json();

    // ? clear current editing form section
    editFormSection.innerHTML = '';

    // ? build editing form with a background color to distinguish it from add form
    const editForm = document.createElement('form');
    editForm.setAttribute('id', 'edit-form');
    editForm.setAttribute('data-id', tagId);
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
    input1.setAttribute('value', tag.tag_name);
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
    window.scrollTo(0,0);
  } catch (e) {
    console.error(e);
  }
}

const createCard = (tag) => {
  // ? Create card
  const cardEl = document.createElement('div');
  cardEl.classList.add('card', 'mb-3', 'm-3');
  cardEl.setAttribute('key', tag.id);

  // ? Create card header
  const cardHeaderEl = document.createElement('h4');
  cardHeaderEl.classList.add(
    'card-header',
    'bg-primary',
    'text-light',
    'p-2',
    'm-0'
  );
  cardHeaderEl.innerHTML = `${tag.tag_name} </br>`;

  // ? render an edit button that has the id of the tag stored and a click event listener
  const editButtonDiv = document.createElement('div');
  editButtonDiv.classList.add('text-right');

  const editButton = document.createElement('button');
  editButton.classList.add('btn', 'btn-info', 'edit-button', 'm-1');
  editButton.textContent = 'Edit Tag';
  editButton.setAttribute('data-id', tag.id);
  editButton.addEventListener('click', handleEditButtonClick);
  editButtonDiv.appendChild(editButton);
  cardHeaderEl.appendChild(editButtonDiv);

  // ? render a delete button that has the id of the tag stored and a click event listener.
  const deleteButtonDiv = document.createElement('div');
  deleteButtonDiv.classList.add('text-right');

  const deleteButton = document.createElement('button');
  deleteButton.classList.add('btn', 'btn-danger', 'delete-button', 'm-1');
  deleteButton.textContent = 'Delete Tag';
  deleteButton.setAttribute('data-id', tag.id);
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
  viewProductsButton.setAttribute('data-id', tag.id);
  viewProductsButton.addEventListener('click', handleCardClick);

  cardBodyEl.appendChild(viewProductsButton);

  // ? Append the header and body to the card element
  cardEl.appendChild(cardHeaderEl);
  cardEl.appendChild(cardBodyEl);


  // ? Append the card element to the tag container in the DOM
  tagContainer.appendChild(cardEl);
};

// ? When the page loads, get all the tags
const render = () => {
  tagContainer.innerHTML = '';
  getTags().then((data) => data.forEach((tag) => createCard(tag)));
}

render();
