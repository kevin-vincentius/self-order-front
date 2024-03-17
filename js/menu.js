class Menu {
  constructor() {
    this.cart = [];
  }

  base_url = "http://127.0.0.1:8000";

  async fetchMenuData() {
    try {
      const response = await axios.get(`${this.base_url}/api/products/?active=true`);
      const menuData = response.data;

      const menuContainer = document.querySelector(".menu-container");

      if (menuContainer) {
        menuData.forEach((item) => {
          console.log(item.image)
          const formattedPrice = parseFloat(item.price);
          const cardHTML = `
            <div class="mb-4 menu-grid">
              <div class="card">
                <div href="#" class="card-texts text-decoration-none">
                  <img
                    class="card-img-top img-fluid mx-auto d-block"
                    src="${item.image}"
                    alt="${item.name}"
                  />
                  <span class="border-top"></span>
                  <div class="card-body border-top py-2 text-center p-3 d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="card-text mb-0 text-start">${item.name}</h6>
                        <p class="card-text text-start text-secondary">Rp${formattedPrice.toLocaleString(
                          "id-ID"
                        )}</p>
                    </div>
                    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#itemModal" data-product-id=${
                      item.id
                    }>
                        <i class="fa-solid fa-plus"></i>
                    </button>
                  </div>                                                                     
                </div>
              </div>
            </div>`;

          menuContainer.innerHTML += cardHTML;

          const modal = document.getElementById("itemModal");
          modal.addEventListener("show.bs.modal", (e) => {
            this.handleModalShow(e);
          });
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async fetchListMeja() {
    try {
      const response = await axios.get(`${this.base_url}/api/tables`);
      const listMejaData = response.data;

      const listMejaContainer = document.getElementById("list-meja");

      if (listMejaContainer) {
        listMejaContainer.innerHTML = "";

        listMejaData.forEach((item) => {
          const mejaElement = document.createElement("button");
          mejaElement.type = "button";
          mejaElement.textContent = item.id;
          mejaElement.setAttribute("data-bs-dismiss", "modal");

          if (item.status === "Occupied") {
            mejaElement.classList.add("btn-outline-secondary");
            mejaElement.disabled = true;
          }
          mejaElement.classList.add("meja-button", "btn", "btn-primary");
          listMejaContainer.appendChild(mejaElement);
        });
      }
    } catch (err) {
      console.error(err);
    }
  }

  handleModalShow = async (e) => {
    const button = e.relatedTarget;

    const product_id = button.getAttribute("data-product-id");

    const productImageElement = document.getElementById("productImage");
    const productNameElement = document.getElementById("productName");
    const productPriceElement = document.getElementById("productPrice");

    try {
      const response = await axios.get(
        `${this.base_url}/api/products/${product_id}`
      );
      const product_detail = response.data;

      productImageElement.src = product_detail.image;
      productImageElement.alt = product_detail.name;
      productNameElement.textContent = product_detail.name;
      productPriceElement.textContent =
        "Rp" + product_detail.price.toLocaleString("id-ID");

      const add_to_cart_btn = document.getElementById("addToCartButton");
      add_to_cart_btn.setAttribute("data-product-id", `${product_id}`);
    } catch (error) {
      console.error(error);
    }
  };
}

const plusButton = document.getElementById("plusButton");
const minusButton = document.getElementById("minusButton");

if (plusButton && minusButton) {
  document.getElementById("plusButton").addEventListener("click", function () {
    const quantityInput = document.getElementById("quantityInput");
    const currentQuantity = parseInt(quantityInput.value, 10);
    quantityInput.value = currentQuantity + 1;
  });

  document.getElementById("minusButton").addEventListener("click", function () {
    const quantityInput = document.getElementById("quantityInput");
    const currentQuantity = parseInt(quantityInput.value, 10);
    if (currentQuantity > 1) quantityInput.value = currentQuantity - 1;
  });
}

const nomorMejaElement = document.getElementById("nomor-meja");
const pilihMejaButton = document.getElementById("pilih-meja-btn");
const takeawayRadioButton = document.getElementById("option1");
const dineinRadioButton = document.getElementById("option2");

if (takeawayRadioButton) {
  takeawayRadioButton.addEventListener("click", () => {
    pilihMejaButton.style.display = "none";
    nomorMejaElement.style.display = "block";
  });
}

if (dineinRadioButton) {
  dineinRadioButton.addEventListener("click", () => {
    pilihMejaButton.style.display = "block";
    nomorMejaElement.style.display = "none";
  });
}

export default Menu;
