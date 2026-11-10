import type { ServiceContent } from "./types";

export const content: ServiceContent = {
  h1: "Cloud & DevOps Services in Dubai",
  seoTitle: "Cloud & DevOps Services in Dubai",
  seoDescription:
    "Cloud and DevOps services in Dubai: infrastructure on AWS, Azure and Google Cloud, CI/CD pipelines, containers and release automation, from Zan Verse.",
  lead: "For teams that release software, Zan Verse Technologies provides cloud and DevOps services in Dubai: infrastructure on AWS, Azure or Google Cloud, CI/CD pipelines, containers and automation. Releasing an update then takes fewer manual steps.",
  sections: [
    {
      heading: "What does a DevOps company in Dubai do?",
      paragraphs: [
        "Cloud work decides where your software runs, and DevOps work decides how changes reach it. AWS, Azure and Google Cloud supply the infrastructure. As a cloud services provider in the UAE, we set it up and automate the route your code takes to get there. The work covers:",
      ],
      bullets: [
        "Cloud infrastructure: servers, databases, storage and networks configured on AWS, Azure or Google Cloud. A website or smaller app may suit Vercel or Netlify, which leave far less to manage.",
        "CI/CD pipelines: an automated process that builds, tests and releases each code change.",
        "Containers: your application packaged with Docker, so that it runs the same way on a laptop, in staging and in production.",
        "Automation: infrastructure written as code with Terraform, and scripts for routine jobs, so an environment can be recreated from code rather than by hand.",
        "Monitoring: error tracking with tools such as Sentry, so a failed release does not go unnoticed.",
      ],
      links: [{ label: "Website and web app development in Dubai", href: "/services/web-development" }],
    },
    {
      heading: "CI/CD pipelines on AWS and Azure",
      paragraphs: [
        "A CI/CD pipeline is the automated route a code change takes to production. Continuous integration builds and tests each change when it is committed. Continuous deployment then publishes the version that passes, with no one copying files by hand.",
        "We set these pipelines up with tools such as GitHub Actions, for workloads on AWS, Azure or Google Cloud. Releases can then be smaller and easier to check.",
        "To judge whether a pipeline is working, look at how often you can release, how long a change takes to reach production, how often a release fails, and how quickly you recover when one does.",
      ],
    },
    {
      heading: "Containers and Kubernetes: when each one fits",
      paragraphs: [
        "Docker packages an application into a container. Kubernetes manages containers across servers: it balances traffic, restarts containers that fail and rolls out changes at a controlled rate. It does not build your application, so you still need a pipeline.",
        "Containers help many projects. Kubernetes is a narrower choice, because a cluster takes skill to run, and a product with a few services may run well on something simpler. The enterprise logistics dashboard in our portfolio, for example, uses Docker and AWS ECS.",
        "Kubernetes makes more sense when you run many services that need to scale separately. AI features add more to run, such as calls to model APIs and a vector database, and these need monitoring too.",
      ],
      links: [
        { label: "Logistics dashboard case study", href: "/portfolio" },
        { label: "AI development company in Dubai", href: "/services/ai-machine-learning" },
      ],
    },
    {
      heading: "Cloud security in Dubai: who is responsible for what",
      paragraphs: [
        "Moving to the cloud does not hand over all of your security. AWS calls this the shared responsibility model: it protects the infrastructure that runs its services, and your share depends on which services you select.",
        "Your share usually includes who can log in, how data is encrypted, how systems are configured and what is open to the internet. These settings need a review when the cloud is set up and again as it changes.",
        "Location matters too. AWS, for example, lists a Middle East (UAE) Region, and a Region close to your users can lower network latency. If a contract or a regulator limits where your data may be stored, tell us on the discovery call, and check with your legal adviser what applies to you.",
      ],
      links: [{ label: "Security audits and penetration testing in Dubai", href: "/services/cybersecurity" }],
    },
    {
      heading: "How our DevOps services in Dubai run, and how they are priced",
      paragraphs: [
        "We run this work at a fixed scope or on a retainer. A free discovery call and a written proposal come first, and you then get weekly progress updates from the people doing the work.",
        "There are two kinds of cost: the work to set things up and look after them, and the usage bill from the cloud provider. These factors change one or both:",
      ],
      bullets: [
        "A new setup is different work from tidying up servers that were configured by hand.",
        "Each service and environment adds configuration, pipeline and monitoring work.",
        "Providers charge for what you use, including compute, storage and data transfer, so traffic and data volumes matter.",
        "The less downtime you can accept, the more redundancy you pay for.",
        "A one-off setup is priced differently from ongoing work on a retainer.",
      ],
    },
  ],
  faqs: [
    {
      question: "How much do cloud and DevOps services cost?",
      answer:
        "Each job is quoted on its own, because the price follows what you run and how much of it you want looked after. The number of services, environments and pipelines all matter, and cloud usage fees are a separate running cost. Book the free 30-minute discovery call, and a written estimate follows within 3 to 5 business days.",
    },
    {
      question: "What is a CI/CD pipeline in DevOps?",
      answer:
        "A CI/CD pipeline is an automated process that takes a code change from commit to production. It builds the code, runs the tests and deploys the version that passes. Because each change is tested soon after it is committed, errors are found earlier and releases can be smaller.",
    },
    {
      question: "What is DevOps as a service?",
      answer:
        "DevOps as a service means paying an outside provider to look after your pipelines, infrastructure and monitoring, instead of hiring that skill in-house. Our closest offer is a monthly retainer, which can cover uptime monitoring, security patching and performance optimization. Pricing is quoted against the scope of the work, such as how many systems are covered.",
    },
    {
      question: "AWS, Azure or Google Cloud: which should we choose?",
      answer:
        "Choose the provider that fits the systems you already use, the services your application needs and where your data has to be stored. We work with all three, and with Vercel and Netlify for projects that need less infrastructure. We recommend a stack for your project in the written proposal.",
    },
    {
      question: "Do you offer cloud infrastructure management after launch?",
      answer:
        "Yes, through post-launch support and then a retainer. Every project includes three months of post-launch support, covering bug fixes, minor adjustments and performance monitoring. After that, a monthly retainer can cover uptime monitoring, security patching and performance optimization, so you can choose to keep that work with us or hand it to your own team.",
    },
  ],
  sources: [
    {
      label: "AWS: Shared Responsibility Model",
      href: "https://aws.amazon.com/compliance/shared-responsibility-model/",
    },
    {
      label: "AWS documentation: AWS Regions",
      href: "https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions.html",
    },
    {
      label: "Kubernetes documentation: Overview",
      href: "https://kubernetes.io/docs/concepts/overview/",
    },
  ],
};
