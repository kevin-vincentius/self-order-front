import Menu from "../../js/menu.js";
import Order from "../../js/order.js";
import OrderManagement from "../../js/orderManagement.js";

window.addEventListener("DOMContentLoaded", () => {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";
  document.head.appendChild(script);
});

const base_url = "http://127.0.0.1:8000/api";

export const cashier_menu = new Menu();
cashier_menu.fetchMenuData();

const cashier_cart_storage = "cashier_cart";
const cashier_order_storage = "cashier_order";

export const cashier_orderManagement = new OrderManagement(
  cashier_order_storage
);
export const cashier_order = new Order(cashier_menu);

const display = async () => {
  await cashier_order.loadCartFromLocalStorage(cashier_cart_storage);
  await cashier_order.displayCartItems(cashier_cart_storage);
};
display();

const getListOrder = async () => {
  const orderContainer = document.getElementById("order-container");
  if (orderContainer) {
    try {
      const response = await axios.get(`${base_url}/orders`);
      const ordersData = response.data;

      const sortedOrdersData = ordersData.sort(sortOrderDate);

      sortedOrdersData.forEach((order) => {
        const nomor_meja = order.table_name
          ? `DINE IN (${order.table_name})`
          : "TAKEAWAY";

        let cardHTML = `<div class="col-md-4 col-xl-3 mt-3">
          <div class="card">
            <div class="card-body d-flex">
              <div class="col-10">
                <h4 class="card-title"><a href="${
                  "./order_detail.html?order_id=" + order.id
                }" class="text-decoration-none">Order #${order.id}</a></h4>
                <h5 class="mt-4">${nomor_meja}</h5>
                <p class="mb-0">${formatDate(order.created_at)}</p>
              </div>

              <div class="col-2 text-end">
                <a href="${
                  order.table_code
                    ? "./order.html?table_code=" + order.table_code
                    : "#"
                }" class="card-link text-decoration-none"
                  ><i class="fa-solid fa-plus btn btn-primary"></i></a>
              </div>
            </div>
            <hr class="mb-0"/> 
  
            <div class="card-body">
              <h5 class="card-text mt-0">Total: Rp${order.grand_total.toLocaleString(
                "id-ID"
              )}</h5>
            </div>
          </div>
        </div>`;

        orderContainer.innerHTML += cardHTML;
      });
    } catch (err) {
      console.error(err);
    }
  }
};

getListOrder();

const formatDate = (timestamp) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const date = new Date(timestamp);
  const dayName = days[date.getDay()];
  const monthName = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  // Convert hours to 12-hour format
  let hour = date.getHours();
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; // Convert midnight (0:00) to 12:00 AM

  // Add leading zero to minutes if less than 10
  const minute = (date.getMinutes() < 10 ? "0" : "") + date.getMinutes();

  // Format the date string
  const formattedDate = `${dayName}, ${day} ${monthName}, ${year} | ${hour}:${minute} ${ampm}`;
  return formattedDate;
};

const sortOrderDate = (a, b) => {
  const dateA = new Date(a.created_at);
  const dateB = new Date(b.created_at);
  return dateB - dateA;
};

const pilihMejaButton = document.getElementById("pilih-meja-btn");
if (pilihMejaButton) {
  pilihMejaButton.addEventListener("click", async () => {
    await cashier_menu.fetchListMeja();

    const mejaButtons = document.getElementsByClassName("meja-button");

    for (let mejaButton of mejaButtons) {
      mejaButton.addEventListener("click", () => {
        const pilihMejaButton = document.getElementById("pilih-meja-btn");
        pilihMejaButton.textContent = mejaButton.textContent;
        pilihMejaButton.classList.remove("btn-secondary");
        pilihMejaButton.classList.add("fw-bold", "fs-4");
        pilihMejaButton.style.borderColor = "grey";
      });
    }
  });
}

const addToCartButton = document.getElementById("addToCartButton");
if (addToCartButton) {
  addToCartButton.addEventListener("click", () => {
    cashier_order && cashier_order.addToCart(cashier_cart_storage);
  });
}

const confirmButton = document.getElementById("confirm-button");
if (confirmButton) {
  confirmButton.addEventListener("click", async () => {
    cashier_orderManagement.addOrder(cashier_order.menu.cart);
    cashier_orderManagement.saveOrderToLocalStorage(cashier_order_storage);

    cashier_order.submitOrder(cashier_cart_storage);
    window.location.href = "./list_order.html";
  });
}

const deleteButton = document.getElementById("delete-order-button");
if (deleteButton) {
  deleteButton.addEventListener("click", () => {
    cashier_orderManagement.deleteOrderFromLocalStorage(cashier_order_storage);
    cashier_orderManagement.orderedItems = [];
    console.log(cashier_orderManagement.orderedItems);
  });
}

const addOrderButton = document.getElementById("add-order-btn");
if (addOrderButton) {
  document.getElementById("add-order-btn").addEventListener("click", () => {
    window.location.href = "./order.html";
  });
}

const colorStatusText = (status) => {
  switch (status) {
    case "ORDER":
      return "yellow";
    case "REJECT":
      return "red";
    case "Completed":
      return "green";
  }
};

const orderHistoryContainer = document.getElementById(
  "order-history-container"
);
if (orderHistoryContainer) {
  try {
    const queryStr = window.location.search;
    const urlParams = new URLSearchParams(queryStr);
    const order_id = urlParams.get("order_id");
    const order_id_element = document.getElementById('order_id');
    order_id_element.textContent = `#${order_id} `;
    order_id_element.style.color = 'blue';

    const response = await axios.get(`${base_url}/orders/${order_id}`);
    const orderHistoryData = response.data;

    const response2 = await axios.get(`${base_url}/products`);
    const productsData = response2.data;

    orderHistoryData.items.forEach((item) => {
      const productDetail = productsData.find(
        (product) => product.id === item.product_id
      );

      const itemContainer = `
        <div class="d-flex col-12 p-3">
          <div class="d-flex flex-column bg-primar col-12 ms-3">
            <div class="d-flex bg-primar">
              <div class="col-9">
                <h4 class="d-inline">${productDetail.name}</h4>
                <span class="fs-5 ms-2">x${item.qty}</span>
                <p class="mt-4">Notes: </p>
                <p class="cart-display-notes form-control"> ${
                  item.notes || "-"
                }</p>
                <h5>Status: 
                  <span style="color: ${colorStatusText(
                    item.status
                  )}">${item.status}</span>
                  <span>${item.reject_cause ? `(${item.reject_cause})` : "" }</span>
                </h5>
              </div>
              <div class="col-3 text-center">
                <h5 class="subtotal">Rp${item.subtotal.toLocaleString("id-ID")}</h5>
                <a><button class="btn btn-primary btn-wrap process-item-btn">Process Item</button></a>
              </div>
            </div>

          </div>
        </div>
        <hr>`;
      orderHistoryContainer.innerHTML += itemContainer;
    });

    const totalPriceElement = document.querySelector(".totalSumPrice");
    totalPriceElement.textContent = 'Rp' + orderHistoryData.grand_total.toLocaleString("id-ID");
  } catch (err) {
    console.error(err);
  }
}


