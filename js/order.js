class Order {
  constructor() {}

  base_url = "http://127.0.0.1:8000/api";

  handleCartBoxShow = async () => {
    const cartBoxContainerElement = document.querySelector(".cartBoxContainer");
    const itemCountElement = document.querySelector(".total-item-count");
    const menuContainerElement = document.querySelector(".menu-container");

    const order_detail = await this.getOrderFromTableCode();
    const order_items = order_detail.items;

    if (order_items.length === 0 && cartBoxContainerElement) {
      cartBoxContainerElement.style.display = "none";
      return;
    }

    let totalItemCount = 0;
    let subtotal_cart = 0;
    order_items.forEach((item) => {
      totalItemCount += item.qty;
      subtotal_cart += item.subtotal;
    });

    if (
      cartBoxContainerElement &&
      itemCountElement &&
      order_items.length >= 1
    ) {
      cartBoxContainerElement.style.display = "block";
      itemCountElement.textContent = totalItemCount;
      menuContainerElement.style.paddingBottom = "200px";
    }

    const totalPriceElement = document.querySelector(".totalPrice");
    if (totalPriceElement)
      totalPriceElement.textContent =
        `Rp` + subtotal_cart.toLocaleString("id-ID");
  };

  getOrderFromTableCode = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const table_code = urlParams.get("table_code");

    try {
      const response = await axios.get(
        `${this.base_url}/orders/table/${table_code}`
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  addToCart = async () => {
    const cartBoxContainerElement = document.querySelector(".cartBoxContainer");

    const quantityInput = document.getElementById("quantityInput");
    const selectedQuantity = parseInt(quantityInput.value, 10);

    const productImageElement = document.getElementById("productImage");
    const productNameElement = document.getElementById("productName");
    const productPriceElement = document.getElementById("productPrice");
    const notesElement = document.getElementById("notesTextArea");
    const add_to_cart_btn = document.getElementById("addToCartButton");
    const product_id = add_to_cart_btn.getAttribute("data-product-id");

    if (!productImageElement || !productNameElement || !productPriceElement) {
      return;
    }

    const product = {
      product_id: product_id,
      qty: selectedQuantity,
      notes: notesElement.value || "",
    };

    try {
      const order_detail = await this.getOrderFromTableCode();
      const order_id = order_detail.id;
      await axios.post(
        `${this.base_url}/cart/${order_id}/add-to-cart`,
        product
      );
    } catch (error) {
      console.error(error);
    }

    await this.displayCartItems();
    cartBoxContainerElement && this.handleCartBoxShow();
  };

  getProductDetail = async (product_id) => {
    try {
      const response = await axios.get(
        `${this.base_url}/products/${product_id}`
      );
      return response.data;
    } catch (error) {
      console.error(error);
    }
  };

  displayCartItems = async () => {
    const cartContainer = document.getElementById("cartContainer");
    const totalPriceElement = document.querySelector(".totalPrice");

    if (!cartContainer || !totalPriceElement) {
      console.log("no cart container or total price element");
      return;
    }

    cartContainer.innerHTML = "";

    const order_detail = await this.getOrderFromTableCode();
    const order_items = order_detail.items;

    if (order_items.length === 0) {
      const cartEmptyText = document.createElement("h5");

      cartEmptyText.textContent = "Cart is empty";
      cartEmptyText.style.display = "block";
      cartContainer.append(cartEmptyText);
      cartContainer.classList.add(
        "d-flex",
        "align-items-center",
        "justify-content-center"
      );
    } else if (order_items.length >= 1) {
      cartContainer.classList.remove(
        "d-flex",
        "align-items-center",
        "justify-content-center"
      );

      let order_items_list = [];
      const promises = order_items.map(async (item) => {
        try {
          const response = await axios.get(
            `${this.base_url}/products/${item.product_id}`
          );
          order_items_list.push(response.data);
        } catch (error) {
          console.error(error);
        }
      });
      await Promise.all(promises);

      order_items.forEach((item, index) => {
        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");

        cartItem.innerHTML = `
          <div class="d-flex p-3"> 
          <div class="col-4 left-img-container text-center"> <!-- image/ left container --!>
          <img src="${order_items_list[index].image}" alt="${
          order_items_list[index].name
        }" class="cart-item-image" >
          </div>
          
          <div class="d-flex flex-column col-8 ms-3"> <!-- content/ item details container --!>
          <div class="d-flex"> <!-- upper container --!>
          <div class="col-8"> <!-- upper left container --!>
          <h4>${order_items_list[index].name}</h4>
          <p class="mt-4">Notes: </p>
          <p class="cart-display-notes form-control"> ${item.notes || "-"}</p>
          <textarea class="form-control cart-edit-notes" style="display: none;" placeholder="Edit your notes...">${
            item.notes || ""
          }</textarea>
          </div>
          <h5 id="subtotal-${index}" class="col-2 ms-5 text-center">Rp${item.subtotal.toLocaleString(
          "id-ID"
        )}</h5>
            </div>
            
            <div class="d-flex mt-3"> <!-- lower container --!> 
            <div class="col-5 " data-index=${index} data-item-id=${
          item.id
        }> <!-- lower left container --!>
            <button class="btn btn-primary editButton" data-item-id=${
              item.id
            }>Edit Notes</button>
            <button class="btn btn-primary saveButton" style="display:none" data-item-id=${
              item.id
            }>Save</button>
            </div>
            <div class="d-flex col-7 justify-content-around align-items-center"> <!-- lower right container !-->
            <button class="btn deleteButton" data-item-id=${
              item.id
            } data-index=${index}><i class="cart-actions-delete fa-solid fa-trash-can"></i></button>
            <button class="btn minusQtyButton" data-item-id=${
              item.id
            } data-index=${index}><i class="cart-actions-qty fa-solid fa-circle-minus"></i></button>
            <h5 class="quantity" data-index=${index}>${item.qty}</h5>
            <button class="btn plusQtyButton" data-item-id=${
              item.id
            } data-index=${index}><i class="cart-actions-qty fa-solid fa-circle-plus"></i></button>
            </div>
            </div>
            </div>
            </div>
            <hr>
            `;
        cartContainer.append(cartItem);
      });

      const plusButtons = document.querySelectorAll(".plusQtyButton");
      const minusButtons = document.querySelectorAll(".minusQtyButton");

      plusButtons.forEach((button) => {
        button.addEventListener("click", async () => {
          const quantityElement =
            button.parentElement.querySelector(".quantity");
          const currentQuantity = parseInt(quantityElement.textContent, 10);
          const item_id = parseInt(button.getAttribute("data-item-id"), 10);

          try {
            const response = await this.updateQty({
              order_id: order_detail.id,
              item_id: item_id,
              newQty: currentQuantity + 1,
            });
            const updated_order = response.data;

            const itemIndex = parseInt(button.getAttribute("data-index"));
            const subtotalElement = document.querySelector(
              `#subtotal-${itemIndex}`
            );
            quantityElement.textContent = currentQuantity + 1;

            const updated_item = updated_order.data.items.find(
              (item) => item.id === item_id
            );

            subtotalElement.textContent = `Rp${updated_item.subtotal.toLocaleString(
              "id-ID"
            )}`;
            totalPriceElement.textContent = `Rp${updated_order.data.draft_grand_total.toLocaleString(
              "id-ID"
            )}`;
          } catch (error) {
            console.error(error);
          }
        });
      });

      minusButtons.forEach((button) => {
        button.addEventListener("click", async () => {
          const quantityElement =
            button.parentElement.querySelector(".quantity");
          const currentQuantity = parseInt(quantityElement.textContent, 10);
          const item_id = parseInt(button.getAttribute("data-item-id"), 10);

          if (currentQuantity > 1) {
            try {
              const response = await this.updateQty({
                order_id: order_detail.id,
                item_id: item_id,
                newQty: currentQuantity - 1,
              });

              const updated_order = response.data;

              const itemIndex = parseInt(button.getAttribute("data-index"));
              const subtotalElement = document.querySelector(
                `#subtotal-${itemIndex}`
              );
              quantityElement.textContent = currentQuantity - 1;

              const updated_item = updated_order.data.items.find(
                (item) => item.id === item_id
              );

              subtotalElement.textContent = `Rp${updated_item.subtotal.toLocaleString(
                "id-ID"
              )}`;
              totalPriceElement.textContent = `Rp${updated_order.data.draft_grand_total.toLocaleString(
                "id-ID"
              )}`;
            } catch (error) {
              console.error(error);
            }
          }
        });
      });

      const deleteButtons = document.querySelectorAll(".deleteButton");
      deleteButtons.forEach((button) => {
        button.addEventListener("click", () => {
          const item_id = parseInt(button.getAttribute("data-item-id"), 10);
          this.deleteCartItem(order_detail.id, item_id);
        });
      });

      //edit
      const editButtons = document.querySelectorAll(".editButton");

      editButtons.forEach((button) => {
        button.addEventListener("click", () => {
          let isEditing = true;
          console.log("a");
          const itemIndex = parseInt(
            button.parentElement.getAttribute("data-index"),
            10
          );
          const item_id = parseInt(button.getAttribute("data-item-id"), 10);
          const notesDisplay = document.querySelectorAll(".cart-display-notes");
          const notesEdit = document.querySelectorAll(".cart-edit-notes");
          notesDisplay[itemIndex].style.display = "none";
          notesEdit[itemIndex].style.display = "block";
          const quantityElement = document.querySelector(
            `.quantity[data-index="${itemIndex}"]`
          );
          const currentQuantity = parseInt(quantityElement.textContent, 10);

          const saveButton = document.createElement("button");
          saveButton.classList.add("btn", "btn-primary");
          saveButton.textContent = "Save";
          button.style.display = "none";

          const parentContainer = button.parentElement;
          parentContainer.append(saveButton);

          saveButton.addEventListener("click", async () => {
            console.log("b");
            try {
              const response = await this.updateQty({
                order_id: order_detail.id,
                item_id: item_id,
                newQty: currentQuantity,
                newNotes: notesEdit[itemIndex].value,
              });
              console.log(response);
            } catch (err) {
              console.error(err);
            }

            notesDisplay[itemIndex].style.display = "block";
            notesEdit[itemIndex].style.display = "none";
            notesDisplay[itemIndex].textContent = notesEdit[itemIndex].value;
            button.style.display = "block";
            saveButton.remove();
          });
        });
      });

      const totalPrice = document.querySelector(".totalPrice");
      totalPrice.textContent = `Rp` + order_detail.draft_grand_total;
    }
  };

  orderItems = async (order_id) => {
    try {
      return await axios.post(
        `${this.base_url}/orders/${order_id}/order-draft-items`
      );
    } catch (error) {
      console.error(error);
    }
  };

  updateQty = async ({ order_id, item_id, newQty, newNotes }) => {
    try {
      let updated_order_item;

      if (!newNotes) {
        updated_order_item = { qty: newQty };
      } else {
        updated_order_item = { qty: newQty, notes: newNotes };
      }

      return await axios.post(
        `${this.base_url}/orders/${order_id}/items/${item_id}/update-draft`,
        updated_order_item
      );
    } catch (error) {
      console.error(error);
    }
  };

  deleteCartItem = async (order_id, item_id) => {
    try {
      await axios.post(
        `${this.base_url}/cart/${order_id}/items/${item_id}/cancel`
      );
      this.handleConfirmButtonVisibility();
      this.displayCartItems();
    } catch (error) {
      console.error(error);
    }
  };

  handleConfirmButtonVisibility = async () => {
    const kirim_pesanan_btn = document.getElementById("kirim-pesanan-btn");
    const order_detail = await this.getOrderFromTableCode();

    console.log(order_detail.items.length);
    if (order_detail.items.length < 1) {
      kirim_pesanan_btn.style.display = "none";
    }
  };
}

export default Order;
