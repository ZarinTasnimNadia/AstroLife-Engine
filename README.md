# AstroLife-Engine | A Space Biology Knowledge Engine <!-- omit from toc -->

**_AstroLife Engine is a dynamic web application designed to simplify decades of NASA’s bioscience research for the future of human space exploration. By leveraging NASA’s open dataset of more than 600 space biology publications, AstroLife makes it easy to search, identify, and visualize key findings. The platform helps researchers, mission planners, and space enthusiasts explore insights more efficiently, enabling better understanding of how living systems adapt to space and supporting humanity’s journey to the Moon, Mars, and beyond._**

- [Live Web App](https://astro-life-engine.vercel.app/)

- [Demo Video](https://www.youtube.com/watch?v=jCUE-JdVKqg&t=1s)

## Table of Contents <!-- omit from toc -->

- [1. Team Information](#1-team-information)
- [2. Executive Summary](#2-executive-summary)
- [3. Challanges](#3-challanges)
- [4. Objectives](#4-objectives)
- [5. Target Users](#5-target-users)
- [6. Solution Overview](#6-solution-overview)
- [7. How It Works](#7-how-it-works)
- [8. Impact](#8-impact)
- [9. Conclusion](#9-conclusion)
- [10. Use Of Artificial Intelligence](#10-use-of-artificial-intelligence)
- [11. Try Our Project](#11-try-our-project)
- [12. NASA Data](#12-nasa-data)
- [13. Other References](#13-other-references)

---

## 1. Team Information

**Team Name**: Luminara

**Members**:

| Name                  | GitHub Profile                                          | Contact                     |
| --------------------- | ------------------------------------------------------- | --------------------------- |
| Ryan Ahmed            | [RyanAhmed911](https://github.com/RyanAhmed911)         | ryanahmed9110@gmail.com     |
| Nusayba Mahfuza Zaman | [Nusuwuba](https://github.com/Nusuwuba)                 | nusaybazaman3@gmail.com     |
| Raiyan Rahman         | [Raiyan465-F1](https://github.com/Raiyan465-F1)         | justanotherone465@gmail.com |                        |
| Zarin Tasnim          | [ZarinTasnimNadia](https://github.com/ZarinTasnimNadia) | zarin_nadia@yahoo.com       |
| Al-Saihan Tajvi       | [Al-Saihan](https://github.com/Al-Saihan)               | al.saihan.bafsd.5@gmail.com |

---

## 2. Executive Summary

NASA’s decades of space biology research have produced critical insights into how humans, plants, and living systems adapt to the challenges of space. Yet this knowledge, while publicly available, is dispersed across hundreds of publications and databases, making it difficult for researchers, mission planners, and policymakers to access and apply effectively.

AstroLife Engine transforms these hundreds of publications into an accessible, AI-powered dashboard, enabling researchers, mission planners, and policymakers to quickly uncover insights, identify gaps, and support safer missions to the Moon, Mars, and beyond.

---

## 3. Challanges

- **Data Accessibility**: NASA’s bioscience research is scattered across hundreds of publications and multiple databases, making it hard to access and cross-reference relevant studies.

- **Information Overload**: Researchers and mission planners face difficulty extracting actionable insights from the massive volume of experimental data.

- **Knowledge Gaps Identification**: Without a unified view, it’s challenging to pinpoint areas that require further study or replication.

- **Integration of Diverse Data**: Publications, raw datasets (OSDR), and mission metadata need to be connected coherently for meaningful analysis.

- **Usability**: Existing resources are not optimized for quick exploration or decision-making by multidisciplinary users.

---

## 4. Objectives

- **Centralize Knowledge**: Aggregate 600+ NASA space biology publications into a single accessible platform.

- **AI-Powered Summaries**: Use AI to extract key results, conclusions, and metrics from publications.

- **Visualize Connections**: Build interactive dashboards and knowledge graphs to show relationships between experiments, organisms, and outcomes.

- **Identify Gaps & Trends**: Highlight areas of scientific progress, consensus, and missing research opportunities.

- **Support Decision-Making**: Provide actionable insights for scientists, mission planners, and policy makers.

- **Promote Open Science**: Ensure full use of NASA’s open datasets while making them understandable and navigable.

---

## 5. Target Users

- **Scientists & Researchers**: Looking to generate new hypotheses or analyze cross-study trends.

- **Mission Planners & Engineers**: Seeking actionable insights for safe and efficient lunar and Martian missions.

- **Program Managers & Funders**: Evaluating research priorities, progress, and gaps for investment decisions.

- **Educators & Students**: Exploring space biology concepts for learning and outreach.

- **Global Research Community**: Anyone interested in leveraging NASA open data for innovation and discovery.

---

## 6. Solution Overview

- **Database Integration**: Uses PostgreSQL with pgvector for semantic search

- **AI Summaries**: Powered by Groq's Llama 3.3 70B model (with fallback)

- **AI Chat Assistant**: Intelligent research assistant that can answer complex questions about space biology

- **Interactive Dashboard**: Search, filter, and explore space biology publications

- **Knowledge Graph**: Visualize relationships between publications and concepts

- **Reference Linking**: Direct links to DOI and publication sources

- **Similar Article Discovery**: AI-powered recommendations for related research

---

## 7. How It Works

**Astrolife Engine unlocks NASA's space biology research through intelligent, interconnected tools.**

This powerful foundation offers multiple exploration paths: quickly filter studies with Smart Search or ask complex questions using Semantic Search; navigate connections between experiments and outcomes through our visual Knowledge Graph; identify patterns and missing links in the Analytics Dashboard; or converse naturally with our AI Assistant for instant answers supported by relevant publications. Whether you're a curious student or a seasoned researcher, Astrolife Engine delivers the precise tools needed to discover, comprehend, and connect scientific insights in moments.

**Let's Dive A Bit More**:

When you click on any research topic in the Astrolife Engine dashboard - Explore Page, the system instantly searches through NASA's entire publication database and shows you all the relevant studies.

For each publication, you can immediately see the title, author names, publication date, and a short AI-generated summary that explains the key findings in simple terms. It's like having a research librarian who instantly finds all the papers on your topic and gives you a quick, easy-to-understand summary of each one.

When you click "View Evidence" on any publication, you get the best of both worlds. Alongside the original technical abstract for experts, you see a clear AI Summary that translates the complex science into simple, everyday language.

This summary is designed specifically for non-technical audiences like students, breaking down jargon and focusing on the "so what"—explaining what the researchers discovered and why it matters for space exploration in a way that's quick and easy for anyone to understand.

To help you find exactly what you need in seconds, the Astrolife Engine provides powerful filtering and search tools. You can instantly filter publications by categories like research area, biological system, or health effect, or simply type any keyword into the search bar to find all relevant studies in a blink of an eye.

Beyond simple keyword matching, the Astrolife Engine features a powerful Semantic Search. This allows you to ask full questions in plain English, like "How does microgravity affect plant growth?" Instead of just looking for papers that contain the words "microgravity" and "plant," the AI understands the meaning and intent behind your question to find the most conceptually relevant studies, even if they use different terminology. It's like having a research expert who intuitively knows what you're looking for.

The platform also features an interactive Knowledge Graph that visually maps how different research elements connect. You can see publications, experiments, and organisms as linked nodes, revealing the hidden relationships between studies. Clicking any node instantly shows its key details and all its connections, making it easy to explore how a specific finding in one paper relates to other experiments and outcomes across the entire research landscape.

The Analytics Dashboard gives you a clear overview of research trends over time. You can explore the publication timeline to see how the field has evolved, identify trending topics through visual heatmaps, and quickly spot both research gaps and emerging areas of focus. These tools help you understand where the scientific community's attention has been—and where it might be needed next.

For instant help, you can chat directly with our AI Research Assistant. Simply ask your question in plain English, and the bot will provide a clear, accurate answer. Each response also comes with a list of related publications, giving you both a straightforward explanation and a direct path to dive deeper into the original research for more detailed exploration.

---

## 8. Impact

The AstroLife Engine is a foundational platform designed to democratize space biology by shattering data silos and integrating AI-driven analysis. It transforms raw data into accessible discovery, empowering a global community—from students to astronauts—to contribute to the era of interplanetary life. With expanded resources, we will scale its datasets, refine its analytical models, and establish key partnerships to ultimately function as the central repository—the "Wikipedia"—for space-born biology. This project transcends mere exploration; its core directive is to ensure the continuity of life itself, anywhere in the universe. This is the AstroLife Engine.

---

## 9. Conclusion

AstroLife Engine transforms these hundreds of publications into an accessible, AI-powered dashboard, enabling researchers, mission planners, and policymakers to quickly uncover insights, identify gaps, and support safer missions to the Moon, Mars, and beyond.

---

## 10. Use Of Artificial Intelligence

Our platform is engineered with cutting-edge tools that enable rapid development and intelligent functionality. The core application is built using v0, Cursor, and Trae for robust and efficient foundation development. For real-time AI interactions, we leverage Groq's API to deliver lightning-fast conversational experiences.

Throughout our development lifecycle, we utilize Cohere's API for advanced language processing capabilities and rely on ChatGPT and DeepSeek as essential coding partners for solving complex challenges and ensuring clear, comprehensive documentation. This powerful stack allows us to build smarter, faster, and more reliably.

---

## 11. Try Our Project

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (or use the provided Neon database)
- Groq API key (optional, for AI summaries)

### Setup Instructions

1. **Clone the repository**

```bash
git clone <repository-url>
cd AstroLife-Engine
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Configure environment variables**
   Create a `.env.local` file in the root directory:

```bash
# Groq API Configuration (optional - for AI summaries)
# Get your API key from: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here

# Database is already configured in the code
# If you want to use a different database, update the connection string in app/api/publications/route.ts
```

4. **Run the development server**

```bash
pnpm dev
```

5. **Open your browser**
   Navigate to `http://localhost:3000`

### Features

- **Database Integration**: Uses PostgreSQL with pgvector for semantic search
- **AI Summaries**: Powered by Groq's Llama 3.3 70B model (with fallback)
- **AI Chat Assistant**: Intelligent research assistant that can answer complex questions about space biology
- **Interactive Dashboard**: Search, filter, and explore space biology publications
- **Knowledge Graph**: Visualize relationships between publications and concepts
- **Reference Linking**: Direct links to DOI and publication sources
- **Similar Article Discovery**: AI-powered recommendations for related research

## 12. NASA Data

- [A list of 608 full-text open-access Space Biology publications](https://github.com/jgalazka/SB_publications/tree/main)
- [NASA Open Science Data Repository](https://science.nasa.gov/biological-physical/data/)

---

## 13. Other References

- Pexels - Videos and Images
- Pixabay - Videos and Images
- Mixkit - Videos and Images
- Universe By SergePavkinMusic [Background Music]
- Fonts Used in Demonstration Video
- Online PostgreSQL Database Host
