# ML Experiment Tracker 🧪🤖

> **AI-Powered Research & Development Platform for Machine Learning Teams**

A comprehensive MERN stack application that helps ML engineers and researchers track, analyze, and optimize their machine learning experiments with the power of AI.

## 🌟 Key Features

### Core Functionality
- ✅ **Experiment Management**: Create, read, update, and delete ML experiments
- ✅ **Rich Schema**: Track models, datasets, hyperparameters, metrics, and training configurations
- ✅ **Advanced Filtering**: Search and filter by status, model type, and keywords
- ✅ **Data Visualization**: Interactive charts showing trends, comparisons, and distributions
- ✅ **Export Capabilities**: Export experiment data to CSV

### 🤖 AI-Powered Features (What Sets This Apart!)

1. **Automatic Experiment Insights**
   - AI analyzes every experiment and generates actionable recommendations
   - Detects overfitting, underfitting, and convergence issues
   - Compares with historical experiments to identify improvements

2. **Smart Hyperparameter Suggestions**
   - Suggests optimal hyperparameters based on successful past experiments
   - Contextual recommendations considering model type and dataset

3. **Natural Language Querying**
   - Ask questions in plain English: "What's my best performing model?"
   - Get instant answers about experiments without writing queries
   - Interactive AI chat interface for data exploration

4. **Anomaly Detection**
   - Automatically flags unusual experiment results
   - Identifies training issues before they become problems
   - Severity-based prioritization

5. **Comparative Analysis**
   - AI-generated reports comparing multiple experiments
   - Identifies key differences and their impacts
   - Suggests next steps for improvement

6. **Trend Analysis & Predictions**
   - Visualize performance trends over time
   - Track improvement rates
   - Hyperparameter correlation analysis

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐   │
│  │ Dashboard│ │ Exp Table│ │  Trends  │ │  AI Chat    │   │
│  └──────────┘ └──────────┘ └──────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│              Backend (Node.js + Express)                     │
│  ┌──────────────┐  ┌─────────────────────────────────┐     │
│  │  API Routes  │  │      AI Service Layer           │     │
│  │              │  │  • Gemini API Integration       │     │
│  │ • CRUD       │→ │  • Insight Generation           │     │
│  │ • Analytics  │  │  • NL Query Processing          │     │
│  │ • AI Endpoints  │  • Hyperparameter Suggestions   │     │
│  └──────────────┘  └─────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   MongoDB Atlas                              │
│  Collections: experiments (with AI insights embedded)       │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ and npm
- MongoDB Atlas account
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ml-experiment-tracker.git
cd ml-experiment-tracker
```

2. **Backend Setup**
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
EOF

# Start backend
npm run dev
```

3. **Frontend Setup**
```bash
cd ../frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start frontend
npm run dev
```

4. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 📝 API Documentation

### Experiments

#### GET /api/experiments
Get all experiments with optional filtering
```bash
# Get all experiments
curl http://localhost:5000/api/experiments

# Filter by status
curl http://localhost:5000/api/experiments?status=completed

# Filter by model type
curl http://localhost:5000/api/experiments?modelType=classification

# Search by name
curl http://localhost:5000/api/experiments?search=resnet
```

#### POST /api/experiments
Create a new experiment
```bash
curl -X POST http://localhost:5000/api/experiments \
  -H "Content-Type: application/json" \
  -d '{
    "experimentName": "ResNet50 v1",
    "description": "Image classification on CIFAR-10",
    "model": {
      "name": "ResNet50",
      "type": "computer-vision",
      "framework": "pytorch"
    },
    "dataset": {
      "name": "CIFAR-10",
      "size": 50000
    },
    "metrics": {
      "accuracy": 0.92,
      "loss": 0.24
    }
  }'
```

#### GET /api/experiments/:id
Get a single experiment by ID

#### PUT /api/experiments/:id
Update an experiment

#### DELETE /api/experiments/:id
Delete an experiment

### AI-Powered Endpoints

#### POST /api/experiments/:id/insights
Generate AI insights for an experiment
```bash
curl -X POST http://localhost:5000/api/experiments/EXPERIMENT_ID/insights
```

#### POST /api/query
Natural language query processing
```bash
curl -X POST http://localhost:5000/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "What is my best performing experiment?"}'
```

#### POST /api/suggest-hyperparameters
Get hyperparameter suggestions
```bash
curl -X POST http://localhost:5000/api/suggest-hyperparameters \
  -H "Content-Type: application/json" \
  -d '{
    "modelType": "classification",
    "dataset": {
      "name": "Custom Dataset",
      "size": 10000
    }
  }'
```

#### POST /api/compare
Generate comparative analysis report
```bash
curl -X POST http://localhost:5000/api/compare \
  -H "Content-Type: application/json" \
  -d '{"experimentIds": ["id1", "id2", "id3"]}'
```

#### GET /api/anomalies
Get detected anomalies across experiments

### Analytics Endpoints

#### GET /api/stats
Get dashboard statistics

#### GET /api/trends
Get metric trends over time
```bash
# Get accuracy trends for last 30 days
curl http://localhost:5000/api/trends?metric=accuracy&days=30

# Filter by model type
curl http://localhost:5000/api/trends?metric=accuracy&modelType=classification
```

## 🚢 Deployment

### Deploy to Vercel

#### Backend Deployment
```bash
cd backend
vercel

# Set environment variables in Vercel dashboard:
# - MONGODB_URI
# - GEMINI_API_KEY
# - FRONTEND_URL
```

#### Frontend Deployment
```bash
cd frontend
vercel

# Set environment variables:
# - VITE_API_URL (your backend URL)
```

### Alternative: Deploy to Railway/Render

Both services support Node.js and offer free tiers suitable for this project.

## 📊 How This Streamlines R&D Workflow

### Before: Manual Experiment Tracking
❌ Scattered notes in different files  
❌ No easy way to compare experiments  
❌ Manual analysis of what worked/didn't work  
❌ Difficult to share results with team  
❌ Lost context from previous experiments  

### After: ML Experiment Tracker
✅ **Centralized Repository**: All experiments in one place  
✅ **Instant Comparisons**: Visual charts and AI-powered analysis  
✅ **Automatic Insights**: AI tells you what worked and why  
✅ **Team Collaboration**: Shared database accessible to all  
✅ **Historical Context**: Learn from every past experiment  
✅ **Smart Recommendations**: AI suggests next steps  
✅ **Natural Language Search**: Find experiments by asking questions  

### Real-World Use Cases

1. **Hyperparameter Optimization**: Track which hyperparameters work best for your use case
2. **Model Selection**: Compare different model architectures side-by-side
3. **Dataset Analysis**: See how different datasets affect performance
4. **Debugging**: Identify patterns in failed experiments
5. **Knowledge Sharing**: Onboard new team members with experiment history
6. **Reproducibility**: Complete configuration tracking for paper submissions

## 🎓 Project Highlights (Why This Shows Effort)

### Advanced Features Demonstrating Skill

1. **Custom AI Integration**
   - Not just using API - custom prompting strategies for ML insights
   - Context-aware analysis considering experiment history
   - Structured output parsing for actionable recommendations

2. **Complex Data Modeling**
   - Flexible schema supporting multiple ML paradigms
   - Nested documents with proper indexing
   - Map data types for dynamic hyperparameters

3. **Sophisticated Frontend Architecture**
   - Multiple interactive views with state management
   - Real-time data visualization with Recharts
   - Responsive design with TailwindCSS

4. **Production-Ready Code**
   - Error handling and validation
   - API rate limiting considerations
   - Scalable architecture
   - Comprehensive documentation

5. **Real Business Value**
   - Solves actual ML engineering pain points
   - Measurable productivity improvements
   - Team collaboration features

## 🛠️ Technology Stack

**Frontend:**
- React 18 with Hooks
- Vite (fast build tool)
- TailwindCSS (utility-first styling)
- Recharts (data visualization)
- Lucide React (icons)

**Backend:**
- Node.js & Express
- MongoDB with Mongoose
- Google Gemini AI API
- RESTful API architecture

**Deployment:**
- Vercel (serverless functions)
- MongoDB Atlas (cloud database)

## 📈 Future Enhancements

- [ ] User authentication and team workspaces
- [ ] Real-time collaboration features
- [ ] Jupyter notebook integration
- [ ] MLflow/W&B integration
- [ ] Experiment templates
- [ ] Scheduled experiment reports
- [ ] Mobile app
- [ ] Advanced A/B testing features

## 🤝 Contributing

Contributions welcome! Please read CONTRIBUTING.md first.

## 📄 License

MIT License - see LICENSE file

## 👨‍💻 Author
Mohammed Aswath M

Created as an internship project demonstrating:
- Full-stack development skills
- AI/ML domain knowledge
- Production-ready code practices
- Real-world problem solving

## 🙏 Acknowledgments

- Google Gemini AI for powerful language models
- MongoDB for flexible data storage
- React and Node.js communities

---

**⭐ If this project helped you, please star the repository!**