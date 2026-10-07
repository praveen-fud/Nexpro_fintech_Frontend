// Major banks operating in India, grouped for the KYC bank selector.
export const INDIAN_BANK_GROUPS: { label: string; banks: string[] }[] = [
  {
    label: "Public sector banks",
    banks: [
      "State Bank of India", "Punjab National Bank", "Bank of Baroda", "Canara Bank", "Union Bank of India",
      "Bank of India", "Indian Bank", "Central Bank of India", "Indian Overseas Bank", "UCO Bank",
      "Bank of Maharashtra", "Punjab & Sind Bank",
    ],
  },
  {
    label: "Private sector banks",
    banks: [
      "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Mahindra Bank", "IndusInd Bank", "Yes Bank",
      "IDFC FIRST Bank", "Federal Bank", "South Indian Bank", "RBL Bank", "Bandhan Bank", "IDBI Bank",
      "Karur Vysya Bank", "City Union Bank", "Tamilnad Mercantile Bank", "CSB Bank", "DCB Bank",
      "Dhanlaxmi Bank", "Jammu & Kashmir Bank", "Karnataka Bank", "Nainital Bank",
    ],
  },
  {
    label: "Small finance & payments banks",
    banks: [
      "AU Small Finance Bank", "Equitas Small Finance Bank", "Ujjivan Small Finance Bank",
      "Jana Small Finance Bank", "Suryoday Small Finance Bank", "Utkarsh Small Finance Bank",
      "ESAF Small Finance Bank", "Capital Small Finance Bank", "Fincare Small Finance Bank",
      "North East Small Finance Bank", "Airtel Payments Bank", "India Post Payments Bank",
      "Paytm Payments Bank", "Fino Payments Bank", "Jio Payments Bank",
    ],
  },
  {
    label: "Foreign banks",
    banks: [
      "Standard Chartered Bank", "Citibank", "HSBC", "Deutsche Bank", "DBS Bank India", "Barclays Bank",
    ],
  },
  { label: "Other", banks: ["Other"] },
]

export const INDIAN_BANK_NAMES = INDIAN_BANK_GROUPS.flatMap((g) => g.banks)
