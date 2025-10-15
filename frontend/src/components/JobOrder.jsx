import React, { useEffect, useState, useRef } from "react";
import Sidebar from "./Sidebar";

const API = import.meta.env.VITE_API_BASE || "http://localhost:8080";

export default function JobOrder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    async function loadOrders() {
      try {
        setLoading(true);
        const res = await fetch(`${API}/api/orders`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const toggleOrder = (orderId) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  return (
    <div className="flex min-h-screen bg-[#F5EFEF] ">
      <Sidebar />
      <main className="flex-1 p-6 md:ml-[20px]">
        <h1 className="text-3xl font-bold text-[#332601] mb-6 mt-[50px] ml-[30px]">Job Orders</h1>

        {loading && <p className="text-center py-10 text-[#5B4220]">Loading orders...</p>}
        {error && <p className="text-center py-10 text-red-600 font-medium">{error}</p>}
        {!loading && !error && orders.length === 0 && (
          <p className="text-center py-10 text-[#5B4220]">No orders yet.</p>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-md border border-[#d7cbbb] overflow-hidden ml-[30px] mr-[30px]"
              >
                {/* Header with toggle */}
                <div
                  className="p-6 cursor-pointer flex justify-between items-start hover:bg-[#f8f5f1] ml-[20px]"
                  onClick={() => toggleOrder(order.id)}
                >
                  <div className="flex items-center space-x-4 ">
                    <div
                      className={`transform transition-transform duration-300 ${
                        expandedOrder === order.id ? "rotate-90" : ""
                      }`}
                    >
                        <span className="text-[#5B4220] text-lg mr-[20px]">▶</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-[#332601] ">
                        Order #{order.id}
                      </h3>
                      <p className="text-[#5B4220]">{order.customer_name}</p>
                      <p className="text-sm text-[#5B4220]">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#332601] mr-[30px]">
                      Total: ₱{Number(order.total).toFixed(2)}
                    </p>
                    <p className="text-sm text-[#5B4220] mr-[30px]">
                      Downpayment: ₱{Number(order.downpayment).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Collapsible content */}
                <div
                  className={`transition-[max-height] duration-500 ease-in-out overflow-hidden`}
                  style={{
                    maxHeight: expandedOrder === order.id ? "2000px" : "0px",
                  }}
                >
                  <div className="p-6 border-t border-[#d7cbbb]">
                    {/* Order Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-[#5B4220] ml-[20px]">
                      <div>
                        <p><strong>Method:</strong> {order.method}</p>
                        <p><strong>Payment:</strong> {order.payment_method}</p>
                      </div>
                      <div>
                        {order.email && <p><strong>Email:</strong> {order.email}</p>}
                        {order.phone && <p><strong>Phone:</strong> {order.phone}</p>}
                      </div>
                      {order.address && (
                        <div className="col-span-2">
                          <strong>Address:</strong> {order.address}
                        </div>
                      )}
                    </div>

                    {/* Items Table */}
                    <div className="mt-4 overflow-x-auto">
                      <h4 className="font-semibold text-[#332601] mb-2 ml-[20px]">Items</h4>
                      <table className="w-full text-sm min-w-[400px] ">
                        <thead>
                          <tr className="text-left border-b border-[#d7cbbb] ">
                            <th className="pb-2 text-[#5B4220] ">Item</th>
                            <th className="pb-2 text-center text-[#5B4220] ]">Qty</th>
                            <th className="pb-2 text-right text-[#5B4220]">Price</th>
                            <th className="pb-2 text-right text-[#5B4220]">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, idx) => (
                            <tr key={idx} className="border-b border-[#f1e8d6]">
                              <td className="py-2 text-[#332601]">{item.name}</td>
                              <td className="py-2 text-center text-[#332601]">{item.qty}</td>
                              <td className="py-2 text-right text-[#332601]">
                                ₱{Number(item.unit_price).toFixed(2)}
                              </td>
                              <td className="py-2 text-right text-[#332601]">
                                ₱{(Number(item.unit_price) * item.qty).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
