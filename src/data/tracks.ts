import type { CareerTrack } from '../types';

// This file contains the TRACKS data objects.
export const TRACKS: CareerTrack[] = [
  {
    "id": "python-production-engineer",
    "title": "Become a Python Production Engineer",
    "description": "Master the complete Python ecosystem for production environments.",
    "imageUrl": "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
    "level": "Advanced",
    "tags": [
      "Career Track",
      "Top Rated"
    ],
    "outcomeStatement": "Master Python from base syntax to production-grade services, testing structures, database integrations, and automated pipelines.",
    "estimatedTime": "36 hours + 2 in-person sessions",
    "coursesCount": 6,
    "progress": 55,
    "enrolled": true,
    "selfAssessmentOptions": [
      "I Know Nothing",
      "I Know Basics",
      "I Have Experience"
    ],
    "milestones": [
      {
        "id": "py-mile-1",
        "title": "Python Basics",
        "description": "Core syntax.",
        "courses": [
          {
            "id": "python-bootcamp"
          },
          {
            "id": "test-course",
            "isOptional": true
          }
        ],
        "status": "active"
      },
      {
        "id": "py-mile-2",
        "title": "Version Control",
        "description": "Git essentials.",
        "courses": [
          {
            "id": "git-version-control"
          },
          {
            "id": "git-essentials"
          }
        ],
        "status": "locked"
      },
      {
        "id": "py-mile-3",
        "title": "Advanced Python",
        "description": "Metaprogramming.",
        "courses": [
          {
            "id": "advanced-python"
          },
          {
            "id": "fastapi-backend"
          },
          {
            "id": "apache-spark-basics"
          }
        ],
        "status": "locked"
      },
      {
        "id": "py-mile-4",
        "title": "Data Stack",
        "description": "Web APIs & DBs.",
        "courses": [
          {
            "id": "snowflake-data-warehouse"
          }
        ],
        "status": "locked"
      },
      {
        "id": "py-mile-5",
        "title": "Containerization",
        "description": "Dockerizing apps.",
        "courses": [
          {
            "id": "linux-administration"
          },
          {
            "id": "kubernetes-for-beginners"
          }
        ],
        "status": "locked"
      },
      {
        "id": "py-mile-6",
        "title": "CI/CD for Python",
        "description": "GitHub Actions.",
        "courses": [
          {
            "id": "ansible-configuration"
          },
          {
            "id": "monitoring-prometheus"
          },
          {
            "id": "kubernetes-advanced",
            "isOptional": true
          }
        ],
        "status": "locked"
      }
    ]
  },
  {
    "id": "cloud-devops-engineer",
    "title": "Become a Cloud & DevOps Engineer",
    "description": "Go from zero to production-ready infrastructure. Master containerisation, CI/CD automation, and cloud platform deployments used by modern engineering teams.",
    "imageUrl": "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=800&q=80",
    "level": "Intermediate",
    "tags": [
      "Career Track",
      "New"
    ],
    "outcomeStatement": "Design and operate cloud-native infrastructure pipelines using Docker, Kubernetes, Terraform, and GitHub Actions on AWS or Azure.",
    "estimatedTime": "42 hours + 3 in-person sessions",
    "coursesCount": 11,
    "enrolled": false,
    "progress": 0,
    "selfAssessmentOptions": [
      "Pure Beginner",
      "Some IT Background",
      "Junior Dev"
    ],
    "milestones": [
      {
        "id": "devops-mile-1",
        "title": "Prerequisites: Command Line",
        "description": "Bash scripting and terminal usage.",
        "courses": [
          {
            "id": "command-line-basics"
          },
          {
            "id": "git-essentials",
            "isOptional": true
          }
        ],
        "status": "active"
      },
      {
        "id": "devops-mile-2",
        "title": "Prerequisites: Version Control",
        "description": "Source code management.",
        "courses": [
          {
            "id": "git-version-control"
          }
        ],
        "status": "locked"
      },
      {
        "id": "devops-mile-3",
        "title": "Linux Administration",
        "description": "System administration basics.",
        "courses": [
          {
            "id": "linux-administration"
          },
          {
            "id": "apache-spark-basics",
            "isOptional": true
          }
        ],
        "status": "locked"
      },
      {
        "id": "devops-mile-4",
        "title": "Networking",
        "description": "TCP/IP and routing.",
        "courses": [
          {
            "id": "networking-fundamentals"
          }
        ],
        "status": "locked"
      },
      {
        "id": "devops-mile-5",
        "title": "Containerization",
        "description": "Docker basics.",
        "courses": [
          {
            "id": "docker-containers"
          },
          {
            "id": "kubernetes-for-beginners",
            "isOptional": true
          }
        ],
        "status": "locked"
      },
      {
        "id": "devops-mile-6",
        "title": "Kubernetes Foundations",
        "description": "Intro to K8s.",
        "courses": [
          {
            "id": "kubernetes-for-beginners"
          }
        ],
        "status": "locked"
      },
      {
        "id": "devops-mile-7",
        "title": "Advanced Kubernetes",
        "description": "Deep dive into K8s.",
        "courses": [
          {
            "id": "kubernetes-advanced"
          }
        ],
        "status": "locked"
      },
      {
        "id": "devops-mile-8",
        "title": "CI/CD Automation",
        "description": "Automating builds.",
        "courses": [
          {
            "id": "github-actions-automation"
          }
        ],
        "status": "locked"
      },
      {
        "id": "devops-mile-9",
        "title": "Infrastructure as Code",
        "description": "Terraform fundamentals.",
        "courses": [
          {
            "id": "terraform-iac-fundamentals"
          }
        ],
        "status": "locked"
      },
      {
        "id": "devops-mile-10",
        "title": "Configuration Management",
        "description": "Ansible.",
        "courses": [
          {
            "id": "ansible-configuration"
          }
        ],
        "status": "locked"
      },
      {
        "id": "devops-mile-11",
        "title": "Monitoring & Observability",
        "description": "Prometheus & Grafana.",
        "courses": [
          {
            "id": "monitoring-prometheus"
          }
        ],
        "status": "locked"
      }
    ]
  },
  {
    "id": "data-engineering-python-sql",
    "title": "Data Engineering with Python & SQL",
    "description": "Build robust data pipelines, warehouses, and transformation workflows. A hands-on track for engineers who want to work in the data stack.",
    "imageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    "level": "Intermediate",
    "tags": [
      "Career Track",
      "Intensive"
    ],
    "outcomeStatement": "Design ETL pipelines, model relational data warehouses, and deliver analytics-ready datasets using Python, SQL, dbt, and Apache Airflow.",
    "estimatedTime": "38 hours + 2 in-person sessions",
    "coursesCount": 6,
    "progress": 0,
    "enrolled": false,
    "selfAssessmentOptions": [
      "New to Data",
      "SQL User",
      "Python Programmer"
    ],
    "milestones": [
      {
        "id": "data-mile-1",
        "title": "SQL & Databases",
        "description": "Relational data.",
        "courses": [
          {
            "id": "sql-databases"
          }
        ],
        "status": "active"
      },
      {
        "id": "data-mile-2",
        "title": "Python for Data",
        "description": "Pandas & processing.",
        "courses": [
          {
            "id": "python-data-processing"
          }
        ],
        "status": "locked"
      },
      {
        "id": "data-mile-3",
        "title": "Big Data Processing",
        "description": "Spark and Hadoop.",
        "courses": [
          {
            "id": "apache-spark-basics"
          }
        ],
        "status": "locked"
      },
      {
        "id": "data-mile-4",
        "title": "Cloud Data Warehouse",
        "description": "Snowflake.",
        "courses": [
          {
            "id": "snowflake-data-warehouse"
          }
        ],
        "status": "locked"
      },
      {
        "id": "data-mile-5",
        "title": "ETL Orchestration",
        "description": "Airflow basics.",
        "courses": [
          {
            "id": "airflow-etl-automation"
          }
        ],
        "status": "locked"
      }
    ]
  },
  {
    "id": "intro-to-programming",
    "title": "Introduction to Programming",
    "description": "Start your coding journey with fundamental concepts.",
    "imageUrl": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    "level": "Foundation",
    "tags": [
      "Career Track",
      "Beginner Friendly"
    ],
    "outcomeStatement": "Learn basic programming concepts, write logic, and build simple applications from scratch.",
    "estimatedTime": "20 hours",
    "coursesCount": 3,
    "progress": 0,
    "enrolled": false,
    "selfAssessmentOptions": [
      "Pure Beginner",
      "Tried coding once",
      "Know some basics"
    ],
    "milestones": [
      {
        "id": "intro-mile-1",
        "title": "Programming Logic",
        "description": "Variables and loops.",
        "courses": [
          {
            "id": "python-bootcamp"
          }
        ],
        "status": "active"
      },
      {
        "id": "intro-mile-2",
        "title": "Data Structures",
        "description": "Arrays and objects.",
        "courses": [
          {
            "id": "sql-databases"
          }
        ],
        "status": "locked"
      },
      {
        "id": "intro-mile-3",
        "title": "First Project",
        "description": "Put it together.",
        "courses": [
          {
            "id": "git-version-control"
          }
        ],
        "status": "locked"
      }
    ]
  },
  {
    "id": "web-development-basics",
    "title": "Web Development Basics",
    "description": "Learn HTML, CSS, and JavaScript fundamentals.",
    "imageUrl": "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
    "level": "Foundation",
    "tags": [
      "Career Track",
      "Popular"
    ],
    "outcomeStatement": "Build responsive websites and understand the core technologies of the web.",
    "estimatedTime": "25 hours",
    "coursesCount": 3,
    "progress": 100,
    "enrolled": true,
    "selfAssessmentOptions": [
      "No HTML experience",
      "Can write simple HTML",
      "Know basic JS"
    ],
    "milestones": [
      {
        "id": "web-mile-1",
        "title": "HTML & CSS",
        "description": "Structure and styling.",
        "courses": [
          {
            "id": "command-line-basics"
          }
        ],
        "status": "active"
      },
      {
        "id": "web-mile-2",
        "title": "JavaScript Basics",
        "description": "Interactivity.",
        "courses": [
          {
            "id": "git-essentials"
          }
        ],
        "status": "locked"
      },
      {
        "id": "web-mile-3",
        "title": "Responsive Design",
        "description": "Mobile friendly.",
        "courses": [
          {
            "id": "linux-administration"
          }
        ],
        "status": "locked"
      }
    ]
  },
  {
    "id": "data-analytics-fundamentals",
    "title": "Data Analytics Fundamentals",
    "description": "Understand data analysis and visualization techniques.",
    "imageUrl": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "level": "Foundation",
    "tags": [
      "Career Track",
      "Data"
    ],
    "outcomeStatement": "Analyze datasets, create visualizations, and derive insights using basic tools.",
    "estimatedTime": "22 hours",
    "coursesCount": 3,
    "progress": 0,
    "enrolled": false,
    "selfAssessmentOptions": [
      "New to Data",
      "Excel user",
      "Basic SQL"
    ],
    "milestones": [
      {
        "id": "da-mile-1",
        "title": "Data Literacy",
        "description": "Understanding data types.",
        "courses": [
          {
            "id": "sql-databases"
          }
        ],
        "status": "active"
      },
      {
        "id": "da-mile-2",
        "title": "Basic SQL",
        "description": "Querying data.",
        "courses": [
          {
            "id": "python-data-processing"
          }
        ],
        "status": "locked"
      },
      {
        "id": "da-mile-3",
        "title": "Visualization",
        "description": "Creating charts.",
        "courses": [
          {
            "id": "apache-spark-basics"
          }
        ],
        "status": "locked"
      }
    ]
  },
  {
    "id": "fullstack-javascript",
    "title": "Full-stack JavaScript Developer",
    "description": "Master the MERN stack and build complete web applications.",
    "imageUrl": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    "level": "Intermediate",
    "tags": [
      "Career Track",
      "In Demand"
    ],
    "outcomeStatement": "Develop scalable frontends with React and robust backends with Node.js and Express.",
    "estimatedTime": "45 hours",
    "coursesCount": 4,
    "progress": 32,
    "enrolled": true,
    "selfAssessmentOptions": [
      "Know basic JS",
      "Know React",
      "Know Node.js"
    ],
    "milestones": [
      {
        "id": "fs-mile-1",
        "title": "Advanced JS",
        "description": "ES6 and beyond.",
        "courses": [
          {
            "id": "advanced-python"
          }
        ],
        "status": "active"
      },
      {
        "id": "fs-mile-2",
        "title": "React Frontend",
        "description": "UI development.",
        "courses": [
          {
            "id": "react-web-development"
          }
        ],
        "status": "locked"
      },
      {
        "id": "fs-mile-3",
        "title": "Node.js Backend",
        "description": "Server-side logic.",
        "courses": [
          {
            "id": "fastapi-backend"
          }
        ],
        "status": "locked"
      },
      {
        "id": "fs-mile-4",
        "title": "Database Integration",
        "description": "MongoDB connection.",
        "courses": [
          {
            "id": "sql-databases"
          }
        ],
        "status": "locked"
      }
    ]
  },
  {
    "id": "machine-learning-engineering",
    "title": "Machine Learning Engineer",
    "description": "Build, train, and deploy machine learning models.",
    "imageUrl": "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=800&q=80",
    "level": "Advanced",
    "tags": [
      "Career Track",
      "AI"
    ],
    "outcomeStatement": "Design neural networks, optimize models, and deploy AI services to production environments.",
    "estimatedTime": "50 hours",
    "coursesCount": 4,
    "progress": 0,
    "enrolled": false,
    "selfAssessmentOptions": [
      "Basic ML knowledge",
      "Can train a model",
      "Used TensorFlow/PyTorch"
    ],
    "milestones": [
      {
        "id": "ml-mile-1",
        "title": "Data Prep",
        "description": "Feature engineering.",
        "courses": [
          {
            "id": "python-data-processing"
          }
        ],
        "status": "active"
      },
      {
        "id": "ml-mile-2",
        "title": "Model Training",
        "description": "Neural networks.",
        "courses": [
          {
            "id": "apache-spark-basics"
          }
        ],
        "status": "locked"
      },
      {
        "id": "ml-mile-3",
        "title": "Optimization",
        "description": "Hyperparameter tuning.",
        "courses": [
          {
            "id": "advanced-python"
          }
        ],
        "status": "locked"
      },
      {
        "id": "ml-mile-4",
        "title": "MLOps Deployment",
        "description": "Serving models.",
        "courses": [
          {
            "id": "docker-containers"
          }
        ],
        "status": "locked"
      }
    ]
  },
  {
    "id": "software-architecture-patterns",
    "title": "Software Architecture Expert",
    "description": "Design highly scalable, distributed enterprise systems.",
    "imageUrl": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    "level": "Advanced",
    "tags": [
      "Career Track",
      "Leadership"
    ],
    "outcomeStatement": "Architect microservices, implement event-driven systems, and ensure high availability.",
    "estimatedTime": "40 hours",
    "coursesCount": 4,
    "progress": 0,
    "enrolled": false,
    "selfAssessmentOptions": [
      "Senior Developer",
      "Tech Lead",
      "Aspiring Architect"
    ],
    "milestones": [
      {
        "id": "arch-mile-1",
        "title": "System Design",
        "description": "Core principles.",
        "courses": [
          {
            "id": "fullstack-production-arch"
          }
        ],
        "status": "active"
      },
      {
        "id": "arch-mile-2",
        "title": "Microservices",
        "description": "Decoupling services.",
        "courses": [
          {
            "id": "kubernetes-advanced"
          }
        ],
        "status": "locked"
      },
      {
        "id": "arch-mile-3",
        "title": "Event-Driven Arch",
        "description": "Kafka & Queues.",
        "courses": [
          {
            "id": "apache-spark-basics"
          }
        ],
        "status": "locked"
      },
      {
        "id": "arch-mile-4",
        "title": "Cloud Native Patterns",
        "description": "Resilience & Scale.",
        "courses": [
          {
            "id": "terraform-iac-fundamentals"
          }
        ],
        "status": "locked"
      }
    ]
  }
];
