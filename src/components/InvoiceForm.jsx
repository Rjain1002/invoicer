import React, { useState, useEffect } from "react";
import { uid } from "uid";
import InvoiceItem from "./InvoiceItem";
import InvoiceModal from "./InvoiceModal";
import RupeeIcon from "./RupeeIcon";
import incrementString from "../helpers/incrementString";
const date = new Date();
const today = date.toLocaleDateString("en-GB", {
  month: "numeric",
  day: "numeric",
  year: "numeric",
});

const InvoiceForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [discount, setDiscount] = useState("");
  const [tax, setTax] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(1);
  const [cashierName, setCashierName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState([
    {
      id: uid(6),
      name: "",
      qty: 1,
      price: "1.00",
    },
  ]);

  const [invoicesHistory, setInvoicesHistory] = useState(() => {
    try {
      const data = localStorage.getItem("invoicesHistory");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  });

  // Customers for lookup (persisted)
  const [customers, setCustomers] = useState(() => {
    try {
      const data = localStorage.getItem("customers");
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  });

  // Track which invoice is currently being viewed (if any)
  const [activeInvoiceId, setActiveInvoiceId] = useState(null);
  const [activeInvoicePaid, setActiveInvoicePaid] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("invoicesHistory", JSON.stringify(invoicesHistory));
    } catch (e) {
      // ignore
    }
  }, [invoicesHistory]);

  useEffect(() => {
    try {
      localStorage.setItem("customers", JSON.stringify(customers));
    } catch (e) {
      // ignore
    }
  }, [customers]);

  const reviewInvoiceHandler = (event) => {
    event.preventDefault();
    // we're viewing the current unsaved invoice
    setActiveInvoiceId(null);
    setActiveInvoicePaid(false);
    setIsOpen(true);
  };

  const addNextInvoiceHandler = () => {
    // compute current totals to save to history
    const currentSubtotal = items.reduce((prev, curr) => {
      if (curr.name.trim().length > 0)
        return prev + Number(curr.price * Math.floor(curr.qty));
      return prev;
    }, 0);
    const currentTaxRate = (tax * currentSubtotal) / 100;
    const currentDiscountRate = (discount * currentSubtotal) / 100;
    const currentTotal = currentSubtotal - currentDiscountRate + currentTaxRate;

    const invoice = {
      id: uid(8),
      invoiceNumber,
      cashierName,
      customerName,
      items,
      subtotal: currentSubtotal,
      taxRate: currentTaxRate,
      discountRate: currentDiscountRate,
      total: currentTotal,
      date: new Date().toLocaleString(),
      paid: false,
    };

    setInvoicesHistory((prev) => [invoice, ...prev]);

    // add customer to lookup list (unique)
    if (customerName && !customers.includes(customerName)) {
      setCustomers((prev) => [customerName, ...prev]);
    }

    // reset the current invoice form
    setInvoiceNumber((prevNumber) => incrementString(prevNumber));
    setItems([
      {
        id: uid(6),
        name: "",
        qty: 1,
        price: "1.00",
      },
    ]);
    setCashierName("");
    setCustomerName("");

    // clear active view state
    setActiveInvoiceId(null);
    setActiveInvoicePaid(false);
  };

  const addItemHandler = () => {
    const id = uid(6);
    setItems((prevItem) => [
      ...prevItem,
      {
        id: id,
        name: "",
        qty: 1,
        price: "1.00",
      },
    ]);
  };

  const viewInvoiceFromHistory = (invoice) => {
    setInvoiceNumber(invoice.invoiceNumber);
    setCashierName(invoice.cashierName);
    setCustomerName(invoice.customerName);
    setItems(invoice.items);
    setActiveInvoiceId(invoice.id);
    setActiveInvoicePaid(!!invoice.paid);
    setIsOpen(true);
  };

  const deleteHistoryItem = (id) => {
    setInvoicesHistory((prev) => prev.filter((inv) => inv.id !== id));
    if (activeInvoiceId === id) {
      setActiveInvoiceId(null);
      setActiveInvoicePaid(false);
      setIsOpen(false);
    }
  };

  const togglePaid = (id) => {
    setInvoicesHistory((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, paid: !inv.paid } : inv))
    );
    if (activeInvoiceId === id) setActiveInvoicePaid((p) => !p);
  };

  const deleteItemHandler = (id) => {
    setItems((prevItem) => prevItem.filter((item) => item.id !== id));
  };

  const edtiItemHandler = (event) => {
    const editedItem = {
      id: event.target.id,
      name: event.target.name,
      value: event.target.value,
    };

    const newItems = items.map((items) => {
      for (const key in items) {
        if (key === editedItem.name && items.id === editedItem.id) {
          items[key] = editedItem.value;
        }
      }
      return items;
    });

    setItems(newItems);
  };

  const subtotal = items.reduce((prev, curr) => {
    if (curr.name.trim().length > 0)
      return prev + Number(curr.price * Math.floor(curr.qty));
    else return prev;
  }, 0);
  const taxRate = (tax * subtotal) / 100;
  const discountRate = (discount * subtotal) / 100;
  const total = subtotal - discountRate + taxRate;

  return (
    <form
      className="relative flex flex-col px-2 md:flex-row"
      onSubmit={reviewInvoiceHandler}
    >
      <div className="my-6 flex-1 space-y-2  rounded-md bg-white p-4 shadow-sm sm:space-y-4 md:p-6">
        <div className="flex flex-col justify-between space-y-2 border-b border-gray-900/10 pb-4 md:flex-row md:items-center md:space-y-0">
          <div className="flex space-x-2">
            <span className="font-bold">Current Date: </span>
            <span>{today}</span>
          </div>
          <div className="flex items-center space-x-2">
            <label className="font-bold" htmlFor="invoiceNumber">
              Invoice Number:
            </label>
            <input
              required
              className="max-w-[130px]"
              type="number"
              name="invoiceNumber"
              id="invoiceNumber"
              min="1"
              step="1"
              value={invoiceNumber}
              onChange={(event) => setInvoiceNumber(event.target.value)}
            />
          </div>
        </div>
        <h1 className="text-center text-lg font-bold">INVOICE</h1>
        <div className="grid grid-cols-2 gap-2 pt-4 pb-8">
          <label
            htmlFor="cashierName"
            className="text-sm font-bold sm:text-base"
          >
            Cashier:
          </label>
          <input
            required
            className="flex-1"
            placeholder="Cashier name"
            type="text"
            name="cashierName"
            id="cashierName"
            value={cashierName}
            onChange={(event) => setCashierName(event.target.value)}
          />
          <label
            htmlFor="customerName"
            className="col-start-2 row-start-1 text-sm font-bold md:text-base"
          >
            Customer:
          </label>
          <input
            required
            className="flex-1"
            placeholder="Customer name"
            type="text"
            name="customerName"
            id="customerName"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
          />

          {/* Customer suggestions dropdown */}
          {!isOpen &&
            !activeInvoiceId &&
            customers.length > 0 &&
            customerName.trim().length > 0 && (
              <div className="relative col-span-2">
                <ul className="absolute z-20 mt-1 max-h-40 w-full overflow-auto rounded bg-white shadow-md">
                  {customers
                    .filter((c) =>
                      c.toLowerCase().includes(customerName.toLowerCase())
                    )
                    .slice(0, 6)
                    .map((c) => (
                      <li
                        key={c}
                        className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                        onClick={() => setCustomerName(c)}
                      >
                        {c}
                      </li>
                    ))}
                </ul>
              </div>
            )}
        </div>
        <table className="w-full p-4 text-left">
          <thead>
            <tr className="border-b border-gray-900/10 text-sm md:text-base">
              <th>ITEM</th>
              <th>QTY</th>
              <th className="text-center">PRICE</th>
              <th className="text-center">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <InvoiceItem
                key={item.id}
                id={item.id}
                name={item.name}
                qty={item.qty}
                price={item.price}
                onDeleteItem={deleteItemHandler}
                onEdtiItem={edtiItemHandler}
              />
            ))}
          </tbody>
        </table>
        <button
          className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white shadow-sm hover:bg-blue-600"
          type="button"
          onClick={addItemHandler}
        >
          Add Item
        </button>
        <div className="flex flex-col items-end space-y-2 pt-6">
          <div className="flex w-full justify-between md:w-1/2">
            <span className="font-bold">Subtotal:</span>
            <span className="flex items-center">
              <RupeeIcon className="mr-1 inline-block h-4 w-4 text-gray-700" />
              {subtotal.toFixed(2)}
            </span>
          </div>
          <div className="flex w-full justify-between md:w-1/2">
            <span className="font-bold">Discount:</span>
            <span className="flex items-center">
              ({discount || "0"}%)
              <RupeeIcon className="mx-1 inline-block h-4 w-4 text-gray-700" />
              {discountRate.toFixed(2)}
            </span>
          </div>
          <div className="flex w-full justify-between md:w-1/2">
            <span className="font-bold">Tax:</span>
            <span className="flex items-center">
              ({tax || "0"}%)
              <RupeeIcon className="mx-1 inline-block h-4 w-4 text-gray-700" />
              {taxRate.toFixed(2)}
            </span>
          </div>
          <div className="flex w-full justify-between border-t border-gray-900/10 pt-2 md:w-1/2">
            <span className="font-bold">Total:</span>
            <span className="flex items-center font-bold">
              <RupeeIcon className="mr-1 inline-block h-4 w-4 text-gray-700" />
              {total % 1 === 0 ? total : total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
      <div className="basis-1/4 bg-transparent">
        <div className="sticky top-0 z-10 space-y-4 divide-y divide-gray-900/10 pb-8 md:pt-6 md:pl-4">
          <button
            className="w-full rounded-md bg-blue-500 py-2 text-sm text-white shadow-sm hover:bg-blue-600"
            type="submit"
          >
            Review Invoice
          </button>
          <InvoiceModal
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            invoiceInfo={{
              invoiceNumber,
              cashierName,
              customerName,
              subtotal,
              taxRate,
              discountRate,
              total,
            }}
            items={items}
            onAddNextInvoice={addNextInvoiceHandler}
            activeInvoiceId={activeInvoiceId}
            activeInvoicePaid={activeInvoicePaid}
            onTogglePaid={togglePaid}
          />
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-bold md:text-base" htmlFor="tax">
                Tax rate:
              </label>
              <div className="flex items-center">
                <input
                  className="w-full rounded-r-none bg-white shadow-sm"
                  type="number"
                  name="tax"
                  id="tax"
                  min="0.01"
                  step="0.01"
                  placeholder="0.0"
                  value={tax}
                  onChange={(event) => setTax(event.target.value)}
                />
                <span className="rounded-r-md bg-gray-200 py-2 px-4 text-gray-500 shadow-sm">
                  %
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-bold md:text-base"
                htmlFor="discount"
              >
                Discount rate:
              </label>
              <div className="flex items-center">
                <input
                  className="w-full rounded-r-none bg-white shadow-sm"
                  type="number"
                  name="discount"
                  id="discount"
                  min="0"
                  step="0.01"
                  placeholder="0.0"
                  value={discount}
                  onChange={(event) => setDiscount(event.target.value)}
                />
                <span className="rounded-r-md bg-gray-200 py-2 px-4 text-gray-500 shadow-sm">
                  %
                </span>
              </div>
            </div>

            <div className="pt-4">
              <h2 className="font-bold">Invoice History</h2>
              {invoicesHistory.length === 0 ? (
                <p className="text-sm text-gray-500">No invoices yet</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {invoicesHistory.map((inv) => (
                    <li
                      key={inv.id}
                      className="flex items-center justify-between rounded bg-white p-2 shadow-sm"
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="text-sm font-semibold">
                            Invoice #{inv.invoiceNumber}
                          </div>
                          {inv.paid && (
                            <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              PAID
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{inv.date}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center font-bold">
                          <RupeeIcon className="mr-1 inline-block h-4 w-4 text-gray-700" />
                          {Number(inv.total).toFixed(2)}
                        </div>
                        <button
                          type="button"
                          className="text-sm text-blue-500"
                          onClick={() => viewInvoiceFromHistory(inv)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="text-sm text-green-500"
                          onClick={() => togglePaid(inv.id)}
                        >
                          {inv.paid ? "Unmark" : "Mark paid"}
                        </button>
                        <button
                          type="button"
                          className="text-sm text-red-500"
                          onClick={() => deleteHistoryItem(inv.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {invoicesHistory.length > 0 && (
                <button
                  type="button"
                  className="mt-2 text-sm text-red-500"
                  onClick={() => setInvoicesHistory([])}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default InvoiceForm;
