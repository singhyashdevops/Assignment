# 🛒 Data-Heavy E-Commerce Frontend (Next.js)

## 📖 Project Overview
This isn't just another shopping site; it’s a **high-performance discovery engine**. The core challenge was to build a system that feels "instant" while handling massive amounts of product data, complex filtering, and real-time state synchronization.

I built this using **Next.js** (App Router) with a focus on **Headless Architecture**. Every interaction—from searching to toggling a layout—is optimized for speed and user intuition.

### 1. The "Single Source of Truth" (URL State)
Most developers store filters in a hidden state. I chose to store them in the **URL**. 
* **Why?** If you find a perfect list of "Laptops under $1000 with 4 stars," you can copy the link and send it to a friend. When they open it, they see exactly what you see. It also makes the "Back" button on your browser work perfectly.

### 2. The "Brain" (Custom Hooks & Utils)
I separated the math and the fetching into a custom hook. This keeps the main file clean.
* **Debouncing:** I implemented a 500ms delay on search. This means the app waits for you to finish typing before hitting the server. It saves battery for the user and bandwidth for the server.
* **AbortController:** If you click five categories in one second, It "kill" the previous four requests. Only the last click matters. This prevents the UI from flickering with old data.

### 3. Product Comparison Engine (The Extra Mile)
I added a **Product Comparison View**. It’s a complex feature where you can pick up to 4 items.
* **The Logic:** I used a "buffer" state. When you check a box on a product card, it adds that item to a floating drawer. 
* **The UI:** I built a dynamic table that compares prices and ratings side-by-side. It’s sticky, so it stays at the bottom while you keep shopping.

## 🧩 Key Features

### 🚀 Performance
* **Infinite Scroll:** Using the `Intersection Observer API`. Instead of clicking "Next Page," the app just knows when you are near the bottom and silently loads more products.
* **Skeleton Loaders:** No "Loading..." text. I built custom grey boxes that look like the products so the screen doesn't jump around when data arrives (Zero Layout Shift).

### 🎛️ Advanced Filtering
* **Hybrid Pass:** The app is smart. It asks the server for the big category list, but handles the fine-tuning (like sorting by price or rating) on the user's device for instant results.
* **Grid/List Toggle:** Switch between a visual gallery and a detailed list without a single page reload.

## 📂 Project Structure
I kept the folder structure clean so any engineer can jump in and understand it:

```plaintext
├── /app
│   ├── /components
│   │   ├── FilterSidebar.tsx  # The navigation and filter controls
│   │   ├── ComparisonDrawer.tsx # The sticky comparison matrix
│   │   ├── ProductCard.tsx    # Memoized component for individual items
│   │   └── Skeleton.tsx       # Content placeholders for loading states
│   ├── /hooks
│   │   └── useProducts.ts     # The "Engine" (API calls & scroll logic)
│   ├── /utils
│   │   ├── productUtils.ts    # Pure logic (sorting, formatting names)
│   │   └── fetcher.ts         # Data fetching wrapper with Abort signals
│   └── HomeClient.tsx         # The Orchestrator (bringing it all together)
🛠️ Technical Choices (The Stack)
Next.js 15: Chosen for its hybrid rendering (SSR/CSR).

Tailwind CSS: I used a custom "Amazon" palette (#febd69 and #131921) to give it a professional, marketplace feel.

No External State (Redux/Zustand): I purposely avoided these. I wanted to prove that with useSearchParams and native React hooks, you can build a faster, lighter app without the "bloat" of big libraries.

### 🚀 How to Run Locally
# Clone the repo:
git clone <link>

Install the goods:
npm install

run:
npm run dev
