# User Flows

### Content Discovery & Reading

**User Goal:** Find and read articles about trading strategies or market analysis

**Entry Points:**
- Homepage hero section
- Direct category navigation
- Search results
- Social media shares

**Success Criteria:** User finds relevant content and completes reading with engagement (like, comment, share)

#### Flow Diagram:
```mermaid
graph TD
    A[Landing on Homepage] --> B{Authenticated?}
    B -->|Yes| C[Personalized Feed]
    B -->|No| D[Featured Posts]
    C --> E[Browse Categories]
    D --> E
    E --> F[Select Category/Tag]
    F --> G[Post Listing]
    G --> H[Filter/Sort Options]
    H --> I[Select Post]
    I --> J[Post Detail Page]
    J --> K[Reading Experience]
    K --> L{Engaged?}
    L -->|Yes| M[Like/Comment/Share]
    L -->|No| N[Return to Listing]
    M --> O[Related Posts Suggestions]
    N --> O
    O --> P[Continue Discovery]
```

#### Edge Cases & Error Handling:
- Content paywall for premium articles → Clear upgrade CTA
- Broken images/charts → Fallback placeholders with retry options
- Slow loading → Progressive loading with skeleton screens
- Mobile reading → Responsive typography and touch-optimized controls

### Community Q&A Interaction

**User Goal:** Ask questions about trading strategy and receive answers from community

**Entry Points:**
- Community section from main nav
- "Ask Question" CTA on post pages
- Q&A sidebar recommendations

**Success Criteria:** Question is posted successfully and receives at least 1 quality answer

#### Flow Diagram:
```mermaid
graph TD
    A[Access Community] --> B{Authenticated?}
    B -->|No| C[Login/Register Prompt]
    B -->|Yes| D[Q&A Dashboard]
    C --> E[Complete Auth]
    E --> D
    D --> F[Browse Questions]
    F --> G{Found Similar?}
    G -->|Yes| H[Engage with Existing]
    G -->|No| I[Ask New Question]
    I --> J[Question Composer]
    J --> K[Add Tags/Category]
    K --> L[Preview & Submit]
    L --> M[Question Published]
    M --> N[Notification Setup]
    N --> O[Monitor Responses]
    O --> P[Accept Best Answer]
```

#### Edge Cases & Error Handling:
- Duplicate questions → Suggest similar existing questions
- Insufficient detail → Inline guidance for better questions
- Spam prevention → Rate limiting and community moderation
- No responses → Automated follow-up suggestions
