# HUniTalk

### WHERE HAIGAZIAN MINDS CONNECT

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Laravel](https://img.shields.io/badge/Laravel-FF2D20?logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://reactjs.org)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com)

---

## 🎓 Overview

**HUniTalk** is a centralized, university-exclusive academic collaboration platform designed specifically for Haigazian University students and faculty. It transforms fragmented academic discussions into a structured, organized knowledge hub—think Reddit meets Stack Overflow, tailored exclusively for academic excellence.

### The Problem We Solve

Students and faculty currently face significant challenges:
- 📱 **Information Overload**: Important discussions get lost in endless WhatsApp group threads
- 🔄 **Repeated Questions**: The same questions overwhelm groups semester after semester
- 📚 **Scattered Resources**: Academic materials are disorganized across multiple platforms
- 🔍 **No Searchability**: Past discussions are nearly impossible to find when needed

### Our Solution

HUniTalk provides a **single, structured hub** for academic Q&A and resources with:
- ✅ Verified university email authentication for security and accountability
- 🤖 AI-powered features for intelligent assistance and summaries
- 📋 Course-specific organization with smart tagging
- 🏆 Reputation system to recognize valuable contributions
- 💾 Personal knowledge management with saved notebooks

---

## ✨ Key Features

### 1. 🔐 Authentication & Profiles
- **University-Verified Access**: Login exclusively with official Haigazian University email and password
- **Email Verification**: Ensures authenticity and accountability within the academic community
- **Secure Profiles**: Build your academic reputation within a trusted environment

### 2. 📝 Knowledge Wall (Q&A System)
- **Central Q&A Hub**: Post and answer academic questions in a structured format
- **Rich Content Support**: Attach PNG, PDF, Word documents, or text with your questions
- **Discussion Threads**: Engage in meaningful conversations through nested comments
- **Voting System**: Upvote and downvote answers to surface the best solutions
- **Smart Tagging**: Organize posts by course code, major, and topic for easy discovery

### 3. 👥 Communities (Major-Specific Walls)
- **Dedicated Spaces**: Each major has its own community wall
- **Focused Discussions**: Computer Science students discuss algorithms, Psychology students explore theories
- **Collaborative Learning**: Connect with peers in your field of study

### 4. 🏆 Reputation System
- **Earn Recognition**: Gain points for active, helpful contributions
- **Leaderboards**: See top contributors and celebrate academic engagement
- **Badges & Achievements**: Unlock rewards for consistent participation

### 5. 🏷️ Course Tags & Smart Filtering
- **Course Code Labels**: Every post tagged with relevant course codes (e.g., CSC201, PSY210)
- **Smart Filters**: Quickly find discussions specific to your courses
- **Exam Period Ready**: Invaluable during finals when you need targeted information fast

### 6. 📖 Save to Notebook
- **Personal Bookmarks**: Save valuable Q&As for later reference
- **Favorites Page**: Quick access to your curated academic resources
- **Build Your Knowledge Base**: Create your personal study guide over time

### 7. 🤖 AI-Powered Features
- **AI Chatbot Assistant**: Trained on Haigazian-specific academic content
- **AI Answerer**: Transforms lengthy discussion threads into clear, concise summaries
- **Intelligent Search**: Find exactly what you need with AI-enhanced search
- **Smart Tagging**: Automatic content categorization for better organization

---

## 🛠️ Tech Stack

### Backend
- **Laravel**: Robust PHP framework for RESTful APIs
- **Redis**: High-performance job queueing for async operations
- **MySQL**: Reliable relational database for data persistence

### Frontend
- **ReactJS**: Modern, component-based UI library
- **Responsive Design**: Seamless experience across web and mobile devices

### Architecture
- **MVC Pattern**: Clean separation of concerns for maintainable code
- **RESTful APIs**: Well-structured endpoints for client-server communication
- **Microservices Ready**: Scalable architecture for future growth

### DevOps & Infrastructure
- **Docker**: Containerization for consistent development environments
- **Jenkins**: Continuous integration and deployment automation
- **Kubernetes**: Container orchestration for scalability
- **AWS**: Cloud infrastructure for reliable hosting

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **PHP** >= 8.1
- **Composer** >= 2.0
- **Node.js** >= 18.x and npm >= 9.x
- **MySQL** >= 8.0
- **Redis** >= 6.0
- **Docker** (optional but recommended)
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/Mahmoud-Al-Hajj/HUniTalk.git
cd HUniTalk
```

#### 2. Backend Setup (Laravel)

```bash
# Navigate to backend directory (adjust path if needed)
cd backend

# Install PHP dependencies
composer install

# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure your .env file with database credentials
# DB_DATABASE=hunitalk
# DB_USERNAME=your_username
# DB_PASSWORD=your_password

# Run database migrations
php artisan migrate

# Seed the database (optional)
php artisan db:seed

# Start Redis for job queueing
redis-server

# Start queue worker
php artisan queue:work

# Start the Laravel development server
php artisan serve
```

The backend API will be available at `http://localhost:8000`

#### 3. Frontend Setup (React)

```bash
# Navigate to frontend directory (adjust path if needed)
cd ../frontend

# Install Node.js dependencies
npm install

# Create environment file
cp .env.example .env

# Configure your .env file with API endpoint
# REACT_APP_API_URL=http://localhost:8000/api

# Start the React development server
npm start
```

The frontend will be available at `http://localhost:3000`

#### 4. Docker Setup (Alternative)

If you prefer using Docker for a streamlined setup:

```bash
# Build and start all services
docker-compose up -d

# Run migrations inside the container
docker-compose exec app php artisan migrate

# The application will be available at the configured ports
```

### Environment Configuration

Key environment variables to configure:

**Backend (.env)**
```env
APP_NAME=HUniTalk
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=hunitalk
DB_USERNAME=root
DB_PASSWORD=

REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=smtp.haigazian.edu.lb
MAIL_PORT=587
# Configure university email settings for verification

AI_API_KEY=your_ai_api_key
# Configure AI service credentials
```

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_NAME=HUniTalk
```

---

## 📖 Usage Examples

### Creating an Account

1. Navigate to the registration page
2. Enter your **Haigazian University email** (e.g., `student@haigazian.edu.lb`)
3. Choose a secure password
4. Verify your email through the link sent to your university inbox
5. Complete your profile with your major and year

### Posting a Question

1. Click the **"Ask Question"** button on the Knowledge Wall
2. Write a clear, descriptive title
3. Add detailed context in the question body
4. Attach any relevant files (PDF, images, documents)
5. Tag your question with:
   - **Course code** (e.g., CSC201)
   - **Major** (e.g., Computer Science)
   - **Topic** (e.g., Data Structures)
6. Submit and wait for the community to respond

### Using Course Tags and Filters

1. On the main feed, look for the **filter sidebar**
2. Select your course code (e.g., "CSC201 - Data Structures")
3. View only discussions relevant to that course
4. Apply multiple filters to narrow down results
5. Save your filter preferences for quick access

### Saving to Notebook

1. Find a helpful Q&A post
2. Click the **bookmark icon** or "Save" button
3. Access your saved items from the **"My Notebook"** page
4. Organize saved posts by course or topic
5. Review your notebook when studying for exams

### Using AI Features

- **AI Assistant**: Click the chatbot icon to ask questions about university policies, course content, or general academic help
- **AI Summarizer**: On lengthy discussion threads, click "Get AI Summary" to receive a concise overview
- **Smart Search**: The search bar uses AI to understand your query intent and surface the most relevant results

---

## 📁 Project Structure

```
HUniTalk/
├── backend/                 # Laravel backend application
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/ # API controllers
│   │   │   └── Middleware/  # Custom middleware
│   │   ├── Models/          # Eloquent models
│   │   └── Services/        # Business logic layer
│   ├── database/
│   │   ├── migrations/      # Database migrations
│   │   └── seeders/         # Database seeders
│   ├── routes/
│   │   ├── api.php          # API routes
│   │   └── web.php          # Web routes
│   └── tests/               # Backend tests
│
├── frontend/                # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── utils/           # Utility functions
│   │   └── App.js           # Main app component
│   └── package.json
│
├── docker-compose.yml       # Docker configuration
├── .env.example             # Environment template
├── LICENSE                  # License file
└── README.md               # This file
```

---

## 🤝 Contributing

We welcome contributions from the Haigazian University community! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
   ```bash
   git clone https://github.com/your-username/HUniTalk.git
   ```
3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** following our coding standards
5. **Test your changes** thoroughly
6. **Commit with clear messages**
   ```bash
   git commit -m "Add: Brief description of your feature"
   ```
7. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request** with a detailed description

### Coding Standards

- Follow **PSR-12** coding standards for PHP/Laravel
- Use **ESLint** and **Prettier** for JavaScript/React
- Write meaningful commit messages
- Include tests for new features
- Update documentation as needed

### Code of Conduct

We are committed to providing a welcoming and inclusive environment. Please:
- Be respectful and constructive in discussions
- Help maintain a positive learning atmosphere
- Report any inappropriate behavior to maintainers
- Focus on what's best for the Haigazian community

---

## 📚 Support & Documentation

### Getting Help

- **Technical Issues**: Open an issue on [GitHub Issues](https://github.com/Mahmoud-Al-Hajj/HUniTalk/issues)
- **Feature Requests**: Submit via GitHub Issues with the "enhancement" label
- **General Questions**: Use the Discussions tab on GitHub

### Documentation

- **API Documentation**: Available at `/docs/api` when running the backend
- **User Guide**: Check the `/docs` directory for detailed guides
- **FAQs**: See common questions answered in [Wiki](https://github.com/Mahmoud-Al-Hajj/HUniTalk/wiki)

### Reporting Issues

When reporting bugs, please include:
1. **Description**: Clear explanation of the issue
2. **Steps to Reproduce**: How to recreate the problem
3. **Expected Behavior**: What should happen
4. **Actual Behavior**: What actually happens
5. **Environment**: OS, browser, versions
6. **Screenshots**: If applicable

### Contact Maintainers

- **Project Lead**: Mahmoud Al-Hajj
- **Email**: [mah06.hajj@gmail.com](mailto:mah06.hajj@gmail.com)
- **GitHub**: [@Mahmoud-Al-Hajj](https://github.com/Mahmoud-Al-Hajj)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### Third-Party Licenses

HUniTalk uses several open-source packages. We are grateful to the maintainers:
- Laravel Framework
- React Library
- Redis
- MySQL
- And many other dependencies listed in `composer.json` and `package.json`

---

## 👥 Maintainers

**HUniTalk Development Team**

- **Mahmoud Al-Hajj** - *Project Lead & Developer*
  - GitHub: [@Mahmoud-Al-Hajj](https://github.com/Mahmoud-Al-Hajj)

### Acknowledgments

- **Haigazian University** - For inspiring this project and supporting student innovation
- **Haigazian CS Department** - For guidance and academic support
- **Student Community** - For feedback and feature suggestions
- **Open Source Community** - For the amazing tools that make this possible

---

## 🗺️ Roadmap

We're constantly improving HUniTalk. Here's what's coming:

### Phase 1: Foundation (Current)
- [x] Core Q&A functionality
- [x] University email verification
- [x] Course tagging system
- [x] Basic AI integration

### Phase 2: Enhancement (In Progress)
- [ ] Mobile applications (iOS & Android)
- [ ] Real-time notifications
- [ ] Advanced AI features
- [ ] File preview and annotation
- [ ] Study group formation tools

### Phase 3: Scale (Planned)
- [ ] Multi-language support (Arabic & English)
- [ ] Video content support
- [ ] Live tutoring sessions
- [ ] Integration with university LMS
- [ ] Advanced analytics dashboard

### Phase 4: Innovation (Future)
- [ ] Voice-to-text for questions
- [ ] Collaborative document editing
- [ ] Peer-to-peer tutoring marketplace
- [ ] Academic paper collaboration tools
- [ ] Virtual study rooms

### Have Ideas?
We'd love to hear your suggestions! Open an issue with the "feature request" label or join our discussions.

---

## 🌟 Why HUniTalk?

### For Students
- 📖 **Never lose important information** in chat scrolls again
- 🎯 **Find answers quickly** with smart search and filters
- 🤝 **Connect with peers** in your major and courses
- 🏆 **Build your reputation** through helpful contributions
- 📱 **Access anywhere** on web or mobile

### For Faculty
- 📊 **Identify common struggles** across courses
- ⏰ **Save time** by reducing repeated questions
- 👁️ **Monitor discussions** to improve teaching
- 🔗 **Share resources** in an organized manner
- 🤖 **Leverage AI** for better student support

### For the University
- 🔒 **Secure platform** exclusive to verified users
- 📈 **Track engagement** and learning trends
- 💡 **Foster innovation** in academic collaboration
- 🌍 **Build community** beyond physical classrooms
- 🎓 **Enhance learning** outcomes through technology

---

## 💬 Join the Conversation

HUniTalk is more than a platform—it's a movement to transform how Haigazian students collaborate and learn. Join us in building the future of academic communication!

- ⭐ **Star this repository** if you find it useful
- 🍴 **Fork it** to contribute your ideas
- 📢 **Share it** with fellow Haigazian students
- 💪 **Contribute** to make it even better

---

<div align="center">

**Made with ❤️ by Haigazian Students, for Haigazian Students**

[Report Bug](https://github.com/Mahmoud-Al-Hajj/HUniTalk/issues) · [Request Feature](https://github.com/Mahmoud-Al-Hajj/HUniTalk/issues) · [Documentation](https://github.com/Mahmoud-Al-Hajj/HUniTalk/wiki)

</div>
