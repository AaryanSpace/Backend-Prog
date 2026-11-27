(function () {
  "use strict";

  // Experiment 4: React props pass customer details; useState tracks successful updates.
  const h = React.createElement;

  function ordinal(number) {
    const mod100 = number % 100;
    if (mod100 >= 11 && mod100 <= 13) return number + "th";
    switch (number % 10) {
      case 1: return number + "st";
      case 2: return number + "nd";
      case 3: return number + "rd";
      default: return number + "th";
    }
  }

  function CustomerUpdateCounter(props) {
    const storageKey = "venuevista-update-count-" + (props.customerId || "unknown");

    // Close the React popup AND hide its fixed full-screen overlay.
    // Hiding only the component leaves the blurred backdrop covering the page.
    function closePopup() {
      setIsOpen(false);
      const panel = document.getElementById("reactUpdateCounterPanel");
      if (panel) panel.style.display = "none";
    }
    const [count, setCount] = React.useState(function () {
      try { return Number(localStorage.getItem(storageKey) || 0); }
      catch (error) { return 0; }
    });
    const [lastSignal, setLastSignal] = React.useState(0);
    const [isOpen, setIsOpen] = React.useState(false);

    React.useEffect(function () {
      const signal = Number(props.updateSignal || 0);
      if (signal <= lastSignal) return;

      setLastSignal(signal);
      setCount(function (previousCount) {
        const nextCount = previousCount + 1;
        try { localStorage.setItem(storageKey, String(nextCount)); } catch (error) {}
        return nextCount;
      });
      setIsOpen(true);
    }, [props.updateSignal, props.customerId, lastSignal]);

    if (!isOpen) return null;

    return h("div", {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "vv-update-title",
        className: "vv-update-dialog",
        onClick: function (event) {
          if (event.target === event.currentTarget) closePopup();
        }
      },
      h("div", { className: "vv-update-card" },
        h("div", { className: "vv-update-icon", "aria-hidden": "true" },
          h("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none" },
            h("path", { d: "M5 12.5l4.2 4.2L19 7", stroke: "currentColor", strokeWidth: "2.2", strokeLinecap: "round", strokeLinejoin: "round" })
          )
        ),
        h("h2", { id: "vv-update-title", className: "vv-update-title" }, "Update successful"),
        h("p", { className: "vv-update-subtitle" }, "Your booking details have been saved successfully."),
        h("div", { className: "vv-update-customer" },
          h("div", { className: "vv-update-label" }, "CUSTOMER"),
          h("div", { className: "vv-update-name" }, props.customerName || "Customer"),
          h("div", { className: "vv-update-id" }, "Customer ID: " + (props.customerId || "—"))
        ),
        h("p", { className: "vv-update-message" },
          "Thank you, ", props.customerName || "Customer", ". Your details have been updated for the ",
          h("strong", null, ordinal(count)), " time."
        ),
        h("button", {
          type: "button",
          className: "vv-update-close",
          onClick: closePopup
        }, "Continue")
      )
    );
  }

  let root = null;
  let updateSignal = 0;

  function renderCounter(customer) {
    const panel = document.getElementById("reactUpdateCounterPanel");
    const mountNode = document.getElementById("reactUpdateCounterRoot");
    if (!panel || !mountNode || !window.React || !window.ReactDOM) return;

    panel.style.display = "flex";
    if (!root) root = ReactDOM.createRoot(mountNode);

    root.render(React.createElement(CustomerUpdateCounter, {
      key: customer.customerId || "unknown",
      customerName: customer.customerName || "",
      customerId: customer.customerId || "",
      updateSignal: updateSignal
    }));
  }

  window.venueVistaRecordSuccessfulUpdate = function (customer) {
    updateSignal += 1;
    renderCounter({
      customerName: customer && customer.customerName,
      customerId: customer && customer.customerId
    });
  };

  // Keep popup styling scoped to this feature so existing VenueVista styling is untouched.
  const style = document.createElement("style");
  style.textContent = `
    .vv-update-dialog{width:100%;display:flex;justify-content:center;align-items:center}
    .vv-update-card{box-sizing:border-box;width:100%;max-width:460px;padding:30px;background:#fff;border:1px solid #e6eaf0;border-radius:20px;box-shadow:0 24px 80px rgba(0,0,0,.3);color:#172033;text-align:center;font-family:inherit;animation:vvUpdateIn .18s ease-out}
    .vv-update-icon{width:58px;height:58px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#e7f8ef;color:#16834a}
    .vv-update-title{margin:0 0 8px;color:#172033;font-size:25px;font-weight:750;letter-spacing:-.4px}
    .vv-update-subtitle{margin:0 0 22px;color:#647084;font-size:14px;line-height:1.5}
    .vv-update-customer{padding:16px;margin-bottom:16px;background:#f6f8fb;border:1px solid #e6ebf2;border-radius:12px;text-align:left}
    .vv-update-label{margin-bottom:7px;color:#7a8698;font-size:10px;font-weight:750;letter-spacing:1.1px}
    .vv-update-name{color:#172033;font-size:17px;font-weight:700}
    .vv-update-id{margin-top:4px;color:#647084;font-size:13px}
    .vv-update-message{margin:0 0 22px;color:#344054;font-size:15px;line-height:1.7}
    .vv-update-message strong{color:#172033}
    .vv-update-close{width:100%;padding:13px 18px;border:0;border-radius:10px;background:#d9b85a;color:#172033;font-size:14px;font-weight:750;cursor:pointer;transition:filter .15s ease}
    .vv-update-close:hover{filter:brightness(.96)}
    @keyframes vvUpdateIn{from{opacity:0;transform:translateY(8px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}
    @media(max-width:520px){.vv-update-card{padding:24px 20px;border-radius:16px}.vv-update-title{font-size:22px}}
  `;
  document.head.appendChild(style);
})();