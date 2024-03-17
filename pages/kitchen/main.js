const base_url = "http://127.0.0.1:8000/api";

const getListOrderItem = async () => {
  const itemContainer = document.getElementById("item-container");
  if (itemContainer) {
    try {
      const response = await axios.get(`${base_url}/kitchen/process-items`);
      const ordersData = response.data;

      const response2 = await axios.get(`${base_url}/products`);
      const productData = response2.data; 

      const response3 = await axios.get(`${base_url}/tables`);
      const tablesData = response3.data; 

      ordersData.forEach((order) => {
        const nomor_meja = order.table_name
          ? `DINE IN (${order.table_name})`
          : "TAKEAWAY";
        
        const order_items = order.items;

        order_items.forEach((item) => {
          const product_detail = productData.find((produk) => produk.id === item.product_id);
          const table_detail = tablesData.find((table) => table.code === item.table_code);
          const table_name = table_detail ? table_detail.name : ""

          const complete_item_process_url = `${base_url}/orders/${order.id}/items/${item.id}/complete`;
          const reject_item_process_url = `${base_url}/orders/${order.id}/items/${item.id}/reject`;

          const cardHTML = `<div class="col-3 mt-3">
            <div class="card">
              <div class="card-body">
                  <div class="col-12">
                    <h5 class="">Order #${order.id} ${table_name ? "(" + table_name + ")" : ""}</h5>
                    <h5 class="text-primary">Item #${item.id}</h5>
                    <h6>${nomor_meja}</h6>
                    <small>${formatDate(order.created_at)}</small>
                    <hr>

                  </div>

                  <div class="d-flex align-items-center">
                    <div class="col-8">
                      <h5>${product_detail.name}<span class="fw-normal">${" x" + item.qty}</span>
                      </h5>
                      <p>Notes: </p>
                      <p class="cart-display-notes form-control"> ${item.notes || "-"}</p>
                      <textarea class="form-control cart-edit-notes" style="display: none;" placeholder="Edit your notes...">${
                        item.notes || ""
                      }</textarea>
                    </div>

                    <div class="text-center">
                      <a href="${complete_item_process_url}"><button class="btn btn-primary col-10">Selesai</button></a>
                      <a href="${reject_item_process_url}" ><button class="btn btn-danger col-10 mt-3">Reject</button></a>
                    </div>
                  </div>
              </div>
              
            </div>
          </div>`;
          
          itemContainer.innerHTML += cardHTML;
        })

      });
    } catch (err) {
      console.error(err);
    }
  }
};
getListOrderItem();

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
  

