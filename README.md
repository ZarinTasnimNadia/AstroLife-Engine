# AstroLife-Engine | A Space Biology Knowledge Engine <!-- omit from toc -->

**_AstroLife Engine is a dynamic web application designed to simplify decades of NASA’s bioscience research for the future of human space exploration. By leveraging NASA’s open dataset of more than 600 space biology publications, AstroLife makes it easy to search, identify, and visualize key findings. The platform helps researchers, mission planners, and space enthusiasts explore insights more efficiently, enabling better understanding of how living systems adapt to space and supporting humanity’s journey to the Moon, Mars, and beyond._**

- [Live Web App](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

- [Demo Video](https://www.youtube.com/watch?v=dQw4w9WgXcQ)

## Table of Contents <!-- omit from toc -->

- [1. Team Information](#1-team-information)
- [2. Executive Summary](#2-executive-summary)
- [3. Challanges](#3-challanges)
- [4. Objectives](#4-objectives)
- [5. Target Users](#5-target-users)
- [6. Solution Overview](#6-solution-overview)
- [7. How It Works](#7-how-it-works)
  - [1. Data Aggregation \& AI Processing](#1-data-aggregation--ai-processing)
  - [2. Multi-Dimensional Exploration Interface](#2-multi-dimensional-exploration-interface)
    - [Intelligent Search \& Discovery](#intelligent-search--discovery)
    - [Analytics \& Trend Visualization](#analytics--trend-visualization)
    - [Knowledge Graph Navigation](#knowledge-graph-navigation)
    - [AI Research Assistant](#ai-research-assistant)
  - [3. Gap Identification Engine](#3-gap-identification-engine)
- [8. Impact](#8-impact)
  - [For Researchers](#for-researchers)
  - [For Mission Planners](#for-mission-planners)
  - [For NASA \& Policy Makers](#for-nasa--policy-makers)
  - [For the Scientific Community](#for-the-scientific-community)
  - [Quantifiable Benefits](#quantifiable-benefits)
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
| Ryan Ahmed            | [RyanAhmed911](https://github.com/RyanAhmed911)         | TBA                         |
| Nusayba Mahfuza Zaman | [Nusuwuba](https://github.com/Nusuwuba)                 | nusaybazaman3@gmail.com     |
| Raiyan Rahman         | [Raiyan465-F1](https://github.com/Raiyan465-F1)         | TBA                         |
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

- TBA

---

## 7. How It Works

- TBA

---

## 8. Impact

- TBA

---

## 9. Conclusion

- TBA

---

## 10. Use Of Artificial Intelligence

- TBA

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

- TBA
