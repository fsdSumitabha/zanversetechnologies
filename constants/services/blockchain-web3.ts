import type { ServiceContent } from "./types";

export const content: ServiceContent = {
  h1: "Blockchain Development Company in Dubai",
  seoTitle: "Blockchain & Smart Contracts in Dubai",
  seoDescription:
    "As a blockchain development company in Dubai, Zan Verse writes smart contracts on Ethereum and Polygon and builds dApps, DeFi and NFT platforms.",
  lead: "Companies planning a decentralized product work with Zan Verse Technologies, a blockchain development company in Dubai. We write smart contracts ready for audit, build dApps and NFT marketplaces, and review contract security.",
  sections: [
    {
      heading: "Smart contract development",
      paragraphs: [
        "A smart contract is a program that runs on a blockchain. On Ethereum, it keeps its code and data at a specific address, and interactions with it cannot be reversed. That is why writing and checking one deserve more care than ordinary application code.",
        "We write custom smart contracts in Solidity with Hardhat, on Ethereum and Polygon, for clients in Dubai and across the UAE. Each contract is written to be audited before it goes live. Code written for audit lets a reviewer follow what each function does and who is allowed to call it.",
      ],
      links: [{ label: "What is a smart contract?", href: "/guides/what-is-a-smart-contract" }],
    },
    {
      heading: "Blockchain applications and Web3 products we build",
      paragraphs: [
        "Most people never touch a smart contract directly. They use a front end in a browser or an app, and a decentralized application, or dApp, combines that front end with the contracts.",
        "The rules live on-chain, in public view. Private data usually stays off-chain, because anything written to a public blockchain can be read by anyone. Our blockchain development services cover both the contracts and the interface:",
      ],
      bullets: [
        "dApp development: the contracts and the screens, including the step where a person connects a wallet and approves a transaction.",
        "DeFi platforms: financial applications whose rules run in smart contracts rather than through a middleman.",
        "NFT marketplace development: marketplaces and other digital asset platforms on audited contracts, with media files stored on IPFS where that suits the project.",
      ],
      links: [{ label: "Web application development in Dubai", href: "/services/web-development" }],
    },
    {
      heading: "Smart contract security audit: why it comes before launch",
      paragraphs: [
        "Ethereum smart contracts are immutable by default, so a flaw in deployed code usually cannot be patched in place. The time to find it is before launch.",
        "A contract audit looks for flaws such as reentrancy, weak access control and logic that does not match the agreed rules. We offer contract security reviews and audits, and we build the tooling that helps you operate a contract after launch.",
        "No audit makes a contract risk free. Ethereum's security guidance says that audits will not catch every bug, and it lists testing, independent review and bug bounties among the measures to use. Treat an audit as one layer of checking, not as proof. Ask any reviewer, including us, whether they also wrote the code.",
      ],
      links: [{ label: "Cybersecurity services in Dubai", href: "/services/cybersecurity" }],
    },
    {
      heading: "Why blockchain projects differ in cost",
      paragraphs: [
        "The cost follows what the contracts must do and how much value they will hold. These points change it:",
      ],
      bullets: [
        "One contract with a few rules is less work than several contracts that call each other.",
        "Contracts that will hold funds justify more testing and a deeper audit.",
        "A proxy pattern allows later upgrades, but it adds complexity and can introduce flaws of its own.",
        "Every on-chain transaction pays a gas fee, and fees differ between Ethereum and Polygon, so contract design affects what the product costs to use.",
        "A dApp or marketplace needs screens, a wallet connection and often a back end that reads on-chain data.",
        "Audit scope depends on how many contracts and lines of code are reviewed, and on whether fixes are checked again.",
      ],
    },
    {
      heading: "Do you need a blockchain, and who will build it?",
      paragraphs: [
        "A blockchain suits a job where several parties need a shared record that none of them controls. If one company owns the data and everyone trusts it, a normal database is usually simpler and cheaper. Whether your product needs regulatory approval is a legal question, so take advice from a qualified lawyer before the build starts.",
        "To begin, book a free 30-minute discovery call. Within 3 to 5 business days you get a written proposal with the scope, milestones, cost breakdown and a tech-stack recommendation. Nothing is committed until you sign it.",
        "When you compare blockchain companies in Dubai and the UAE, ask who will write the contracts. Our team page names a senior blockchain developer and a blockchain developer, and you talk to the developers building your project directly.",
      ],
      links: [{ label: "Meet our blockchain developers", href: "/our-team" }],
    },
  ],
  faqs: [
    {
      question: "What is a smart contract?",
      answer:
        "A smart contract is a program that runs on a blockchain and carries out its rules when someone calls it. By default, its code cannot be edited after deployment, and transactions with it cannot be reversed. For that reason, a contract has to be tested and reviewed before it goes live.",
    },
    {
      question: "How much does NFT marketplace development cost?",
      answer:
        "NFT marketplace development has no standard price, because it depends on what the marketplace must do. Listing and transfer rules, the number of contracts, the screens people use and the depth of the audit all change the work. We quote it after a free discovery call as a line-item estimate in writing, so you can drop anything you do not need.",
    },
    {
      question: "How do you audit a smart contract?",
      answer:
        "A smart contract audit usually combines a line-by-line reading of the code against what it is meant to do, automated analysis and attempts at known attacks such as reentrancy. The report lists each flaw and how serious it is, the developer fixes it, and the fixes are checked. Ethereum's security guidance says audits will not catch every bug, so testing still matters.",
    },
    {
      question: "What is blockchain, and how is it different from Web3?",
      answer:
        "A blockchain is a shared ledger kept by a network of computers, where each new block of records is linked to the one before. Web3 is a broader term for internet services built on blockchains, with ownership spread among users rather than held by one company. A Web3 product is usually a smart contract plus an interface.",
    },
    {
      question: "Which blockchains do you build on?",
      answer:
        "We build on Ethereum and Polygon. Contracts are written in Solidity with Hardhat, and Polygon's compatibility with the Ethereum Virtual Machine means the same language works on both. The choice depends on transaction fees and on where your users already are, and your written proposal includes a tech-stack recommendation.",
    },
    {
      question: "Can a smart contract be changed after it goes live?",
      answer:
        "Not directly. Code deployed on Ethereum cannot be edited, which is why contracts are audited before launch. An upgrade pattern, such as a proxy that points to a new logic contract, lets behaviour change later, but it adds complexity and asks users to trust whoever controls the upgrade.",
    },
  ],
  sources: [
    {
      label: "ethereum.org: Introduction to smart contracts",
      href: "https://ethereum.org/developers/docs/smart-contracts/",
    },
    {
      label: "ethereum.org: Smart contract security",
      href: "https://ethereum.org/developers/docs/smart-contracts/security/",
    },
    {
      label: "ethereum.org: Upgrading smart contracts",
      href: "https://ethereum.org/developers/docs/smart-contracts/upgrading/",
    },
  ],
};
