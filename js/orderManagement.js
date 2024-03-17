class OrderManagement {
  // constructor(order) {
  //   const storedOrders = localStorage.getItem(order);
  //   this.orderedItems = storedOrders ? JSON.parse(storedOrders) : [];
  // }
  base_url = "http://127.0.0.1:8000/api";

  getOrderDetail = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const table_code = urlParams.get("table_code");

    try {
      const response = await axios.get(`${this.base_url}/orders/`);

      const order_detail = response.data.find(
        (order) => order.table_code === table_code
      );
      const test=  await axios.get(`${this.base_url}/orders/${order_detail.id}/order-history`);
      console.log(test)
      return test
    } catch (error) {
      console.error(error);
    }
  };

  addOrder = async (newOrder) => {
    newOrder.forEach((item) => (item.status = "Order"));
    this.orderedItems.push([...newOrder]);
  };

  displayOrderDetails = async () => {
    const orderHistoryContainerElement = document.getElementById(
      "order-history-container"
    );

    //get detail product
    if (orderHistoryContainerElement) {
      const order_history = await this.getOrderDetail();
      const order_history_items = order_history.data.items;

      let order_history_product_detail = [];
      const promises = order_history_items.map(async (item) => {
        try {
          const response = await axios.get(
            `${this.base_url}/products/${item.product_id}`
          );
          order_history_product_detail.push(response.data);
        } catch (error) {
          console.error(error);
        }
      });
      await Promise.all(promises);

      const orderSection = document.createElement("div"); //container per order
      orderSection.classList.add("border", "mt-3", "p-3");

      const orderDetailContainer = document.createElement("div"); //container untuk order detail
      

      order_history_items.forEach((item, index) => {
        const itemContainer = `
          <div class="d-flex p-3"> 
            <div class="col-4 text-center col-4"> 
              <img src="${order_history_product_detail[index].image}" alt="${
          order_history_product_detail[index].name
        }" class="cart-item-image" >
            </div>

            <div class="d-flex flex-column col-8 ms-3"> 
              <div class="d-flex"> 
                <div class="col-8">
                  <h4 class="d-inline">${
                    order_history_product_detail[index].name
                  }</h4>
                  <span class="fs-5 ms-2">x${item.qty}</span>
                  <p class="mt-4">Notes: </p>
                  <p class="cart-display-notes form-control"> ${
                    item.notes || "-"
                  }</p>
                
                </div>
                <div class="col-4 ms-5">
                  <h5>Rp${item.subtotal.toLocaleString("id-ID")}</h5>
                </div>
              </div>
              <div class="d-flex justify-content-between col-11">
                <h5>Status: <span style="color: ${this.colorStatusText(
                  item.status
                )}">${item.status}</span></h5>
                <small">${item.order_at}</small>
              </div>
            </div>
          </div>
          `;
          
                    
          orderDetailContainer.innerHTML += itemContainer;
      });

      orderSection.append(orderDetailContainer);
      orderHistoryContainerElement.append(orderSection);

      const totalSumPriceElement = document.querySelector(".totalSumPrice");
      totalSumPriceElement.innerHTML = `Rp` +
        order_history.data.grand_total.toLocaleString("id-ID");
    }
  };

  colorStatusText(status) {
    switch (status) {
      case "ORDER":
        return "yellow";
      case "REJECT":
        return "red";
      case "COMPLETE":
        return "green";
    }
  }
}

export default OrderManagement;
