/**
 * Policy content for the public site.
 *
 * ⚠️ These are drafts, not legal advice. They were written to describe how
 * this platform actually behaves, which is the part engineering can get
 * right. Everything inside [[ ]] is a placeholder that must be filled in
 * with real company details, and the whole set must be reviewed by a lawyer
 * who knows Indian payments regulation before launch.
 *
 * In particular: the regulatory status statement, grievance timelines and
 * the governing-law clause carry real obligations and must not be guessed at.
 */

export const LEGAL_PLACEHOLDER_PATTERN = /\[\[(.+?)\]\]/g

export interface LegalSection {
  heading: string
  /** Paragraphs of prose. */
  body?: string[]
  /** Bulleted points rendered after the prose. */
  bullets?: string[]
}

export interface LegalDocument {
  slug: string
  title: string
  lede: string
  updated: string
  /** Shown in a callout above the content when the document is still a draft. */
  draftNotice?: string
  sections: LegalSection[]
}

const UPDATED = "21 November 2026"

const DRAFT_NOTICE =
  "This document is a working draft. Items shown in brackets are pending confirmation, and the final version will be published before the platform accepts live customer funds."

export const termsDocument: LegalDocument = {
  slug: "terms",
  title: "Terms & Conditions",
  lede: "The agreement between you and Nexpro Paytech when you use this platform. Please read it before opening an account.",
  updated: UPDATED,
  draftNotice: DRAFT_NOTICE,
  sections: [
    {
      heading: "1. Who these terms are between",
      body: [
        "These terms form an agreement between you and [[Nexpro Paytech legal entity name]], a company incorporated in India under CIN [[CIN]], with its registered office at [[registered office address]] (“Nexpro Paytech”, “we”, “us”).",
        "They apply whenever you access this website, create an account, or use any service we provide. If you do not accept them, please do not use the platform.",
        "Where you use the platform on behalf of a business, you confirm you are authorised to accept these terms for that business, and “you” means that business.",
      ],
    },
    {
      heading: "2. Definitions",
      bullets: [
        "“Account” — the account you hold with us, identified by your registered email and mobile number.",
        "“Wallet” — the balance held in your Account, calculated from the ledger entries recorded against it.",
        "“Funding Request” — your instruction to add money to your Wallet by a supported method.",
        "“Services” — the features listed on our Services page that are marked as available.",
        "“KYC” — the identity verification we are required to perform before you can transact.",
        "“Applicable Law” — Indian law, including directions issued by the Reserve Bank of India and any payment-system regulations that apply to us.",
      ],
    },
    {
      heading: "3. Eligibility",
      body: [
        "You must be at least 18 years old and legally capable of entering a contract. You must use your own identity and your own payment instruments — opening an account for someone else, or in a false name, is a breach of these terms.",
        "We may decline to open an account, or close one, where we are required to by Applicable Law or where we reasonably believe the account is being misused.",
      ],
    },
    {
      heading: "4. Your account and verification",
      body: [
        "You must complete KYC before you can fund your Wallet. We will ask for identity and address documents and bank account details, and a member of our team reviews them. We may ask for further information, and we may decline a submission.",
        "You are responsible for keeping your password and access to your registered email and mobile secure. Tell us immediately if you believe someone else has access to your Account.",
      ],
      bullets: [
        "Keep your contact details current — we use them for security notifications.",
        "Do not share your credentials, including with anyone claiming to be from Nexpro Paytech.",
        "We will never ask you for your password, an OTP, or your full card number.",
      ],
    },
    {
      heading: "5. Your Wallet",
      body: [
        "Your Wallet balance is derived from an append-only ledger. Every change is recorded as an entry explaining what happened, and those entries are not edited or deleted afterwards.",
        "Money is credited to your Wallet only once the corresponding payment is confirmed. For card payments, that means confirmation from the payment provider. For UPI and bank transfers, it means our Operations team has verified your payment against the evidence you supplied.",
        "We do not pay interest on Wallet balances. A Wallet is a facility for using our Services, not a deposit account, and we are not a bank.",
      ],
    },
    {
      heading: "6. Funding Requests",
      body: [
        "When you submit a Funding Request you authorise us to process it on the terms shown to you at the time, including the fee.",
        "We review Funding Requests before approving them. A request may be approved, rejected, or returned to you for more information. We will tell you which, and why.",
        "If a request is rejected, no amount is credited to your Wallet. Where you have already paid us and the request is rejected, we will return the amount to its source, subject to clause 8.",
      ],
    },
    {
      heading: "7. Fees",
      body: [
        "Fees are shown to you before you confirm a transaction, and the total you will pay is calculated and fixed on our servers — not in your browser.",
        "Current fees are set out on the relevant Service page and in your Account. We may change fees with at least [[notice period]] notice, published on this site.",
        "You are responsible for any taxes that apply to your use of the Services, including GST where applicable.",
      ],
    },
    {
      heading: "8. Refunds and reversals",
      body: [
        "Where an amount is refundable, we return it to the original payment method. The time this takes depends on your bank or card issuer and is outside our control.",
        "If we credit your Wallet in error, we may reverse that credit. We will tell you when we do and explain why.",
      ],
    },
    {
      heading: "9. How you may not use the platform",
      bullets: [
        "To launder money, finance terrorism, or evade tax or sanctions.",
        "For any transaction prohibited by Applicable Law.",
        "To impersonate another person, or to transact using payment instruments that are not yours.",
        "To probe, scan or test the security of the platform without our written permission, or to attempt to access another customer’s data.",
        "To use automated means to access the platform in a way that degrades it for others.",
      ],
      body: [
        "We may suspend or close an Account that we reasonably believe is being used this way, and we may be required to report it.",
      ],
    },
    {
      heading: "10. Service availability",
      body: [
        "We aim to keep the platform available, but we do not guarantee uninterrupted service. We may suspend access for maintenance, or where we believe doing so protects customers.",
        "Services marked “Coming soon” are not available, and nothing on this site should be read as an offer to provide them until they are launched.",
      ],
    },
    {
      heading: "11. Third parties",
      body: [
        "Some Services depend on third parties — payment providers, banks and verification partners. Where a third party causes a delay or failure, we will tell you honestly what happened and help you resolve it, but we are not responsible for their acts beyond what Applicable Law requires of us.",
      ],
    },
    {
      heading: "12. Intellectual property",
      body: [
        "The platform, its software, design and the Nexpro Paytech name and marks belong to us. You may use the platform to access the Services; you may not copy, resell or reverse-engineer it.",
      ],
    },
    {
      heading: "13. Liability",
      body: [
        "Nothing in these terms limits liability that cannot be limited under Applicable Law, including liability for fraud.",
        "Subject to that, our total liability to you for any claim is limited to [[liability cap — to be set with counsel]], and we are not liable for indirect or consequential loss, including loss of profit or business.",
      ],
    },
    {
      heading: "14. Indemnity",
      body: [
        "You agree to indemnify us against losses arising from your breach of these terms, your misuse of the platform, or your breach of Applicable Law.",
      ],
    },
    {
      heading: "15. Suspension and closure",
      body: [
        "You may close your Account at any time, once any pending transactions have settled and your Wallet balance is nil or has been withdrawn.",
        "We may suspend or close your Account where you breach these terms, where we are required to by Applicable Law, or on [[notice period]] notice without reason. We will return any remaining balance to you, less amounts you owe us, subject to any legal restriction on doing so.",
      ],
    },
    {
      heading: "16. Changes to these terms",
      body: [
        "We may update these terms. Material changes will be notified to you by email or in the platform before they take effect. Continuing to use the platform after that means you accept the updated terms.",
      ],
    },
    {
      heading: "17. Governing law and disputes",
      body: [
        "These terms are governed by Indian law. Before any formal proceedings, please raise the matter through our grievance process, which is designed to resolve most issues faster than litigation would.",
        "Disputes that cannot be resolved that way are subject to [[dispute resolution mechanism and seat — to be confirmed with counsel]].",
      ],
    },
    {
      heading: "18. Contact",
      body: [
        "Questions about these terms: [[legal@domain]]. For complaints, please use the Grievance Redressal process, which has defined timelines.",
      ],
    },
  ],
}

export const privacyDocument: LegalDocument = {
  slug: "privacy",
  title: "Privacy Policy",
  lede: "What personal data we collect, why we collect it, how long we keep it, and the rights you have over it.",
  updated: UPDATED,
  draftNotice: DRAFT_NOTICE,
  sections: [
    {
      heading: "1. Who is responsible for your data",
      body: [
        "[[Nexpro Paytech legal entity name]] is the data fiduciary for the personal data described here, under the Digital Personal Data Protection Act, 2023. Our Data Protection Officer can be reached at [[dpo@domain]].",
      ],
    },
    {
      heading: "2. What we collect",
      bullets: [
        "Identity data — your name, date of birth, and the identity documents you submit for KYC.",
        "Contact data — email address, mobile number and postal address.",
        "Financial data — your bank account details and the masked identifiers of payment instruments you use. We never store full card numbers or CVVs; card details are entered on the payment provider’s own hosted page and do not reach our servers.",
        "Transaction data — the funding requests, transfers and ledger entries on your Account.",
        "Technical data — IP address, device and browser information, and security events such as sign-in attempts.",
      ],
    },
    {
      heading: "3. Why we use it",
      bullets: [
        "To provide the Services you ask for, and to operate your Wallet.",
        "To verify your identity, because we are required to before you can transact.",
        "To detect and prevent fraud, and to protect your account — this includes recording failed sign-in attempts.",
        "To meet legal and regulatory obligations, including record-keeping and reporting.",
        "To respond to your enquiries and support requests.",
      ],
      body: [
        "We do not sell your personal data. We do not use your transaction data for advertising.",
      ],
    },
    {
      heading: "4. Who we share it with",
      bullets: [
        "Payment providers and banks, to the extent needed to complete a transaction you asked for.",
        "Verification partners, to check the identity and account details you provide.",
        "Regulators, law enforcement and courts, where we are legally required to.",
        "Service providers who host or support the platform, under contracts that restrict what they may do with it.",
      ],
    },
    {
      heading: "5. How long we keep it",
      body: [
        "We keep KYC records and transaction data for [[retention period]] after your Account closes, because payments regulation requires us to. Technical and security logs are kept for a shorter period.",
        "When a retention period ends, we delete the data or anonymise it so it can no longer identify you.",
      ],
    },
    {
      heading: "6. How we protect it",
      bullets: [
        "Passwords are hashed with Argon2id. We cannot read your password, and neither can anyone who obtains our database.",
        "Identity documents are stored outside the public web path and served only to you and the reviewer handling your case.",
        "Access to customer data is limited by role and recorded in an audit log.",
        "Sessions end automatically after a period of inactivity, enforced on our servers rather than only in your browser.",
      ],
      body: [
        "No system is perfectly secure. If a breach affects your personal data, we will notify you and the Data Protection Board as the law requires.",
      ],
    },
    {
      heading: "7. Your rights",
      bullets: [
        "Access the personal data we hold about you.",
        "Correct it if it is wrong or incomplete.",
        "Ask us to erase it, where no legal obligation requires us to keep it.",
        "Withdraw consent where our use of the data relies on consent.",
        "Nominate someone to exercise these rights if you are unable to.",
        "Complain to the Data Protection Board if you are not satisfied with our response.",
      ],
      body: [
        "To exercise any of these, contact [[privacy@domain]]. We respond within [[response period]].",
      ],
    },
    {
      heading: "8. Children",
      body: [
        "The platform is not for anyone under 18, and we do not knowingly collect data from children. If we learn that we have, we will delete it.",
      ],
    },
    {
      heading: "9. Changes",
      body: [
        "If we change this policy we will publish the updated version here with a new date, and tell you directly if the change materially affects you.",
      ],
    },
  ],
}

export const cookieDocument: LegalDocument = {
  slug: "cookies",
  title: "Cookie Notice",
  lede: "What we store in your browser, what each thing is for, and how to control it.",
  updated: UPDATED,
  sections: [
    {
      heading: "1. What cookies are",
      body: [
        "Cookies are small files a website stores in your browser. Similar technologies — local storage and session storage — do much the same thing. This notice covers all of them.",
      ],
    },
    {
      heading: "2. What we use, and why",
      bullets: [
        "Strictly necessary — the session cookie that keeps you signed in. It is marked HttpOnly, so scripts on the page cannot read it, and it is restricted to the sign-in endpoints. Without it you cannot stay signed in.",
        "Preference — small values remembering choices such as whether you have hidden your balance on the dashboard. These stay in your browser and are never sent to us.",
        "We do not use advertising or cross-site tracking cookies.",
      ],
    },
    {
      heading: "3. Managing cookies",
      body: [
        "You can clear or block cookies in your browser settings. Blocking the strictly necessary cookie will stop you from signing in, because it is what carries your session.",
        "Clearing site data also clears your preferences, which simply resets them to their defaults.",
      ],
    },
    {
      heading: "4. Third parties",
      body: [
        "When you pay by card, the payment is completed on the provider’s own hosted page, which sets its own cookies under its own policy. We do not control those, and we do not receive your card details.",
      ],
    },
    {
      heading: "5. Changes",
      body: [
        "If we add a new category of cookie — analytics, for example — we will update this notice and ask for your consent first where the law requires it.",
      ],
    },
  ],
}

export const governanceDocument: LegalDocument = {
  slug: "governance",
  title: "Governance",
  lede: "How decisions get made here, who is accountable for them, and the controls that apply regardless of who is in the room.",
  updated: UPDATED,
  sections: [
    {
      heading: "1. Accountability",
      body: [
        "Responsibility for the platform sits with named individuals, not with a committee in the abstract. Decisions that affect customer money — fee changes, approval thresholds, who can authorise a credit — have a named owner and are recorded.",
      ],
    },
    {
      heading: "2. Separation of duties",
      body: [
        "The person who submits a funding request is never the person who approves it. Operations review customer requests; administrators configure the platform; no single role can both move money and alter the rules governing how money moves.",
        "Privileged accounts are created deliberately by an administrator with server access. There is no way to register as Operations or as an administrator from the public sign-up page.",
      ],
    },
    {
      heading: "3. Auditability",
      body: [
        "Balances are derived from an append-only ledger rather than stored as a number someone can edit. Approvals, rejections and configuration changes are written to an audit log that records who did what and when.",
        "This is what lets us answer “what happened to this payment?” with evidence rather than recollection.",
      ],
    },
    {
      heading: "4. Risk management",
      bullets: [
        "Limits on transaction size and velocity, configurable and enforced on the server.",
        "Identity verification before any customer can move money.",
        "Rate limiting and account lockout to blunt automated attacks on sign-in.",
        "A configuration that refuses to start rather than run in an unsafe state.",
      ],
    },
    {
      heading: "5. Regulatory posture",
      body: [
        "Several services on our roadmap are regulated activities requiring an authorisation or a licensed partner. Our position is that these launch when that is in place and not before, even where a technical integration would be possible sooner.",
        "Our current regulatory status is [[regulatory status statement — to be confirmed with counsel]].",
      ],
    },
    {
      heading: "6. Reporting a concern",
      body: [
        "If you believe something here is wrong — a security weakness, a control that is not working, or conduct that falls short — tell us at [[security@domain]]. We would rather hear it from you than not hear it.",
        "We do not pursue people who report security issues to us in good faith and give us a reasonable chance to fix them.",
      ],
    },
  ],
}

export const grievanceDocument: LegalDocument = {
  slug: "grievance",
  title: "Grievance Redressal",
  lede: "If something has gone wrong, this is how to get it looked at — and what to do if our answer does not satisfy you.",
  updated: UPDATED,
  draftNotice: DRAFT_NOTICE,
  sections: [
    {
      heading: "Level 1 — Customer support",
      body: [
        "Raise your issue through the support section of your account, or email [[support@domain]]. You will receive an acknowledgement with a reference number, and a response within [[L1 response time]].",
        "Please include the reference number of the transaction concerned — it makes the answer faster and more specific.",
      ],
    },
    {
      heading: "Level 2 — Grievance Officer",
      body: [
        "If Level 1 has not resolved your issue, or you have not had a reply in time, escalate to our Grievance Officer:",
      ],
      bullets: [
        "Name: [[Grievance Officer name]]",
        "Email: [[grievance@domain]]",
        "Phone: [[phone]]",
        "Address: [[registered office address]]",
        "Response time: [[L2 response time]]",
      ],
    },
    {
      heading: "Level 3 — Nodal Officer",
      body: [
        "Unresolved matters escalate to our Nodal Officer, [[Nodal Officer name]], at [[nodal@domain]]. They will review the case independently of the team that handled it.",
      ],
    },
    {
      heading: "Level 4 — External escalation",
      body: [
        "If you remain dissatisfied after our internal process, you may approach the Reserve Bank of India’s Ombudsman under the Reserve Bank — Integrated Ombudsman Scheme, 2021, at [[escalation details — to be confirmed with counsel]].",
        "You can escalate externally once we have had 30 days to respond, or sooner if we reject your complaint outright.",
      ],
    },
    {
      heading: "What we commit to",
      bullets: [
        "An acknowledgement with a reference number for every complaint.",
        "A named person responsible for your case, not a queue.",
        "A plain explanation of what happened, including when the fault was ours.",
        "A record of the complaint and its outcome, retained as our obligations require.",
      ],
    },
  ],
}

export const legalDocuments: LegalDocument[] = [
  termsDocument,
  privacyDocument,
  cookieDocument,
  governanceDocument,
  grievanceDocument,
]
