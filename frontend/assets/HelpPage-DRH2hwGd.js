import{j as e,L as i,r as o}from"./index-BX2naJQ4.js";import{P as r}from"./PageLayout-BEydSntf.js";import"./AppNav-PvAaVQTA.js";import"./selectionStore-BvHbgax4.js";const c=[{id:"getting-started",title:"Getting started",questions:[{q:"What is ReViva?",a:e.jsx(e.Fragment,{children:e.jsx("p",{children:"ReViva is an AI examiner that runs voice-based mock interviews for surgical trainees preparing for the UK ST3 specialty selection. You pick a scenario, the AI conducts a 5–8 minute interview, and at the end gives you a spoken debrief and a score."})})},{q:"Do I need a subscription to try it?",a:e.jsx("p",{children:"No. Several scenarios are free for any signed-in user — including a clinical case, a “call the boss” phone consult, a consent station, and a structured-interview station. Subscriptions unlock the full library across all four station types."})},{q:"What equipment do I need?",a:e.jsx("p",{children:"A laptop or desktop with a working microphone, a modern browser (Chrome, Edge, or Safari are tested), and a stable internet connection. Headphones are strongly recommended so the AI doesn’t pick up its own voice."})}]},{id:"using-the-app",title:"Using the app",questions:[{q:"How do I interrupt the AI examiner?",a:e.jsx("p",{children:"Just start talking. The AI uses streaming speech recognition and will stop and listen as soon as it detects you speaking — same as a real examiner."})},{q:"Can I retry a scenario at a different difficulty?",a:e.jsx("p",{children:"Yes. Each scenario has Easy, Medium, and Strict examiner personalities. From the scenario selection screen you can change difficulty before starting."})},{q:"What does the score mean?",a:e.jsx("p",{children:"We grade from 0 to 5: 0 (Unsafe), 1 (Poor), 2 (Borderline), 3 (Pass), 4 (Strong), 5 (Outstanding). The score is calibrated to match an ST3 selection panel’s station score, not a university exam mark."})}]},{id:"account-and-billing",title:"Account &amp; billing",questions:[{q:"How do I cancel my subscription?",a:e.jsxs("p",{children:["Go to your ",e.jsx(i,{to:"/profile",children:"profile page"})," and click “Manage subscription”. This opens the Stripe customer portal where you can cancel, change plan, or update card details. Cancellation takes effect at the end of your current billing cycle."]})},{q:"Can I get a refund?",a:e.jsxs("p",{children:["See section 5 of our ",e.jsx(i,{to:"/terms",children:"Terms of Service"})," for the full refund policy. In short: UK consumer law gives you a 14-day cancellation right for digital services you haven’t yet accessed."]})},{q:"How do I delete my account?",a:e.jsxs("p",{children:["From your ",e.jsx(i,{to:"/profile",children:"profile page"}),", scroll to the “Delete account” section. This removes all your personal data, session transcripts, and cancels any active subscription. ",e.jsx("em",{children:"[Pending implementation — see the launch backlog.]"})]})}]},{id:"privacy-and-data",title:"Privacy &amp; data",questions:[{q:"Is my voice recorded?",a:e.jsxs("p",{children:["Your voice is streamed in real time to our speech-to-text provider (Deepgram). Only the resulting text transcript is stored against your session history — we don’t keep the audio. Full details in our ",e.jsx(i,{to:"/privacy",children:"Privacy Policy"}),"."]})},{q:"Can I download my session transcripts?",a:e.jsxs("p",{children:["Yes — from the profile page you can export all your data (transcripts, scores, account information) in a single download."," ",e.jsx("em",{children:"[Pending implementation — see the launch backlog.]"})]})}]},{id:"troubleshooting",title:"Troubleshooting",questions:[{q:"The AI didn’t respond to me &mdash; what happened?",a:e.jsxs("p",{children:["Most often this is a microphone permission issue or a network blip. Check that your browser has microphone access for"," ",e.jsx("code",{children:"reviva.live"}),", and reload the page if needed. If it keeps happening, please email us at"," ",e.jsx("a",{href:"mailto:support@reviva.live",children:"support@reviva.live"})," with the time of the issue and we can look at the server logs."]})},{q:"Audio is cutting out / I can’t hear the examiner",a:e.jsx("p",{children:"Check your browser’s audio output device and your system volume. Some Bluetooth headsets have known compatibility issues with browser audio streams — try wired headphones or the laptop speakers as a test."})}]}];function l({q:a,a:s}){const[t,n]=o.useState(!1);return e.jsxs("div",{className:"faq-item",children:[e.jsxs("button",{className:`faq-item__question ${t?"is-open":""}`,onClick:()=>n(!t),"aria-expanded":t,children:[e.jsx("span",{children:a}),e.jsx("span",{className:"faq-item__chevron","aria-hidden":"true",children:t?"−":"+"})]}),t&&e.jsx("div",{className:"faq-item__answer",children:s})]})}function m(){return e.jsxs(r,{title:"Help & FAQ",lastUpdated:null,children:[e.jsxs("p",{children:["Most questions are covered below. If you can’t find what you’re after, drop us a line on the"," ",e.jsx(i,{to:"/contact",children:"contact page"}),"."]}),c.map(a=>e.jsxs("section",{className:"faq-group",children:[e.jsx("h2",{dangerouslySetInnerHTML:{__html:a.title}}),a.questions.map((s,t)=>e.jsx(l,{q:s.q,a:s.a},`${a.id}-${t}`))]},a.id)),e.jsx("style",{children:`
        .faq-group { margin-bottom: 24px; }
        .faq-item {
          border-bottom: 1px solid rgba(74, 93, 76, 0.12);
        }
        .faq-item__question {
          width: 100%;
          background: none;
          border: none;
          padding: 14px 0;
          font-size: 1rem;
          font-weight: 500;
          color: #2A2620;
          font-family: inherit;
          text-align: left;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          transition: color 0.15s;
        }
        .faq-item__question:hover { color: #4A5D4C; }
        .faq-item__chevron {
          font-size: 1.4rem;
          color: rgba(74, 93, 76, 0.6);
          font-weight: 300;
          line-height: 1;
          width: 20px;
          text-align: center;
        }
        .faq-item__answer {
          padding: 0 0 16px 4px;
          color: rgba(42, 38, 32, 0.9);
        }
        .faq-item__answer p:last-child { margin-bottom: 0; }
      `})]})}export{m as default};
