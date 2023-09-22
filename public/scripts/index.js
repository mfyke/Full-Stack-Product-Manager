const productForm = document.getElementById('product-form');
const productContainer = document.getElementById('product-container');
const categorySelectDiv = document.getElementById('categorySelectDiv');
const modalContent = document.getElementById('modal-content');
const modal = document.getElementById('product-modal')
const editFormSection = document.getElementById('edit-form-section');
const cBtn = document.getElementById('category-btn');
const tBtn = document.getElementById('tag-btn');

// ? Add event listener to navigate to category page
cBtn.addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = '/category';
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

// ? Function to create a select input with the categories as options
const loadCategories = async () => {
  try {
    const resp = await fetch('/api/categories');
    const categories = await resp.json();

    const categorySelect = document.createElement('select');

    categorySelect.setAttribute('id', 'categorySelect');
    categorySelect.classList.add('form-input', 'w-100');

    const optionNone = document.createElement('option');
    optionNone.textContent = 'none';
    optionNone.setAttribute('value', '');

    categorySelect.appendChild(optionNone);

    categories.forEach(category => {
      const optionEl = document.createElement('option');
      optionEl.textContent = category.category_name;
      optionEl.setAttribute('value', category.id);

      categorySelect.appendChild(optionEl);
    });

    return categorySelect;
  } catch (e) {
    console.error(e);
  }
}

// ? Function to create a select input with the tags as options
const loadTags = async () => {
  try {
    const resp = await fetch('api/tags');
    const tags = await resp.json();

    const tagSelect = document.createElement('select');

    tagSelect.setAttribute('id', 'tagSelect');
    tagSelect.classList.add('form-input');

    tags.forEach(tag => {
      const optionEl = document.createElement('option');
      optionEl.textContent = tag.tag_name;
      optionEl.setAttribute('value', tag.id);

      tagSelect.appendChild(optionEl);
    });

    return tagSelect;
  } catch (e) {
    console.log(e);
  }
}

// ? Function to load the available categories into the form to add a product
const initialLoadCategories = async () => {
  const categories = await loadCategories()
  categorySelectDiv.appendChild(categories);
}

// ? load category select on page load
initialLoadCategories();

// ? handle product form submission and add a product to the database then render it
const handleFormSubmit = (e) => {
  e.preventDefault();

  const productName = document.getElementById('productName').value.trim();
  const productStock = document.getElementById('stock').value.trim();
  const categoryId = document.getElementById('categorySelect').value;
  const price = document.getElementById('price').value.trim();

  let newProduct = {};

  categoryId === '' ? newProduct = { product_name: productName, stock: productStock, price: price } :
    newProduct = { product_name: productName, stock: productStock, category_id: categoryId, price: price }

  document.getElementById('productName').value = '';
  document.getElementById('stock').value = '';
  document.getElementById('price').value = '';

  fetch('/api/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newProduct),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.product_name && data.price) {
        render();
      } else {
        console.log(data);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    })
}

// ? add submit event listener to product form
productForm.addEventListener('submit', handleFormSubmit);

// ? Get a list of existing products from the server
const getProducts = () =>
  fetch('/api/products', {
    method: 'GET', // ? or 'PUT'
    headers: {
      'Content-Type': 'application/json',
    },
    // ? body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      // ? sort by ascending id before returning
      const compare = (a, b) => {
        if (a.id < b.id) {
          return -1;
        }
        if (a.id > b.id) {
          return 1;
        }
        return 0;
      }

      return data.sort(compare);
    })
    .catch((error) => {
      console.error('Error:', error);
    });

// ? handler for removing a tag
const handleTagRemove = async (e) => {
  try{
    e.preventDefault();

    const productId = e.target.dataset.productId;
    const tagId = e.target.dataset.id;

    const currentProductResp = await fetch(`/api/products/${productId}`);
    const currentProduct = await currentProductResp.json();

    // ? construct an updated product JSON to use as the body for a PUT request
    let updatedProduct = {
      product_name: currentProduct.product_name,
      stock: currentProduct.stock,
      price: currentProduct.price,
      tagIds: []
    }


    currentProduct.tags.map(tag => {
      if (tag.id != tagId) {
        updatedProduct.tagIds.push(tag.id);
      }
    })

    if(updatedProduct.tagIds.length === 0) {
      updatedProduct.tagIds = [''];
    }

    // ? perform put request
    const putResp = await fetch(`api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedProduct),
    })

    const productResult = await putResp.json();

    // ? if the put request is successful
    if(productResult[0] == 1) {
      const tagsList = document.getElementById('tags-list');
      const tagDiv = document.getElementById('select-tag-div');

      // ? clear out tags list and tag select element
      tagsList.innerHTML = '';
      tagDiv.innerHTML ='';

      const productRes = await fetch(`/api/products/${productId}`);
      const productUpdate = await productRes.json();
      const tagsUpdate = productUpdate.tags;

      // ? create new tags based on updated product tags
      tagsUpdate.map(tag => {
        const card = createTagCard(tag, productId);
        tagsList.appendChild(card);
      })

      const selectElement = await loadTags();
      

      const options = selectElement.children;

      const existingTags = [];

      tagsUpdate.forEach(tag => {
        existingTags.push(tag.id);
      })

      // ? remove everything from the select that already exists as a tag
      for (let i = options.length - 1; i >= 0; i--) {
        if (existingTags.includes(parseInt(options[i].value))) {
          options[i].remove();
        }
      }

      tagDiv.appendChild(selectElement);
    }
  } catch (e) {
    console.error(e);
  }
}

// ? function to create a tag card
const createTagCard = (tag, productId) => {
  const tagCard = document.createElement('div');
  tagCard.classList.add('card', 'mb-3', 'm-3');

  const tagHeader = document.createElement('h4');
  tagHeader.classList.add(
    'card-header',
    'bg-primary',
    'text-light',
    'p-2',
    'm-0'
  );

  tagHeader.innerHTML = `${tag.tag_name}`;

  const tagDetails = document.createElement('div');
  tagDetails.classList.add('card-body', 'bg-light', 'p-2');

  const removeTagButton = document.createElement('button');
  removeTagButton.classList.add('btn', 'btn-danger', 'remove-button');
  removeTagButton.textContent = 'Remove Tag';
  removeTagButton.setAttribute('data-id', tag.id);
  removeTagButton.setAttribute('data-product-id', productId)
  removeTagButton.addEventListener('click', handleTagRemove);
  tagDetails.appendChild(removeTagButton);

  tagCard.appendChild(tagHeader);
  tagCard.appendChild(tagDetails);

  return tagCard;
}

// ? handler for adding a tag to a product
const handleAddTag = async (e) => {
  try {
    e.preventDefault();
    const tagsList = document.getElementById('tags-list');

    const productId = e.target.dataset.id;
    const tagId = document.getElementById('tagSelect').value;

    const prodResp1 = await fetch(`/api/products/${productId}`);
    const currentProduct = await prodResp1.json();

    let updatedProduct = {
      product_name: currentProduct.product_name,
      stock: currentProduct.stock,
      category: currentProduct.category_id,
      price: currentProduct.price,
      tagIds: []
    }

    currentProduct.tags.map(tag => {
      {
        updatedProduct.tagIds.push(tag.id);
      }
    })

    updatedProduct.tagIds.push(tagId);

    const prodResp2 = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedProduct)
    })

    const product = await prodResp2.json();

    // ? if an update occurred, remove the tag from the select dropdown and render new tag cards
    if(product) {
      const tagSelect = document.getElementById('tagSelect');
      const options = tagSelect.children;

      for(let i = 0; i < options.length; i++) {
        if(options[i].value == tagId) {
          options[i].remove();
        }
      }


      const prodResp3 = await fetch(`/api/products/${productId}`);
      const productUpdate = await prodResp3.json();

      tagsList.innerHTML = '';

      const productTags = productUpdate.tags;

      productTags.forEach(tag => {
        const tagCard = createTagCard(tag, productId);
        tagsList.appendChild(tagCard);
      })
    }
  } catch (e) {
    console.log(e);
  }

}

// ? handler for clicking the view tags button
const handleCardClick = (e) => {
  modalContent.innerHTML = '';

  e.preventDefault();
  const productId = e.currentTarget.dataset.id;

  fetch(`/api/products/${productId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => response.json())
    .then((data) => {
      const tagsList = document.createElement('div');
      tagsList.setAttribute('id', 'tags-list');

      const tagHeader = document.createElement('h2');
      tagHeader.classList.add('p-2', 'm-0');
      tagHeader.textContent = "Tags";

      modalContent.appendChild(tagHeader);

      // ? render a card for each piece of data
      const tags = data.tags;

      tags.map((tag) => {
        const tagCard = createTagCard(tag, productId);
        tagsList.appendChild(tagCard)
      })

      modalContent.appendChild(tagsList);

      loadTags()
        .then(data => {
          const addTagDiv = document.createElement('div');
          addTagDiv.classList.add('mb-3', 'm-3')

          const addTagForm = document.createElement('form');
          addTagForm.setAttribute('data-id', productId);

          const selectTagDiv = document.createElement('div');
          selectTagDiv.setAttribute('id', 'select-tag-div');

          const allTags = data;

          const options = allTags.children;

          const existingTags = [];

          tags.forEach(tag => {
            existingTags.push(tag.id);
          })



          for (let i = options.length - 1; i >= 0; i--) {
            if (existingTags.includes(parseInt(options[i].value))) {
              options[i].remove();
            }
          }

          const sumbitBtn = document.createElement('button');
          sumbitBtn.textContent = "Add Tag";
          sumbitBtn.classList.add('btn', 'btn-primary', 'btn-block', 'py-3');
          sumbitBtn.setAttribute('type', 'submit');

          addTagForm.addEventListener('submit', handleAddTag);
          selectTagDiv.appendChild(allTags);
          addTagForm.appendChild(selectTagDiv);
          addTagForm.appendChild(sumbitBtn);
          addTagDiv.appendChild(addTagForm);
          modalContent.appendChild(addTagDiv);

          modal.style.display = "block";
        })


    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

// ? handler for deleting a product
const handleDelete = (e) => {
  e.preventDefault();

  fetch(`/api/products/${e.target.dataset.id}`, {
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

// ? handler to cancel an edit
const cancelEdit = (e) => {
  e.preventDefault();

  editFormSection.innerHTML = '';
}

// ? handler for product edit form submission
const handleEditSubmit = (e) => {
  e.preventDefault();

  const productId = e.target.dataset.id;

  const productName = document.getElementById('editName').value.trim();
  const productStock = document.getElementById('editStock').value.trim();
  const categoryId = document.getElementById('editCategory').value;
  const price = document.getElementById('editPrice').value.trim();

  let editProduct = {};

  categoryId === '' ? editProduct = { product_name: productName, stock: productStock, price: price } :
    editProduct = { product_name: productName, stock: productStock, category_id: categoryId, price: price }

  editFormSection.innerHTML = '';

  fetch(`/api/products/${productId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(editProduct),
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

// ? handler for when the edit button is clicked
const handleEditButtonClick = async (e) => {
  try {
    // ? insert a new form above the add form that is populated with the info from the product that is being edited with a save button
    const productId = e.target.dataset.id;
    // ? get specific info for product to edit
    const resp = await fetch(`/api/products/${productId}`);
    const product = await resp.json();

    // ? clear current editing form section
    editFormSection.innerHTML = '';

    // ? build editing form with a background color to distinguish it from add form
    const editForm = document.createElement('form');
    editForm.setAttribute('id', 'edit-form');
    editForm.setAttribute('data-id', productId);
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
    input1.setAttribute('value', product.product_name);
    input1.classList.add('form-input', 'w-100');

    // ? create div for input
    const inputDiv2 = document.createElement('div');
    inputDiv2.classList.add('col-12');

    // ? create second input and populate it
    const input2 = document.createElement('input');
    input2.setAttribute('name', 'editStock');
    input2.setAttribute('id', 'editStock');
    input2.setAttribute('value', product.stock);
    input2.classList.add('form-input', 'w-100');

    // ? create div for input
    const inputDiv3 = document.createElement('div');
    inputDiv3.classList.add('col-12');

    // ? create third input and populate it
    const input3 = await loadCategories();
    input3.setAttribute('id', 'editCategory');
    const options = input3.children;

    for (let i = 0; i < options.length; i++) {
      if (options[i].value == product.category_id) {
        options[i].setAttribute('selected', true);
      }
    }

    // ? create div for input
    const inputDiv4 = document.createElement('div');
    inputDiv4.classList.add('col-12');

    // ? create fourth input and populate it
    const input4 = document.createElement('input');
    input4.setAttribute('name', 'editPrice');
    input4.setAttribute('id', 'editPrice');
    input4.setAttribute('value', product.price);
    input4.classList.add('form-input', 'w-100');

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
    inputDiv2.appendChild(input2);
    inputDiv3.appendChild(input3);
    inputDiv4.appendChild(input4);

    editForm.appendChild(editingTitle);
    editForm.appendChild(inputDiv1);
    editForm.appendChild(inputDiv2);
    editForm.appendChild(inputDiv3);
    editForm.appendChild(inputDiv4);
    editForm.appendChild(submitDiv);
    editForm.appendChild(cancelDiv);

    editForm.addEventListener('submit', handleEditSubmit);

    editFormSection.appendChild(editForm);
    window.scrollTo(0, 0);
  } catch (e) {
    console.error(e);
  }
}

const createCard = (product) => {
  // ? Create card
  const cardEl = document.createElement('div');
  cardEl.classList.add('card', 'mb-3', 'm-3');
  cardEl.setAttribute('key', product.id);

  // ? Create card header
  const cardHeaderEl = document.createElement('h4');
  cardHeaderEl.classList.add(
    'card-header',
    'bg-primary',
    'text-light',
    'p-2',
    'm-0'
  );
  cardHeaderEl.innerHTML = `${product.product_name} </br>`;

  // ? render an edit button that has the id of the product stored and a click event listener
  const editButtonDiv = document.createElement('div');
  editButtonDiv.classList.add('text-right');

  const editButton = document.createElement('button');
  editButton.classList.add('btn', 'btn-info', 'edit-button', 'm-1');
  editButton.textContent = 'Edit Product';
  editButton.setAttribute('data-id', product.id);
  editButton.addEventListener('click', handleEditButtonClick);
  editButtonDiv.appendChild(editButton);
  cardHeaderEl.appendChild(editButtonDiv);

  // ? render a delete button that has the id of the product stored and a click event listener.
  const deleteButtonDiv = document.createElement('div');
  deleteButtonDiv.classList.add('text-right');

  const deleteButton = document.createElement('button');
  deleteButton.classList.add('btn', 'btn-danger', 'delete-button', 'm-1');
  deleteButton.textContent = 'Delete Product';
  deleteButton.setAttribute('data-id', product.id);
  deleteButton.addEventListener('click', handleDelete);

  deleteButtonDiv.appendChild(deleteButton);
  cardHeaderEl.appendChild(deleteButtonDiv);

  // ? Create card body
  const cardBodyEl = document.createElement('div');
  cardBodyEl.classList.add('card-body', 'bg-light', 'p-2');
  cardBodyEl.innerHTML = `<p>Stock: ${product.stock}</p>
  <p>Category: ${product.category ? product.category.category_name : 'none'}</p>
  <p>Price: ${product.price}</p>`;

  // ? Create button
  const viewTagsButton = document.createElement('button');
  viewTagsButton.classList.add('btn', 'btn-primary');
  viewTagsButton.textContent = 'View Tags';
  viewTagsButton.setAttribute('data-id', product.id);
  viewTagsButton.addEventListener('click', handleCardClick);

  cardBodyEl.appendChild(viewTagsButton);

  // ? Append the header and body to the card element
  cardEl.appendChild(cardHeaderEl);
  cardEl.appendChild(cardBodyEl);


  // ? Append the card element to the product container in the DOM
  productContainer.appendChild(cardEl);
};

// ? When the page loads, get all the products
const render = () => {
  productContainer.innerHTML = '';
  getProducts().then((data) => data.forEach((product) => createCard(product)));
}

render();
