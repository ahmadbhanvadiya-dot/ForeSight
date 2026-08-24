
# ForeSight

### Predict. Explain. Act.

ForeSight is an intelligent operational-risk and workforce-routing platform that helps organizations detect potentially delayed work requests and automatically assign them to the most suitable available employee.



## 🌐 Live Demo

🚀 **Deployed Application:**  
```
https://spih-133.vercel.app
```

## 🚀 Features

- 🔮 Risk scoring for work requests
- 🧠 Intelligent employee routing
- 👥 Workforce capacity & workload monitoring
- ⚠️ Stress and risk detection
- 📊 Admin Command Center
- 📈 Risk trajectory visualization
- 🗄️ Supabase-powered data

## 🧠 How It Works

ForeSight evaluates:

- Department fit
- Employee stress
- Available capacity
- Current workload
- Request priority

It then calculates a routing score and assigns the request to the best available employee.

```text
Work Request
     ↓
Risk Evaluation
     ↓
Employee Analysis
     ↓
Routing Score
     ↓
Best Employee
     ↓
Admin Dashboard
````

## 🛠️ Tech Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* Supabase
* Framer Motion
* Recharts
* Lucide React

## ⚙️ Run Locally

### 1. Clone the repository

```bash
git clone <YOUR_REPO_URL>
cd foresight
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add environment variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

> ⚠️ Never commit your `.env.local` file or expose your Supabase service role key.

### 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## 🎯 Vision

Traditional dashboards tell you:

> **What happened?**

ForeSight helps organizations understand:

> **What is going wrong?**

> **Why is it happening?**

> **Who can act?**

### Predict. Explain. Act.

