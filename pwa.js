// Botão "Instalar app" + aviso de sem internet. Usado em todas as páginas.
(function () {
  var vendas = location.pathname.indexOf("/vendas") === 0;
  var css = document.createElement("style");
  css.textContent =
    "#jdInstalar{position:fixed;right:14px;bottom:14px;z-index:9999;font:700 15px/1 'Segoe UI',Arial,sans-serif;" +
    "background:#FFC828;color:#0b1d3a;border:0;border-radius:999px;padding:13px 18px;box-shadow:0 6px 18px rgba(0,0,0,.35);cursor:pointer}" +
    "#jdInstalar[hidden],#jdSemNet[hidden]{display:none}" +
    "#jdSemNet{position:fixed;left:0;right:0;top:0;z-index:9998;background:#b91c1c;color:#fff;text-align:center;" +
    "font:600 14px/1.3 'Segoe UI',Arial,sans-serif;padding:8px 12px}";
  document.head.appendChild(css);

  var pedido = null;
  function montar() {
    var b = document.createElement("button");
    b.id = "jdInstalar"; b.type = "button"; b.hidden = true; b.textContent = "📲 Instalar app";
    b.onclick = function () {
      if (!pedido) return;
      pedido.prompt();
      pedido.userChoice.then(function () { pedido = null; b.hidden = true; });
    };
    document.body.appendChild(b);
    if (pedido) b.hidden = false;

    // A página de vendas já tem o próprio aviso de internet.
    if (!vendas) {
      var n = document.createElement("div");
      n.id = "jdSemNet"; n.hidden = navigator.onLine;
      n.textContent = "Sem internet agora. Os sorteios e as reservas voltam quando a conexão voltar.";
      document.body.appendChild(n);
      addEventListener("online", function () { n.hidden = true; });
      addEventListener("offline", function () { n.hidden = false; });
    }
  }
  addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); pedido = e;
    var b = document.getElementById("jdInstalar"); if (b) b.hidden = false;
  });
  addEventListener("appinstalled", function () {
    var b = document.getElementById("jdInstalar"); if (b) b.hidden = true;
  });
  if (document.body) montar(); else addEventListener("DOMContentLoaded", montar);
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(function () {});
})();
