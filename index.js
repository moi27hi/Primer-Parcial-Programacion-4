
class AppHeader extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const logoSrc = this.getAttribute("logo") || "imagenes/logo_ugb.png";
    const titulo = this.getAttribute("titulo") || "Parcial";

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 30px;
          border-bottom: 1px solid #ddd;
        }
        img {
          width: 80px;
        }
        .titulo-parcial {
          text-align: right;
          color: #1a1aff;
          font-size: 14px;
          font-weight: bold;
          line-height: 1.5;
        }
      </style>

      <header>
        <img src="${logoSrc}" alt="Logo UGB" />
        <div class="titulo-parcial">${titulo}</div>
      </header>
    `;
  }
}
customElements.define("app-header", AppHeader);


class AppFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    let integrantes = [];
    try { integrantes = JSON.parse(this.getAttribute("integrantes") || "[]"); }
    catch(e) { console.error("app-footer: atributo 'integrantes' no es JSON válido"); }

    let enlaces = [];
    try { enlaces = JSON.parse(this.getAttribute("enlaces") || "[]"); }
    catch(e) { console.error("app-footer: atributo 'enlaces' no es JSON válido"); }

    const spans = integrantes.map((i) => `<span>${i}</span>`).join("");
    const botones = enlaces.map((e) => `
        <a href="${e.href}" class="btn-nav">${e.texto}</a>
    `).join("");

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        footer {
          background-color: #1a1aff;
          color: white;
          text-align: center;
          padding: 30px 20px;
          font-family: Arial, sans-serif;
        }
        .titulo-footer {
          font-weight: bold;
          font-size: 16px;
          text-decoration: underline;
          margin-bottom: 10px;
        }
        .integrantes {
          display: flex;
          justify-content: center;
          gap: 40px;
          font-size: 14px;
        }
        .nav-botones {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 15px;
            flex-wrap: wrap;
        }
        .btn-nav {
            padding: 10px 20px;
            background-color: #2c3e50;
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            font-size: 13px;
            transition: all 0.3s ease;
        }
        .btn-nav:hover {
            background-color: crimson;
            transform: translateY(-3px);
        }
      </style>

      <footer>
        <p class="titulo-footer">Integrantes del Equipo</p>
        <div class="integrantes">${spans}</div>
        <div class="nav-botones">${botones}</div>
       
      </footer>
    `;
  }
}
customElements.define("app-footer", AppFooter);