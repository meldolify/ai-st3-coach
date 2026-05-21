import{r as s,j as e}from"./index-BX2naJQ4.js";import{P as l}from"./PageLayout-BEydSntf.js";import"./AppNav-PvAaVQTA.js";import"./selectionStore-BvHbgax4.js";function f(){const[r,t]=s.useState("idle"),[i,a]=s.useState("");async function o(n){n.preventDefault(),t("sending"),a("");{t("error"),a("Contact form is not yet wired up. Please email hello@reviva.live directly.");return}}return e.jsxs(l,{title:"Contact",lastUpdated:null,children:[e.jsx("p",{children:"We aim to reply to every email within two working days. For account or billing issues, please include your account email address."}),e.jsx("h2",{children:"Email"}),e.jsxs("ul",{children:[e.jsxs("li",{children:["General: ",e.jsx("a",{href:"mailto:hello@reviva.live",children:"hello@reviva.live"})]}),e.jsxs("li",{children:["Privacy & data requests:"," ",e.jsx("a",{href:"mailto:privacy@reviva.live",children:"privacy@reviva.live"})]}),e.jsxs("li",{children:["Billing & subscriptions:"," ",e.jsx("a",{href:"mailto:support@reviva.live",children:"support@reviva.live"})]})]}),e.jsx("h2",{children:"Send us a message"}),r==="sent"?e.jsxs("div",{className:"page-layout__placeholder",children:[e.jsx("strong",{children:"Thanks — message received."})," We’ll be in touch soon."]}):e.jsxs("form",{onSubmit:o,className:"contact-form",children:[e.jsxs("label",{className:"contact-form__field",children:[e.jsx("span",{children:"Your name"}),e.jsx("input",{type:"text",name:"name",required:!0,autoComplete:"name"})]}),e.jsxs("label",{className:"contact-form__field",children:[e.jsx("span",{children:"Email address"}),e.jsx("input",{type:"email",name:"email",required:!0,autoComplete:"email"})]}),e.jsxs("label",{className:"contact-form__field",children:[e.jsx("span",{children:"Subject"}),e.jsx("input",{type:"text",name:"subject",required:!0})]}),e.jsxs("label",{className:"contact-form__field",children:[e.jsx("span",{children:"Message"}),e.jsx("textarea",{name:"message",rows:6,required:!0})]}),e.jsx("button",{type:"submit",className:"contact-form__submit",disabled:r==="sending",children:r==="sending"?"Sending…":"Send message"}),r==="error"&&e.jsx("p",{className:"contact-form__error",children:i})]}),e.jsx("style",{children:`
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-top: 16px;
        }
        .contact-form__field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .contact-form__field span {
          font-size: 0.88rem;
          font-weight: 500;
          color: rgba(42, 38, 32, 0.85);
        }
        .contact-form__field input,
        .contact-form__field textarea {
          padding: 10px 12px;
          border: 1px solid rgba(74, 93, 76, 0.2);
          border-radius: 6px;
          font-family: inherit;
          font-size: 0.95rem;
          background: #fff;
          color: #2A2620;
        }
        .contact-form__field input:focus,
        .contact-form__field textarea:focus {
          outline: none;
          border-color: #4A5D4C;
          box-shadow: 0 0 0 3px rgba(74, 93, 76, 0.15);
        }
        .contact-form__submit {
          align-self: flex-start;
          padding: 10px 22px;
          background: #4A5D4C;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
        }
        .contact-form__submit:hover:not(:disabled) {
          background: #3A4A3C;
        }
        .contact-form__submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .contact-form__error {
          color: #B23A48;
          font-size: 0.9rem;
          margin: 0;
        }
      `})]})}export{f as default};
