document.addEventListener("DOMContentLoaded", function () {
  const searchBar = document.getElementById("searchBar");
  const suggestions = document.getElementById("suggestions");
  const productDetails = document.getElementById("productDetails");
  const productNameSpan = document.getElementById("productName");
  const specificationsSelect = document.getElementById("specifications");
  const pricePerM2Span = document.getElementById("pricePerM2");
  const lengthInput = document.getElementById("length");
  const widthInput = document.getElementById("width");
  const totalSizeSpan = document.getElementById("totalSize");
  const printingMoneySpan = document.getElementById("printingMoney");
  const leftMaterialSpan = document.getElementById("leftMaterial");
  const perPieceMoneySpan = document.getElementById("perPieceMoney");
  const quantityInput = document.getElementById("quantity");
  const totalMoneySpan = document.getElementById("totalMoney");
  const noteInput = document.getElementById("note");
  const addToCartButton = document.getElementById("addToCartButton");
  const cartIcon = document.getElementById("cartIcon");
  const cartPopup = document.getElementById("cartPopup");
  const cartItemsList = document.getElementById("cartItems");
  const closeCartButton = document.getElementById("closeCartButton");
  const nextButton = document.getElementById("nextButton");
  const finalProductDetails = document.getElementById("finalProductDetails");
  const finalizationPopup = document.getElementById("finalizationPopup");
  const finalizationPopupContent = document.getElementById(
    "finalizationPopupContent"
  );
  const printButton = document.createElement("button");
  printButton.innerHTML = '<i class="fas fa-print"></i>';
  printButton.className = "button-common print-button";
  printButton.onclick = function () {
    window.printFinalOrder();
  };

  let cartItems = [];

  function displayProductDetails(product) {
    productNameSpan.textContent = product.product_name;
    productDetails.classList.remove("hidden");

    const url = `/product-specifications?productName=${encodeURIComponent(
      product.product_name
    )}`;
    console.log("Fetching specifications from URL:", url);

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((specifications) => {
        specificationsSelect.innerHTML = specifications
          .map(
            (spec) =>
              `<option value="${spec.product_specification}">${spec.product_specification}</option>`
          )
          .join("");

        if (specifications.length > 0) {
          fetchPricePerM2(
            product.product_name,
            specifications[0].product_specification
          );
        }

        specificationsSelect.addEventListener("change", function () {
          fetchPricePerM2(product.product_name, this.value);
        });
      })
      .catch((error) => {
        console.error("Error fetching product specifications:", error);
      });
  }

  function fetchPricePerM2(productName, productSpecification) {
    const url = `/product-price?productName=${encodeURIComponent(
      productName
    )}&productSpecification=${encodeURIComponent(productSpecification)}`;
    console.log("Fetching price from URL:", url);

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((priceData) => {
        console.log("Price Data fetched:", priceData);
        if (priceData.price_perm2) {
          const price = parseFloat(priceData.price_perm2);
          pricePerM2Span.textContent = price.toFixed(2);
        } else {
          pricePerM2Span.textContent = "0.00";
        }
        updateCalculations();
      })
      .catch((error) => {
        console.error("Error fetching product price:", error);
        pricePerM2Span.textContent = "0.00";
        updateCalculations();
      });
  }

  function calculateTotalSize() {
    const length = parseFloat(lengthInput.value) || 0;
    const width = parseFloat(widthInput.value) || 0;
    return length * width;
  }

  function calculatePrintingMoney() {
    const totalSize = calculateTotalSize();
    const pricePerM2 = parseFloat(pricePerM2Span.textContent) || 0;
    return totalSize * pricePerM2;
  }

  function calculatePerPieceMoney() {
    const printingMoney = calculatePrintingMoney();
    const leftMaterial = parseFloat(leftMaterialSpan.textContent) || 0;
    return printingMoney + leftMaterial;
  }

  function calculateTotalMoney() {
    const perPieceMoney = calculatePerPieceMoney();
    const quantity = parseFloat(quantityInput.value) || 1;
    return perPieceMoney * quantity;
  }

  function updateCalculations() {
    const totalSize = calculateTotalSize();
    totalSizeSpan.textContent = totalSize.toFixed(2);

    const printingMoney = calculatePrintingMoney();
    printingMoneySpan.textContent = printingMoney.toFixed(2);

    const perPieceMoney = calculatePerPieceMoney();
    perPieceMoneySpan.textContent = perPieceMoney.toFixed(2);

    const totalMoney = calculateTotalMoney();
    totalMoneySpan.textContent = totalMoney.toFixed(2);
  }

  lengthInput.addEventListener("input", updateCalculations);
  widthInput.addEventListener("input", updateCalculations);
  quantityInput.addEventListener("input", updateCalculations);

  addToCartButton.addEventListener("click", function () {
    const productName = productNameSpan.textContent;
    const productSpecification = specificationsSelect.value;
    const totalMoney = parseFloat(totalMoneySpan.textContent) || 0;
    const note = noteInput.value;

    const cartItem = {
      productName,
      productSpecification,
      totalMoney,
      note,
    };

    cartItems.push(cartItem);
    updateCartPopup();
  });

  cartIcon.addEventListener("click", function () {
    cartPopup.classList.toggle("hidden");
  });

  closeCartButton.addEventListener("click", function () {
    cartPopup.classList.add("hidden");
  });

  nextButton.addEventListener("click", function () {
    updateFinalProductDetails();
    finalizationPopup.classList.add("hidden");
  });

  function updateCartPopup() {
    cartItemsList.innerHTML = "";
    cartItems.forEach((item, index) => {
      const cartItemDiv = document.createElement("div");
      cartItemDiv.className = "cart-item";
      cartItemDiv.innerHTML = `
        <span>${item.productName} - ${
        item.productSpecification
      }: ${item.totalMoney.toFixed(2)} VND</span>
        <span>Note: ${item.note}</span>
        <button class="remove-from-cart" data-index="${index}"><i class="fas fa-times"></i></button>
      `;
      cartItemsList.appendChild(cartItemDiv);
    });

    const removeButtons = document.querySelectorAll(".remove-from-cart");
    removeButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const index = parseInt(this.getAttribute("data-index"));
        cartItems.splice(index, 1);
        updateCartPopup();
      });
    });
  }

  function updateFinalProductDetails() {
    finalProductDetails.innerHTML = cartItems
      .map(
        (item) =>
          `<div>
        <span>${item.productName} - ${
            item.productSpecification
          }: ${item.totalMoney.toFixed(2)} VND</span>
        <span>Note: ${item.note}</span>
      </div>`
      )
      .join("");
    console.log(
      "Updated final product details:",
      finalProductDetails.innerHTML
    ); // Debug log
  }

  function submitBillingData() {
    const staffName = document.getElementById("staffName")
      ? document.getElementById("staffName").value
      : "";
    const designer = document.getElementById("designer")
      ? document.getElementById("designer").value
      : "";
    const customerName = document.getElementById("billingCustomerName")
      ? document.getElementById("billingCustomerName").value
      : "";
    const phoneNo = document.getElementById("phoneNo")
      ? document.getElementById("phoneNo").value
      : "";
    const productDetails = finalProductDetails
      ? finalProductDetails.innerHTML
      : "";
    const paymentMethod = document.querySelector(
      'input[name="payment"]:checked'
    )
      ? document.querySelector('input[name="payment"]:checked').value
      : "";
    const deliveryMethod = document.querySelector(
      'input[name="delivery"]:checked'
    )
      ? document.querySelector('input[name="delivery"]:checked').value
      : "";
    const discount = document.getElementById("discount")
      ? document.getElementById("discount").value
      : "0";
    const amountToPay = document.getElementById("amountToPay")
      ? document.getElementById("amountToPay").textContent
      : "0";
    const note = document.getElementById("noteDetails")
      ? document.getElementById("noteDetails").value
      : "";

    const orderData = {
      staffName,
      designer,
      customerName,
      phoneNo,
      productDetails,
      paymentMethod,
      deliveryMethod,
      discount,
      amountToPay,
      note,
    };

    console.log("Sending order data:", orderData); // Log data being sent

    fetch("/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((data) => {
        console.log("Order created successfully:", data);
        // Additional actions after order creation
      })
      .catch((error) => {
        console.error("Error creating order:", error);
      });
  }

  document
    .getElementById("next-billing")
    .addEventListener("click", function () {
      // Ensure the finalProductDetails is updated before submission
      updateFinalProductDetails();

      submitBillingData();

      const rightHalfContent = document
        .querySelector(".right-half")
        .cloneNode(true);
      const nextBillingButton = rightHalfContent.querySelector("#next-billing");
      if (nextBillingButton) {
        nextBillingButton.remove();
      }

      const removeButtons =
        rightHalfContent.querySelectorAll(".remove-from-cart");
      removeButtons.forEach((button) => {
        button.remove();
      });

      finalizationPopupContent.innerHTML = "";
      finalizationPopupContent.appendChild(rightHalfContent);
      finalizationPopupContent.appendChild(printButton);

      finalizationPopup.classList.remove("hidden");
    });

  document
    .getElementById("closeFinalizationPopupButton")
    .addEventListener("click", function () {
      finalizationPopup.classList.add("hidden");
    });

  fetch("/products")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((products) => {
      if (!Array.isArray(products)) {
        throw new Error("Products is not an array");
      }
      console.log("Products:", products);

      searchBar.addEventListener("input", function () {
        const query = this.value.toLowerCase();
        suggestions.innerHTML = "";
        if (query) {
          const filteredProducts = products.filter((product) =>
            product.product_name.toLowerCase().includes(query)
          );
          filteredProducts.forEach((product) => {
            const suggestionDiv = document.createElement("div");
            suggestionDiv.textContent = product.product_name;
            suggestionDiv.addEventListener("click", function () {
              displayProductDetails(product);
              suggestions.style.display = "none";
            });
            suggestions.appendChild(suggestionDiv);
          });
          suggestions.style.display = "block";
        } else {
          suggestions.style.display = "none";
        }
      });

      if (products.length > 0) {
        displayProductDetails(products[0]);
      }
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
    });

  // Show/hide payment and delivery details based on user selection
  const paymentCash = document.getElementById("paymentCash");
  const paymentTransaction = document.getElementById("paymentTransaction");
  const cashDetails = document.getElementById("cashDetails");
  const transactionDetails = document.getElementById("transactionDetails");
  const deliveryPickup = document.getElementById("deliveryPickup");
  const deliveryDelivery = document.getElementById("deliveryDelivery");
  const pickupDetails = document.getElementById("pickupDetails");
  const deliveryDetails = document.getElementById("deliveryDetails");

  if (paymentCash && cashDetails && transactionDetails) {
    paymentCash.addEventListener("change", function () {
      if (paymentCash.checked) {
        cashDetails.classList.remove("hidden");
        transactionDetails.classList.add("hidden");
      }
    });

    paymentTransaction.addEventListener("change", function () {
      if (paymentTransaction.checked) {
        cashDetails.classList.add("hidden");
        transactionDetails.classList.remove("hidden");
      }
    });
  }

  if (deliveryPickup && pickupDetails && deliveryDetails) {
    deliveryPickup.addEventListener("change", function () {
      if (deliveryPickup.checked) {
        pickupDetails.classList.remove("hidden");
        deliveryDetails.classList.add("hidden");
      }
    });

    deliveryDelivery.addEventListener("change", function () {
      if (deliveryDelivery.checked) {
        pickupDetails.classList.add("hidden");
        deliveryDetails.classList.remove("hidden");
      }
    });
  }

  function printFinalOrder() {
    console.log("Print function called"); // Debugging statement
    const printContent = document.getElementById(
      "finalizationPopupContent"
    ).innerHTML;
    console.log("Print content:", printContent); // Debugging statement

    // Check if the print content is not empty
    if (!printContent) {
      console.error("No content to print");
      return;
    }

    const printFrame = document.createElement("iframe");
    printFrame.style.position = "absolute";
    printFrame.style.width = "0";
    printFrame.style.height = "0";
    printFrame.style.border = "none";
    document.body.appendChild(printFrame);

    const printDocument =
      printFrame.contentDocument || printFrame.contentWindow.document;
    printDocument.open();
    printDocument.write("<html><head><title>Print Order</title>");
    printDocument.write(
      '<link rel="stylesheet" href="../CSS/create-order.css" type="text/css" />'
    );
    printDocument.write(
      '<link rel="stylesheet" href="../CSS/navbar.css" type="text/css" />'
    );
    printDocument.write(
      '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" type="text/css" />'
    );
    printDocument.write("</head><body>");
    printDocument.write("<div>" + printContent + "</div>");
    printDocument.write("</body></html>");
    printDocument.close();

    printFrame.onload = function () {
      console.log("Iframe loaded"); // Debugging statement
      printFrame.contentWindow.focus(); // Ensure the iframe gets focus
      printFrame.contentWindow.print();
      document.body.removeChild(printFrame); // Clean up the iframe after printing
    };

    // Error handling for print
    printFrame.onerror = function () {
      console.error("Error loading iframe for print");
    };
  }

  window.printFinalOrder = printFinalOrder;
});
