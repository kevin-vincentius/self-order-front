import Menu from "../../js/menu.js";
import Order from "../../js/order.js";
import OrderManagement from "../../js/orderManagement.js";

export const customer_menu = new Menu();
customer_menu.fetchMenuData();

export const customer_order = new Order();

export const orderManagement = new OrderManagement();

const base_url = "http://127.0.0.1:8000/api";
const urlParams = new URLSearchParams(window.location.search);
const table_code = urlParams.get("table_code");
if (!table_code) {
  window.location.href = "../404NotFound.html";
}

const getOrderId = async () => {
  try {
    const response = await axios.get(`${base_url}/orders/`);
    const order = response.data.find(order => order.table_code === table_code);
    return order.id
  } catch (error) {
    console.error(error)
  }
}

const menu_footer_link = document.querySelector('.menu-footer-link');
const order_history_footer_link = document.querySelector('.order-history-footer-link');
if(menu_footer_link && order_history_footer_link){
  menu_footer_link.setAttribute('href', `./menu.html?table_code=${table_code}`);
  order_history_footer_link.setAttribute('href', `./order_history.html?table_code=${table_code}`);
}

const add_to_cart_btn = document.getElementById("addToCartButton");
if (add_to_cart_btn) {
  add_to_cart_btn.addEventListener("click", () => {
    customer_order && customer_order.addToCart();
  });
}

const deleteButton = document.getElementById("delete-order-button");
if (deleteButton) {
  deleteButton.addEventListener("click", () => {
    orderManagement.deleteOrderFromLocalStorage(customer_order_storage);
  });
}

document.body.addEventListener("click", () => {
  const confirmButton = document.querySelector(".confirmButton");
  if (confirmButton) {
    confirmButton.addEventListener("click", async () => {
      const order_detail = await customer_order.getOrderFromTableCode();
      customer_order.orderItems(order_detail.id);
      window.location.href = `./order_history.html?table_code=${order_detail.table_code}`;
    });
  }
});

await customer_order.displayCartItems();
customer_order.handleCartBoxShow();
orderManagement.displayOrderDetails();

const lihat_pesanan_btn = document.getElementById("lihat-pesanan-btn");
if (lihat_pesanan_btn) {
  lihat_pesanan_btn.addEventListener("click", () => {
    window.location.href = `./cart.html?table_code=${table_code}`;
  });
}

const back_to_menu_btn = document.getElementById("back-to-menu-btn");
if (back_to_menu_btn) {
  back_to_menu_btn.addEventListener("click", () => {
    window.location.href = `./menu.html?table_code=${table_code}`;
  });
}

const checkout_btn = document.getElementById('checkoutButton');
if(checkout_btn){
  checkout_btn.addEventListener('click', async () => {
    try {
      const order_id = await getOrderId();
      await axios.post(`${base_url}/orders/${order_id}/order-call-payment`);
    } catch (error) {
      console.error(error)      
    }
  })
}
