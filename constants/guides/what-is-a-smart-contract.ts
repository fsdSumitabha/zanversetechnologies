import type { Guide } from "./types";

export const guide: Guide = {
  slug: "what-is-a-smart-contract",
  title: "What is a smart contract, and why audit it?",
  seoTitle: "What Is a Smart Contract Audit?",
  seoDescription:
    "A smart contract is a program on a blockchain that is hard to change once live. What an audit checks, what it cannot promise and how to prepare for one.",
  lead: "A smart contract is a program that runs on a blockchain and enforces its rules through code. You audit it because deployed code usually cannot be patched and stolen assets are mostly unrecoverable, though an audit cannot promise the code is safe.",
  summary:
    "What a smart contract is, why blockchain code is hard to change, common flaws, and what an audit can and cannot promise.",
  published: "2026-11-05",
  updated: "2026-11-05",
  sections: [
    {
      heading: "What is a smart contract?",
      paragraphs: [
        "A smart contract is a program that runs on a blockchain such as Ethereum. It is a collection of code and data stored at a specific address on the chain. Once deployed, it runs as programmed, and people use it by sending transactions that call its functions.",
        "The comparison ethereum.org uses is a vending machine. The logic is built in, so the right inputs produce a set output with no attendant involved.",
        "The name can mislead. A smart contract is software. Like a regular contract it can define rules, but it enforces them automatically through code, and it does what that code says, including any mistakes in it.",
        "Smart contracts often manage valuable financial assets, so small programming errors can lead to large losses.",
      ],
    },
    {
      heading: "Why is code on a blockchain hard to change?",
      paragraphs: [
        "Because these programs are immutable by design, meaning fixed once deployed. Ordinary software can be patched on its server. On Ethereum, you cannot change a program deployed to an address, smart contracts cannot be deleted by default, and interactions with them are irreversible.",
        "The code is also exposed. OpenZeppelin, a smart contract security company, points out that anyone can send a transaction to your contract with any input, and that all its code and state are publicly accessible. If assets are stolen, ethereum.org says they are extremely difficult to track and mostly unrecoverable.",
        "Upgrade patterns exist, but they add their own risks. A popular one is the proxy: users call a fixed contract that forwards their calls to a separate logic contract, which can be replaced.",
        "Users must then trust whoever controls the upgrade, and OpenZeppelin warns that an attacker who gets hold of the upgrade admin account can change any contract in the system. An upgrade can also only fix a flaw after someone has found it, and if an attacker finds it first, the contract is at risk.",
      ],
    },
    {
      heading: "What are the common smart contract flaws?",
      paragraphs: [
        "These are the kinds of flaw that ethereum.org and OpenZeppelin tell developers to defend against. A smart contract security audit looks for them, along with poor development practices.",
      ],
      bullets: [
        "Weak access control: sensitive functions are open to anyone, or all control rests with one account whose keys can be stolen.",
        "Reentrancy: a malicious contract calls back into a vulnerable contract before the first call has finished, for example to withdraw the same balance several times.",
        "Integer overflow and underflow: an arithmetic result falls outside the range a number can hold and rolls over, changing the contract's state in unexpected ways. From version 0.8.0 the Solidity compiler guards against this. Contracts compiled with older versions need their own checks or a library.",
        "Oracle manipulation: a contract cannot fetch outside data by itself, so it relies on an oracle, a tool that makes that data available on chain. If the oracle is corrupted or its price can be manipulated, the contract acts on bad inputs.",
        "Logic errors: functions can be called in any order or combined in one transaction, with outcomes the authors did not intend.",
        "Upgrade flaws: a new version can add new vulnerabilities, and the upgrade itself can go wrong.",
      ],
    },
    {
      heading: "What does a smart contract audit do, and what does it not promise?",
      paragraphs: [
        "A smart contract audit is an independent review of the code by people experienced at finding security flaws. It usually includes testing, sometimes formal verification, and a manual review of the whole codebase. Formal verification means checking a mathematical model of the code against a formal specification of its properties.",
        "The ethereum.org docs describe audits as mostly an additional round of review, which can catch issues developers missed during development and testing.",
        "Findings can change your launch plan. OpenZeppelin says code with systematic critical issues may need to go back to development, and that an audit with many critical issues can lead to a recommendation for another audit.",
        "An audit does not make code safe for certain. In particular, it does not promise these things:",
      ],
      bullets: [
        "That every bug was found. The ethereum.org docs say audits won't catch every bug and warn against treating them as a silver bullet. OpenZeppelin, which itself offers audits, says they do not ensure the absence of bugs.",
        "That a breach cannot happen. OpenZeppelin notes that security breaches persist even in systems that have gone through multiple audits.",
        "That anything outside the scope is safe. The review applies to the agreed scope at one version of the code, so later changes and dependencies left out were not checked.",
        "The same quality from every review. Audits depend heavily on people reading code, and OpenZeppelin says how well that works can vary greatly with the condition of the codebase.",
        "That you can skip other safeguards. The ethereum.org docs say extensive auditing and testing cannot possibly discover all bugs, so plan for failure with monitoring and an emergency stop, which blocks calls to vulnerable functions.",
      ],
      links: [
        { label: "What is VAPT? Security testing for websites and apps", href: "/guides/what-is-vapt" },
      ],
    },
    {
      heading: "How do you prepare for a smart contract audit?",
      paragraphs: [
        "Give the auditors finished, tested and documented code with a fixed scope. OpenZeppelin warns that poor documentation leaves auditors spending more time understanding the code than trying to break it.",
      ],
      bullets: [
        "Write a specification. Define what each function should do and the rules that must always hold, so reviewers can check the code against its purpose.",
        "Test first. Cover normal use, the interactions between contracts, and inputs that should fail. Measure code coverage, the share of the code your tests run, knowing that even 100% coverage can miss edge cases.",
        "Document the code. Comment every contract and function in the NatSpec format, add diagrams, and write down your assumptions and threats.",
        "Reuse tested libraries. The ethereum.org docs suggest existing libraries such as OpenZeppelin Contracts where possible, because they have been extensively audited and tested. Put any unaudited dependencies in the audit scope.",
        "Fix the scope early. OpenZeppelin advises defining it at least two weeks in advance and sticking to it.",
        "Freeze the code. Give the auditors one saved version, called a frozen commit, and leave it untouched until the fixes are reviewed.",
        "Brief the auditors. Tell them how the system works, its edge cases and integrations, and which parts worry you, then answer their questions promptly.",
        "Plan the launch. Test the deployment scripts, protect admin accounts with a multi-signature wallet, which needs several approvals for each action, and set up monitoring and an incident response plan.",
      ],
    },
    {
      heading: "How can Zan Verse help with smart contracts?",
      paragraphs: [
        "Zan Verse Technologies, an IT company based in Dubai, builds custom smart contracts on Ethereum and Polygon, written to be audited before they go live, and offers contract security reviews and audits. Ask any reviewer, including us, what was in scope and whether they also wrote the code. To start, book a free 30-minute discovery call, and a written proposal follows within 3 to 5 business days.",
      ],
      links: [
        { label: "Blockchain and Web3 development: smart contracts, dApps and security audits", href: "/services/blockchain-web3" },
        { label: "Cybersecurity services, including contract security", href: "/services/cybersecurity" },
      ],
    },
  ],
  faqs: [
    {
      question: "Can a smart contract be changed after it is deployed?",
      answer:
        "Not directly. The code at a deployed address cannot be changed, though developers can plan ahead with an upgrade pattern, such as a proxy contract that points to replaceable logic. That adds risk, because users must trust whoever controls upgrades, and a compromised admin account could change the system.",
    },
    {
      question: "Does an audit make a smart contract safe?",
      answer:
        "No. An audit makes it more likely that flaws are found before launch, but it cannot prove that none remain. Both ethereum.org and OpenZeppelin say so plainly, and breaches have happened in systems audited more than once. Keep testing, monitoring and an incident plan alongside it.",
    },
    {
      question: "How is a smart contract audited?",
      answer:
        "Auditors usually read the whole codebase by hand and add testing, and sometimes formal verification. They report the issues they find, rated by severity, and your team fixes them. The auditors then review the fixes. How well this works depends partly on how clear and well tested the code is beforehand.",
    },
    {
      question: "How much does a smart contract audit cost?",
      answer:
        "There is no fixed price, because the cost follows the work involved. The main drivers are how much code is in scope, how complex it is, how many outside contracts it connects to, and how well it is tested and documented. Ask for a written proposal once you can share the code.",
    },
    {
      question: "What is the difference between an audit and a bug bounty?",
      answer:
        "An audit is a review by a hired team of auditors. A bug bounty offers a financial reward to anyone who finds a flaw and reports it, so it is open to the wider developer and security community. The ethereum.org docs present both as ways of getting others to analyze your contracts.",
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
    {
      label: "ethereum.org: Testing smart contracts",
      href: "https://ethereum.org/developers/docs/smart-contracts/testing/",
    },
    {
      label: "OpenZeppelin documentation: Preparing for mainnet",
      href: "https://docs.openzeppelin.com/contracts/5.x/learn/preparing-for-mainnet",
    },
    {
      label: "OpenZeppelin: Security Audit Readiness Guide",
      href: "https://www.openzeppelin.com/readiness-guide",
    },
  ],
  services: [{ label: "Blockchain & Web3", href: "/services/blockchain-web3" }],
};
